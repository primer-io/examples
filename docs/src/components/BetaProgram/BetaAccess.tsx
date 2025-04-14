import Heading from '@theme/Heading';
import { Icon } from '@iconify/react';
import type { ReactNode } from 'react';
import styles from './pilot-program.module.css';

export default function BetaAccess(): ReactNode {
  return (
    <section className={styles.beta} id='join'>
      <div className='container'>
        <div className={styles.sectionHeader}>
          <Heading as='h2'>Join the Pilot Program</Heading>
          <p>Get early access and shape the product's future</p>
        </div>

        <p className={styles.betaDescription}>
          We're currently running a beta program for Checkout Components to
          gather valuable feedback and refine the product before general
          release. Selected participants get early access to our technology and
          have a direct impact on the future of checkout experiences.
        </p>

        <div className={styles.betaGrid}>
          <div className={styles.betaCard}>
            <div className={styles.cardIcon}>
              <Icon icon='mdi:headset' width='28' height='28' />
            </div>
            <Heading as='h3'>Direct Engineering Support</Heading>
            <p>
              Get personalized implementation assistance from our engineering
              team throughout your integration journey.
            </p>
          </div>

          <div className={styles.betaCard}>
            <div className={styles.cardIcon}>
              <Icon icon='mdi:rocket-launch' width='28' height='28' />
            </div>
            <Heading as='h3'>Early Access to Features</Heading>
            <p>
              Preview and test upcoming features before they're available to the
              general public.
            </p>
          </div>

          <div className={styles.betaCard}>
            <div className={styles.cardIcon}>
              <Icon icon='mdi:star' width='28' height='28' />
            </div>
            <Heading as='h3'>Priority Support</Heading>
            <p>
              Receive dedicated support with faster response times and
              implementation guidance.
            </p>
          </div>

          <div className={styles.betaCard}>
            <div className={styles.cardIcon}>
              <Icon icon='mdi:map-marker-path' width='28' height='28' />
            </div>
            <Heading as='h3'>Shape Our Roadmap</Heading>
            <p>
              Your feedback directly influences our product direction and
              feature prioritization.
            </p>
          </div>
        </div>

        <div className={styles.betaCalloutContent}>
          <div className={styles.betaBanner}>
            <span>JOIN US</span>
          </div>
          <p>
            We're currently manually selecting participants for our Pilot
            Program. If you're interested in joining, please contact your Primer
            representative for more information.
          </p>
        </div>
      </div>
    </section>
  );
}
