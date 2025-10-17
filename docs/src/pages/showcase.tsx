import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { Icon } from '@iconify/react';

import styles from './showcase.module.css';

function ShowcaseHeader() {
  return (
    <header className={clsx('hero', styles.showcaseHeader)}>
      <div className='container'>
        <div className={styles.showcaseHeaderContent}>
          <Heading as='h1' className={styles.showcaseTitle}>
            Primer Checkout Showcase
          </Heading>
          <p className={styles.showcaseSubtitle}>
            Explore practical examples of Primer Checkout implementations
          </p>
        </div>
      </div>
      <div className={styles.showcaseBgPattern}></div>
    </header>
  );
}

function ShowcaseDisclaimer() {
  return (
    <section className={styles.showcaseDisclaimer}>
      <div className='container'>
        <div className={styles.disclaimerCard}>
          <div className={styles.disclaimerHeader}>
            <Icon
              icon='mdi:information-outline'
              className={styles.disclaimerIcon}
            />
            <Heading as='h3' className={styles.disclaimerTitle}>
              StackBlitz Showcase Environment Requirements
            </Heading>
          </div>
          <div className={styles.disclaimerContent}>
            <div className={styles.disclaimerSection}>
              <p>
                <strong>StackBlitz Showcase Environment:</strong> These
                interactive examples run in StackBlitz, which has browser
                compatibility requirements. For the best showcase experience,
                use <strong>Chromium-based browsers</strong> (Chrome, Edge,
                Brave). Safari support is limited to version 16.4+ and Firefox
                may have reduced functionality in the StackBlitz environment.
              </p>
            </div>
            <div className={styles.disclaimerSection}>
              <p>
                <strong>Payment Method Limitations:</strong> Some payment
                methods like <strong>Google Pay</strong> and{' '}
                <strong>Apple Pay</strong> may not work properly in these
                StackBlitz showcases due to cross-origin restrictions. These are{' '}
                <strong>StackBlitz environment limitations only</strong> -
                Primer Checkout works fully in production environments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ShowcaseExamples() {
  return (
    <section className={styles.showcaseExamples}>
      <div className='container'>
        {/* Basic Checkout Implementation */}
        <div className={styles.showcaseExample}>
          <div className={styles.exampleContent}>
            <Heading as='h2' className={styles.exampleTitle}>
              Basic Checkout Implementation
            </Heading>
            <p className={styles.exampleDescription}>
              A minimal checkout implementation using web components. Features a
              style toggle to demonstrate CSS variable customization in
              real-time.
            </p>
            <p className={styles.exampleDescription}>
              This foundational example shows how little code is needed for a
              working checkout, with the flexibility to customize layouts
              without structural changes.
            </p>
            <div className={styles.exampleLinks}>
              <Link
                to='https://stackblitz.com/edit/primer-checkout-basic?file=index.html'
                className={styles.exampleLink}
                target='_blank'
                rel='noopener noreferrer'
              >
                <Icon icon='mdi:code-tags' className={styles.exampleLinkIcon} />
                View on StackBlitz
              </Link>
            </div>
          </div>
          <div className={styles.exampleMedia}>
            <div className={styles.embedWrapper}>
              <iframe
                src='https://stackblitz.com/edit/primer-checkout-basic?ctl=1&embed=1&file=index.html&hideExplorer=1&hideNavigation=1&view=preview'
                title='Basic Checkout Implementation'
                className={styles.embedFrameTall}
                loading='lazy'
              ></iframe>
            </div>
          </div>
        </div>

        {/* Vaulted Payment Method Component */}
        <div className={styles.showcaseExample}>
          <div className={styles.exampleContent}>
            <Heading as='h2' className={styles.exampleTitle}>
              Vaulted Payment Method Component
            </Heading>
            <p className={styles.exampleDescription}>
              Demonstrates saving and reusing payment methods for returning
              customers. Includes test cards and a complete testing environment
              with CVV recapture.
            </p>
            <p className={styles.exampleDescription}>
              Try vaulting a payment method, then refresh or use "Reset Checkout
              Session" to see the saved payment method in action.
            </p>
            <div className={styles.exampleLinks}>
              <Link
                to='https://stackblitz.com/edit/primer-checkout-vaulted?file=index.html'
                className={styles.exampleLink}
                target='_blank'
                rel='noopener noreferrer'
              >
                <Icon
                  icon='mdi:credit-card-outline'
                  className={styles.exampleLinkIcon}
                />
                View on StackBlitz
              </Link>
            </div>
          </div>
          <div className={styles.exampleMedia}>
            <div className={styles.embedWrapper}>
              <iframe
                src='https://stackblitz.com/edit/primer-checkout-vaulted?ctl=1&embed=1&file=index.html&hideExplorer=1&hideNavigation=1&view=preview'
                title='Vaulted Payment Method Component'
                className={styles.embedFrameTall}
                loading='lazy'
              ></iframe>
            </div>
          </div>
        </div>

        {/* Custom Styled Checkout */}
        <div className={styles.showcaseExample}>
          <div className={styles.exampleContent}>
            <Heading as='h2' className={styles.exampleTitle}>
              Custom-Styled Checkout
            </Heading>
            <p className={styles.exampleDescription}>
              Explore ten unique visual themes—from minimalist to cyberpunk to
              kawaii—all powered by CSS variables. Switch between themes using
              the dropdown selector to see the styling flexibility in action.
            </p>
            <p className={styles.exampleDescription}>
              Built with vanilla HTML and minimal JavaScript to emphasize how
              CSS variables alone can transform your checkout appearance. See
              the{' '}
              <a href='/sdk-reference/styling-api-docs'>
                Styling API documentation
              </a>{' '}
              for complete variable reference.
            </p>
            <div className={styles.exampleLinks}>
              <Link
                to='https://stackblitz.com/edit/primer-checkout-themes?file=README.md'
                className={styles.exampleLink}
                target='_blank'
                rel='noopener noreferrer'
              >
                <Icon icon='mdi:brush' className={styles.exampleLinkIcon} />
                View on StackBlitz
              </Link>
            </div>
          </div>
          <div className={styles.exampleMedia}>
            <div className={styles.embedWrapper}>
              <iframe
                src='https://stackblitz.com/edit/primer-checkout-themes?ctl=1&embed=1&file=index.html&hideExplorer=1&hideNavigation=1&view=preview'
                title='Custom-Styled Checkout Example'
                className={styles.embedFrameTall}
                loading='lazy'
              ></iframe>
            </div>
          </div>
        </div>
        <div className={styles.showcaseExample}>
          <div className={styles.exampleContent}>
            <Heading as='h2' className={styles.exampleTitle}>
              Custom Layout Implementation
            </Heading>
            <p className={styles.exampleDescription}>
              Learn to create custom checkout layouts using slots to reorganize
              payment methods. Features card payments at the top, highlighted
              PayPal styling, and clean grid organization.
            </p>
            <div className={styles.exampleLinks}>
              <Link
                to='https://stackblitz.com/edit/primer-checkout-custom-layout?file=index.html'
                className={styles.exampleLink}
                target='_blank'
                rel='noopener noreferrer'
              >
                <Icon icon='mdi:brush' className={styles.exampleLinkIcon} />
                View on StackBlitz
              </Link>
            </div>
          </div>
          <div className={styles.exampleMedia}>
            <div className={styles.embedWrapper}>
              <iframe
                src='https://stackblitz.com/edit/primer-checkout-custom-layout?ctl=1&embed=1&file=index.html&hideExplorer=1&hideNavigation=1&view=preview'
                title='Custom-Styled Checkout Example'
                className={styles.embedFrame}
                loading='lazy'
              ></iframe>
            </div>
          </div>
        </div>
        <div className={styles.showcaseExample}>
          <div className={styles.exampleContent}>
            <Heading as='h2' className={styles.exampleTitle}>
              Custom Card Form Layout
            </Heading>
            <p className={styles.exampleDescription}>
              Compact card form with number and CVV on the same line, plus a
              two-column design featuring order summary sidebar and discount
              codes.
            </p>
            <div className={styles.exampleLinks}>
              <Link
                to='https://stackblitz.com/edit/primer-checkout-custom-form?file=index.html'
                className={styles.exampleLink}
                target='_blank'
                rel='noopener noreferrer'
              >
                <Icon icon='mdi:brush' className={styles.exampleLinkIcon} />
                View on StackBlitz
              </Link>
            </div>
          </div>
          <div className={styles.exampleMedia}>
            <div className={styles.embedWrapper}>
              <iframe
                src='https://stackblitz.com/edit/primer-checkout-custom-form?ctl=1&embed=1&file=index.html&hideExplorer=1&hideNavigation=1&view=preview'
                title='Custom Card Form Layout Example'
                className={styles.embedFrame}
                loading='lazy'
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ComingSoonExamples() {
  return (
    <section className={styles.comingSoonSection}>
      <div className='container'>
        <div className={styles.sectionHeader}>
          <Heading as='h2'>More Examples Coming Soon</Heading>
          <p>
            Our team is actively developing additional implementation examples
          </p>
        </div>

        <div className={styles.comingSoonGrid}>
          <div className={styles.comingSoonCard}>
            <div className={styles.comingSoonIcon}>
              <Icon icon='mdi:react' width='28' height='28' />
            </div>
            <Heading as='h3'>React Integration</Heading>
            <p>
              A complete example of integrating Primer Checkout with React
              applications, including state management and component wrappers
            </p>
          </div>

          <div className={styles.comingSoonCard}>
            <div className={styles.comingSoonIcon}>
              <Icon icon='mdi:vuejs' width='28' height='28' />
            </div>
            <Heading as='h3'>Vue.js Integration</Heading>
            <p>
              A complete example of integrating Primer Checkout with Vue.js
              applications
            </p>
          </div>

          <div className={styles.comingSoonCard}>
            <div className={styles.comingSoonIcon}>
              <Icon icon='mdi:angular' width='28' height='28' />
            </div>
            <Heading as='h3'>Angular Integration</Heading>
            <p>
              Learn how to use Primer Checkout within an Angular application
              framework
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Showcase() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout
      title='Showcase | Primer Checkout'
      description='Explore practical examples and implementations of Primer Checkout.'
    >
      <ShowcaseHeader />
      <main>
        <ShowcaseDisclaimer />
        <ShowcaseExamples />
        <ComingSoonExamples />
      </main>
    </Layout>
  );
}
