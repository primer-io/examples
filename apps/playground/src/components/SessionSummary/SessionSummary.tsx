import { Span } from '@primer-io/goat';
import { FC } from 'react';
import { formatValuesToString } from '../../utils/formatValuesToString.ts';
import { CopyIconButton } from '../ClickToCopy';
import styles from './SessionSummary.module.scss';

interface SummaryProps {
  entries: {
    name: string;
    value?: string | unknown | boolean;
  }[];
}

export const SessionSummary: FC<SummaryProps> = ({ entries }) => {
  return (
    <dl className={styles.summary}>
      {entries.map(({ name, value }) => {
        const stringValue = formatValuesToString(value);
        return (
          <div key={name} className={styles.summaryRow}>
            <dt className={styles.title}>{name}</dt>
            <dl className={styles.value}>
              <Span className={styles.text}>{stringValue}</Span>
              <CopyIconButton value={stringValue} />
            </dl>
          </div>
        );
      })}
    </dl>
  );
};
