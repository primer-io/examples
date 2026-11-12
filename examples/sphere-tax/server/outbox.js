// The queue of writes to Sphere: sales, credit notes and cancellations. A write is saved before
// it is sent, so a Sphere outage or a restart does not drop it.
import * as db from './db.js';
import * as sphere from './sphere.js';

// Sends one queued write to Sphere. Returns the write's status, or null if there is none.
// A Sphere error never throws: it is recorded on the row.
export async function flushWrite(externalId) {
  const write = db.getWrite(externalId);
  if (!write || write.status !== 'PENDING') return write?.status ?? null;
  // Claim it, so the worker does not send the same write while this call is in flight.
  if (!db.claimWrite(externalId, 60_000)) return 'PENDING';

  try {
    const body = JSON.parse(write.body);
    if (write.kind === 'cancel') {
      await sphere.cancelTransaction(body.external_id);
    } else {
      await sphere.postTransaction(body);
    }
  } catch (err) {
    if (!(err instanceof sphere.SphereError)) throw err;
    if (sphere.isRetryableWrite(err)) {
      // Sphere may have recorded it anyway. The retry carries the same external_id.
      if (err.status === 401 || err.status === 403) {
        console.error(
          `SPHERE_AUTH_FAILED ${externalId} status ${err.status}: check SPHERE_API_KEY`,
        );
      }
      const backoff = Math.min(
        5_000 * 2 ** Math.min(write.attempts, 20),
        600_000,
      );
      const delay = Math.max(err.retryAfterMs, backoff);
      db.retryWriteLater(externalId, delay, err.message);
      return 'PENDING';
    }
    console.error(
      `SPHERE_WRITE_FAILED ${externalId} status ${err.status} code ${err.code ?? 'none'}: ${err.message}`,
    );
    db.finishWrite(externalId, 'FAILED', err.message);
    return 'FAILED';
  }
  db.finishWrite(externalId, 'DONE');
  return 'DONE';
}
