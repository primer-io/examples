import Heading from '@theme/Heading';
import type { ReactNode } from 'react';
import styles from './beta-program.module.css';

export default function BetaAccess(): ReactNode {
  return (
    <section className={styles.beta} id='join'>
      <div className='container'>
        <div className='row'>
          <div className='col'>
            <Heading as='h2'>Join the Composable Checkout Beta Program</Heading>
            <p className={styles.betaDescription}>
              We're currently running a beta program for Composable Checkout to
              gather valuable feedback and refine the product before general
              release. Selected participants get early access to our technology
              and have a direct impact on the future of checkout experiences.
            </p>

            <div className={styles.betaGrid}>
              <div className={styles.betaCard}>
                <Heading as='h3'>Direct Engineering Support</Heading>
                <p>
                  Get personalized implementation assistance from our
                  engineering team throughout your integration journey.
                </p>
              </div>

              <div className={styles.betaCard}>
                <Heading as='h3'>Early Access to Features</Heading>
                <p>
                  Preview and test upcoming features before they're available to
                  the general public.
                </p>
              </div>

              <div className={styles.betaCard}>
                <Heading as='h3'>Priority Support</Heading>
                <p>
                  Receive dedicated support with faster response times and
                  implementation guidance.
                </p>
              </div>

              <div className={styles.betaCard}>
                <Heading as='h3'>Shape Our Roadmap</Heading>
                <p>
                  Your feedback directly influences our product direction and
                  feature prioritization.
                </p>
              </div>
            </div>

            <p className={styles.betaNote}>
              We're currently manually selecting participants for our beta
              program. If you're interested in joining, please contact your
              Primer representative for more information.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
