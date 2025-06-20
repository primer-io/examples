import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import styles from './ComponentConfigModal.module.css';

interface Component {
  id: string;
  label: string;
  type: string;
  placeholder?: string;
  ariaLabel?: string;
  buttonText?: string;
}

interface ComponentConfigModalProps {
  component: Component | null;
  onUpdate: (component: Component) => void;
  onClose: () => void;
}

export default function ComponentConfigModal({
  component,
  onUpdate,
  onClose,
}: ComponentConfigModalProps): ReactNode {
  const [formData, setFormData] = useState({
    label: component?.label || '',
    placeholder: component?.placeholder || '',
    ariaLabel: component?.ariaLabel || '',
    buttonText: component?.buttonText || '',
  });

  useEffect(() => {
    if (component) {
      setFormData({
        label: component.label || '',
        placeholder: component.placeholder || '',
        ariaLabel: component.ariaLabel || '',
        buttonText: component.buttonText || '',
      });
    }
  }, [component]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (component) {
      onUpdate({ ...component, ...formData });
    }
  };

  if (!component) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3 className={styles.title}>Configure {component.label}</h3>
        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Label:</label>
            <input
              type='text'
              value={formData.label}
              onChange={(e) =>
                setFormData({ ...formData, label: e.target.value })
              }
              className={styles.input}
            />
          </div>

          {component.type !== 'submit' && (
            <div className={styles.field}>
              <label className={styles.label}>Placeholder:</label>
              <input
                type='text'
                value={formData.placeholder}
                onChange={(e) =>
                  setFormData({ ...formData, placeholder: e.target.value })
                }
                className={styles.input}
              />
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label}>Aria Label:</label>
            <input
              type='text'
              value={formData.ariaLabel}
              onChange={(e) =>
                setFormData({ ...formData, ariaLabel: e.target.value })
              }
              className={styles.input}
            />
          </div>

          {component.type === 'submit' && (
            <div className={styles.field}>
              <label className={styles.label}>Button Text:</label>
              <input
                type='text'
                value={formData.buttonText}
                onChange={(e) =>
                  setFormData({ ...formData, buttonText: e.target.value })
                }
                className={styles.input}
              />
            </div>
          )}

          <div className={styles.actions}>
            <button
              type='button'
              onClick={onClose}
              className={`${styles.button} ${styles.cancelButton}`}
            >
              Cancel
            </button>
            <button
              type='submit'
              className={`${styles.button} ${styles.submitButton}`}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
