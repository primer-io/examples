import Heading from '@theme/Heading';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import styles from './beta-program.module.css';

export default function BetaHeader(): ReactNode {
  return (
    <header className={clsx('hero', styles.betaPageHeader)}>
      <div className='container'>
        <div className={styles.heroContent}>
          <div className={styles.heroTextFull}>
            <Heading as='h1' className={styles.heroTitle}>
              Join Composable Checkout Beta Program
            </Heading>
            <p className={styles.heroSubtitle}>
              and help shape the future of
              <span className={styles.highlight}> checkout experiences</span>
            </p>
          </div>
        </div>
      </div>
      <div className={styles.heroBgPattern}></div>
    </header>
  );
}
