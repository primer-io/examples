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
            Composable Checkout Showcase
          </Heading>
          <p className={styles.showcaseSubtitle}>
            Explore practical examples of Composable Checkout implementations
          </p>
        </div>
      </div>
      <div className={styles.showcaseBgPattern}></div>
    </header>
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
              This example showcases how little code is needed to get the most
              basic checkout working. It is structurally similar to the SDK v2
              drop-in solution. However, from the beginning, it utilizes web
              components, allowing for seamless layout customization without
              requiring additional structural changes.
            </p>
            <p className={styles.exampleDescription}>
              While this serves as a foundational starting point, be aware that
              this is not a final implementation. Some features available in SDK
              v2 might be missing at this stage, but they will be progressively
              introduced.
            </p>
            <div className={styles.exampleLinks}>
              <Link
                to='https://stackblitz.com/edit/primer-checkout-without-frameworks'
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
                src='https://stackblitz.com/edit/primer-checkout-without-frameworks?ctl=1&embed=1&file=index.html&view=preview'
                title='Basic Checkout Implementation'
                className={styles.embedFrame}
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
              This example demonstrates how to build a fully customizable
              checkout while still using no framework—operating purely with HTML
              and a minimal <code>main.ts</code> script. The goal is to showcase
              the power of our exposed style tokens by offering four different
              checkout versions, allowing users to toggle between them
              seamlessly.
            </p>
            <p className={styles.exampleDescription}>
              The implementation includes a native drop-down selector that
              allows users to switch between four different pre-defined CSS
              styles. It loads styling via CSS variables, keeping JavaScript
              involvement to a bare minimum while demonstrating the flexibility
              of the styling system.
            </p>
            <div className={styles.disclaimer}>
              <p>
                <strong>Note:</strong> This is a beta implementation, and some
                features may not work as expected. Native Payment Methods like
                PayPal, Apple Pay, and Google Pay will not work with a dynamic
                theme switcher like this—stylesheets must be preloaded for these
                payment methods to display properly.
              </p>
            </div>
            <div className={styles.exampleLinks}>
              <Link
                to='https://stackblitz.com/edit/custom-styled-checkout'
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
                src='https://stackblitz.com/edit/primer-checkout-without-frameworks-yhbluksu?ctl=1&embed=1&file=src%2Fstyles.css&view=preview'
                title='Custom-Styled Checkout Example'
                className={styles.embedFrame}
                loading='lazy'
              ></iframe>
            </div>
          </div>
        </div>

        {/* Custom Layout Implementation (WIP) */}
        <div className={styles.showcaseExample}>
          <div className={styles.exampleContent}>
            <Heading as='h2' className={styles.exampleTitle}>
              Custom Layout Implementation{' '}
              <Icon
                icon='mdi:construction'
                style={{
                  verticalAlign: 'middle',
                  marginLeft: '8px',
                  color: '#FFA000',
                }}
              />
            </Heading>
            <p className={styles.exampleDescription}>
              <strong>Work in Progress:</strong> This upcoming showcase will
              demonstrate how to create a fully customized checkout layout using
              the flexibility of Composable Checkout. It uses slots to
              reorganize the payment methods and add custom content sections.
            </p>
            <p className={styles.exampleDescription}>
              By leveraging the slot-based architecture, you'll be able to
              create unique checkout experiences while maintaining the core
              functionality and security features of the Primer SDK. This
              feature is currently under development.
            </p>
            <div className={styles.exampleLinks}>
              <Link
                className={styles.exampleLink}
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
                onClick={(e) => e.preventDefault()}
              >
                <Icon
                  icon='mdi:page-layout-body'
                  className={styles.exampleLinkIcon}
                />
                Coming Soon
              </Link>
            </div>
          </div>
          <div className={styles.exampleMedia}>
            <div
              className={styles.imageWrapper}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f5f5',
                height: '100%',
                minHeight: '400px',
              }}
            >
              <Icon
                icon='mdi:page-layout-body'
                style={{ fontSize: '120px', color: '#ccc' }}
              />
            </div>
          </div>
        </div>

        {/* Card Form Customizations (WIP) */}
        <div className={styles.showcaseExample}>
          <div className={styles.exampleContent}>
            <Heading as='h2' className={styles.exampleTitle}>
              Card Form Customizations{' '}
              <Icon
                icon='mdi:construction'
                style={{
                  verticalAlign: 'middle',
                  marginLeft: '8px',
                  color: '#FFA000',
                }}
              />
            </Heading>
            <p className={styles.exampleDescription}>
              <strong>Work in Progress:</strong> This upcoming example will
              showcase various ways to customize card form layouts to match your
              branding and UX requirements.
            </p>
            <p className={styles.exampleDescription}>
              You'll learn how to modify field arrangements, style card inputs
              to match your brand design, and configure validations with
              real-time feedback. This feature is currently being built and will
              be available soon.
            </p>
            <div className={styles.exampleLinks}>
              <Link
                className={styles.exampleLink}
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
                onClick={(e) => e.preventDefault()}
              >
                <Icon
                  icon='mdi:credit-card-outline'
                  className={styles.exampleLinkIcon}
                />
                Coming Soon
              </Link>
            </div>
          </div>
          <div className={styles.exampleMedia}>
            <div
              className={styles.imageWrapper}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f5f5',
                height: '100%',
                minHeight: '400px',
              }}
            >
              <Icon
                icon='mdi:credit-card-outline'
                style={{ fontSize: '120px', color: '#ccc' }}
              />
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
              A complete example of integrating Composable Checkout with React
              applications, including state management and component wrappers
            </p>
          </div>

          <div className={styles.comingSoonCard}>
            <div className={styles.comingSoonIcon}>
              <Icon icon='mdi:vuejs' width='28' height='28' />
            </div>
            <Heading as='h3'>Vue.js Integration</Heading>
            <p>
              A complete example of integrating Composable Checkout with Vue.js
              applications
            </p>
          </div>

          <div className={styles.comingSoonCard}>
            <div className={styles.comingSoonIcon}>
              <Icon icon='mdi:angular' width='28' height='28' />
            </div>
            <Heading as='h3'>Angular Integration</Heading>
            <p>
              Learn how to use Composable Checkout within an Angular application
              framework
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContributeSection() {
  return (
    <section className={styles.contributeSection}>
      <div className='container'>
        <div className={styles.contributeContent}>
          <Heading as='h2'>Contribute an Example</Heading>
          <p className={styles.contributeDescription}>
            Have you built something great with Composable Checkout? We'd love
            to feature your implementation in our showcase. Submit your example
            through our GitHub repository to help others learn from your
            experience.
          </p>
          <Link
            className='button button--primary button--lg'
            to='https://github.com/primer-io/examples'
            target='_blank'
            rel='noopener noreferrer'
          >
            Submit Your Example
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Showcase() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout
      title='Showcase | Composable Checkout'
      description="Explore practical examples and implementations of Primer's Composable Checkout SDK."
    >
      <ShowcaseHeader />
      <main>
        <ShowcaseExamples />
        <ComingSoonExamples />
        <ContributeSection />
      </main>
    </Layout>
  );
}
