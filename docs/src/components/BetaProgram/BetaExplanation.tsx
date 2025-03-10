import Heading from '@theme/Heading';
import { Icon } from '@iconify/react';
import type { ReactNode } from 'react';
import styles from './beta-program.module.css';

export default function BetaExplanation(): ReactNode {
  return (
    <section className={styles.betaExplanation} id='about'>
      <div className='container'>
        <div className={styles.sectionHeader}>
          <Heading as='h2'>About the Beta Program</Heading>
          <p>A significant evolution in checkout technology</p>
        </div>

        <p className={styles.betaExplanationText}>
          Composable Checkout represents a significant evolution in our checkout
          technology, currently in beta development. We're actively refining the
          product based on real-world feedback while expanding its capabilities.
          This beta program gives you early access to this powerful technology
          while allowing you to directly influence its development.
        </p>

        <div className={styles.betaExplanationGrid}>
          <div className={styles.betaExplanationCard}>
            <div className={styles.cardIcon}>
              <Icon icon='mdi:check-circle' width='28' height='28' />
            </div>
            <Heading as='h3'>What Will Not Change</Heading>
            <ul>
              <li>
                <strong>Technology Foundation</strong> - Our core architecture
                using Web Components and Lit will remain consistent throughout
                development
              </li>
              <li>
                <strong>Design Philosophy</strong> - Our approach to layouting,
                theming, and styling principles will stay consistent
              </li>
              <li>
                <strong>Slot-Based Composition</strong> - The powerful slot
                system that enables flexible content arrangement will remain a
                foundational feature
              </li>
              <li>
                <strong>Core Component Architecture</strong> - The fundamental
                checkout components and their roles within the system will be
                maintained
              </li>
              <li>
                <strong>CSS Custom Properties</strong> - The theming approach
                using CSS variables will continue to be the primary styling
                mechanism
              </li>
            </ul>
          </div>

          <div className={styles.betaExplanationCard}>
            <div className={styles.cardIcon}>
              <Icon icon='mdi:refresh' width='28' height='28' />
            </div>
            <Heading as='h3'>What Might Evolve</Heading>
            <ul>
              <li>
                <strong>Variable Naming</strong> - CSS variable names and
                JavaScript property names may be refined for clarity and
                consistency
              </li>
              <li>
                <strong>Component Naming</strong> - Some component names might
                be adjusted to better reflect their purpose and functionality
              </li>
              <li>
                <strong>API Refinements</strong> - Method signatures, event
                payloads, and property structures may evolve based on developer
                feedback
              </li>
              <li>
                <strong>Visual Defaults</strong> - Default styling and theme
                values may be enhanced for better out-of-box appearance
              </li>
              <li>
                <strong>Additional Features</strong> - New capabilities will be
                added as we expand the component library
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.betaExplanationFooter}>
          Our development roadmap focuses on{' '}
          <strong>expanding capabilities</strong> rather than removing
          functionality. As a beta participant, you'll have a direct channel to
          our engineering team and the opportunity to shape the future of
          Composable Checkout before its general release.
        </div>
      </div>
    </section>
  );
}
