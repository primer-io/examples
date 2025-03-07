import React from 'react';
import styles from './beta-program.module.css';
import clsx from 'clsx';

interface FeatureStatusIndicatorProps {
  status:
    | 'complete'
    | 'nearlyComplete'
    | 'inProgress'
    | 'earlyDevelopment'
    | 'planned';
  completion: number;
  statusText: string;
}

export default function FeatureStatusIndicator({
  status,
  completion,
  statusText,
}: FeatureStatusIndicatorProps): React.ReactElement {
  // Get status icon based on status
  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'complete':
        return '✅';
      case 'nearlyComplete':
        return '🔜';
      case 'inProgress':
        return '🚧';
      case 'earlyDevelopment':
        return '🏗️';
      case 'planned':
        return '📋';
      default:
        return '';
    }
  };

  // Get the status color class based on completion
  const getStatusColorClass = (status: string): string => {
    switch (status) {
      case 'complete':
        return styles.statusComplete;
      case 'nearlyComplete':
        return styles.statusNearlyComplete;
      case 'inProgress':
        return styles.statusInProgress;
      case 'earlyDevelopment':
        return styles.statusEarlyDevelopment;
      case 'planned':
        return styles.statusPlanned;
      default:
        return '';
    }
  };

  return (
    <div className={styles.progressStatus}>
      <div className={styles.progressBar}>
        <div
          className={clsx(styles.progressBarFill, getStatusColorClass(status))}
          style={{ width: `${completion}%` }}
        ></div>
      </div>
      <span className={clsx(styles.statusText)}>
        {getStatusIcon(status)} {statusText}
      </span>
    </div>
  );
}
