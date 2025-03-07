import Heading from '@theme/Heading';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import styles from './beta-program.module.css';

export default function BetaHeader(): ReactNode {
  return (
    <header className={clsx('hero hero--primary', styles.betaPageHeader)}>
      <div className='container'>
        <Heading as='h1' className='hero__title'>
          Beta Program
        </Heading>
        <p className='hero__subtitle'>
          Join the Composable Checkout Beta and help shape the future of
          checkout experiences
        </p>

        {/* In-page navigation */}
        <div className={styles.inPageNav}>
          <a href='#progress' className={styles.navLink}>
            Implementation Progress
          </a>
          <a href='#about' className={styles.navLink}>
            About the Beta
          </a>
          <a href='#join' className={styles.navLink}>
            Join the Program
          </a>
        </div>
      </div>
    </header>
  );
}
