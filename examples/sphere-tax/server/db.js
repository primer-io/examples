// SQLite through node:sqlite. Everything here is synchronous, so a function that reads and
// then writes without an await in between cannot be interleaved with another request.
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { config } from './config.js';

if (config.dbPath !== ':memory:') {
  fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });
}
const db = new DatabaseSync(config.dbPath);

// orders.data is the order as JSON (address, tax quote, payment id). The columns next to it are
// the ones we query on. sphere_writes is the queue of sales, credit notes and cancellations
// still to be recorded in Sphere. It is keyed by external_id for sales and credit notes, and by
// <orderId>-cancel for cancellations.
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT,
    updated_at TEXT
  );
  CREATE TABLE IF NOT EXISTS refunds (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    amount INTEGER,
    allocation TEXT,
    status TEXT,
    created_at TEXT
  );
  CREATE TABLE IF NOT EXISTS sphere_writes (
    external_id TEXT PRIMARY KEY,
    order_id TEXT,
    kind TEXT,
    body TEXT NOT NULL,
    status TEXT NOT NULL,
    attempts INTEGER DEFAULT 0,
    next_attempt_at TEXT,
    last_error TEXT,
    updated_at TEXT
  );
`);

const now = () => new Date().toISOString();

// Runs fn, which must be synchronous, as one unit: all of its writes happen or none do.
export function transaction(fn) {
  db.exec('BEGIN');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

// Orders

const toOrder = (row) =>
  row && {
    ...JSON.parse(row.data),
    id: row.id,
    status: row.status,
    createdAt: row.created_at,
  };

export function getOrder(id) {
  return toOrder(db.prepare('SELECT * FROM orders WHERE id = ?').get(id));
}

export function listOrders(status) {
  return db
    .prepare('SELECT * FROM orders WHERE status = ? ORDER BY created_at')
    .all(status)
    .map(toOrder);
}

// Insert or replace. id, status and createdAt are columns, the rest is stored as JSON.
export function saveOrder(order) {
  const { id, status, createdAt, ...data } = order;
  const time = now();
  db.prepare(
    `INSERT INTO orders (id, data, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       data = excluded.data, status = excluded.status, updated_at = excluded.updated_at`,
  ).run(id, JSON.stringify(data), status, createdAt ?? time, time);
}

// Refunds

const toRefund = (row) =>
  row && {
    id: row.id,
    orderId: row.order_id,
    amount: row.amount,
    allocation: JSON.parse(row.allocation),
    status: row.status,
    createdAt: row.created_at,
  };

export function getRefund(id) {
  return toRefund(db.prepare('SELECT * FROM refunds WHERE id = ?').get(id));
}

export function listRefunds(orderId) {
  return db
    .prepare('SELECT * FROM refunds WHERE order_id = ? ORDER BY rowid')
    .all(orderId)
    .map(toRefund);
}

export function listRefundsByStatus(statuses) {
  const marks = statuses.map(() => '?').join(', ');
  return db
    .prepare(
      `SELECT * FROM refunds WHERE status IN (${marks}) ORDER BY created_at`,
    )
    .all(...statuses)
    .map(toRefund);
}

export function insertRefund({ id, orderId, amount, allocation, status }) {
  db.prepare(
    `INSERT INTO refunds (id, order_id, amount, allocation, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(id, orderId, amount, JSON.stringify(allocation), status, now());
}

// Only a refund still waiting for Primer's answer moves to REFUND_PENDING. A slow request must
// not overwrite a status the worker has set since.
export function markRefundPending(id) {
  db.prepare(
    "UPDATE refunds SET status = 'REFUND_PENDING' WHERE id = ? AND status = 'REQUESTED'",
  ).run(id);
}

export function setRefundStatus(id, status) {
  db.prepare('UPDATE refunds SET status = ? WHERE id = ?').run(status, id);
}

// Sphere writes

export function getWrite(externalId) {
  return db
    .prepare('SELECT * FROM sphere_writes WHERE external_id = ?')
    .get(externalId);
}

// Two inserts with the same external_id would be the same write, so the second is ignored.
export function insertWrite({ externalId, orderId, kind, body }) {
  const time = now();
  db.prepare(
    `INSERT OR IGNORE INTO sphere_writes
       (external_id, order_id, kind, body, status, attempts, next_attempt_at, updated_at)
     VALUES (?, ?, ?, ?, 'PENDING', 0, ?, ?)`,
  ).run(externalId, orderId, kind, JSON.stringify(body), time, time);
}

export function listDueWrites() {
  return db
    .prepare(
      `SELECT * FROM sphere_writes
       WHERE status = 'PENDING' AND next_attempt_at <= ? ORDER BY next_attempt_at`,
    )
    .all(now());
}

// Takes a write for sending by pushing next_attempt_at forward, so the worker does not send the
// same write at the same time. A crash mid-send makes it due again when the lease ends.
// Returns false if the write is not PENDING and due, which means someone else has it.
export function claimWrite(externalId, ms) {
  const { changes } = db
    .prepare(
      `UPDATE sphere_writes SET next_attempt_at = ?, updated_at = ?
       WHERE external_id = ? AND status = 'PENDING' AND next_attempt_at <= ?`,
    )
    .run(new Date(Date.now() + ms).toISOString(), now(), externalId, now());
  return changes === 1;
}

export function hasPendingWrite(orderId, kind) {
  return Boolean(
    db
      .prepare(
        `SELECT 1 FROM sphere_writes WHERE order_id = ? AND kind = ? AND status = 'PENDING'`,
      )
      .get(orderId, kind),
  );
}

// Puts a FAILED write back in the queue, due now.
export function resetWrite(externalId) {
  const time = now();
  db.prepare(
    `UPDATE sphere_writes
     SET status = 'PENDING', attempts = 0, next_attempt_at = ?, last_error = NULL, updated_at = ?
     WHERE external_id = ?`,
  ).run(time, time, externalId);
}

export function finishWrite(externalId, status, lastError = null) {
  db.prepare(
    `UPDATE sphere_writes SET status = ?, last_error = ?, updated_at = ? WHERE external_id = ?`,
  ).run(status, lastError, now(), externalId);
}

export function retryWriteLater(externalId, delayMs, lastError) {
  db.prepare(
    `UPDATE sphere_writes
     SET attempts = attempts + 1, next_attempt_at = ?, last_error = ?, updated_at = ?
     WHERE external_id = ?`,
  ).run(
    new Date(Date.now() + delayMs).toISOString(),
    lastError,
    now(),
    externalId,
  );
}
