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
                to='https://stackblitz.com/edit/primer-checkout-without-frameworks?file=index.htmls'
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
                src='https://stackblitz.com/edit/primer-checkout-without-frameworks?ctl=1&embed=1&file=index.html&hideExplorer=1&hideNavigation=1&view=preview'
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
                features may not work as expected. Additionally, native payment
                method buttons such as PayPal, Apple Pay, and Google Pay have
                strict styling limitations. Only the height can be adjusted, and
                other customizations—such as border radius, colors, or
                shadows—will not affect their visual appearance. Keep this in
                mind when applying styles, as these payment methods enforce
                specific design guidelines.
              </p>
            </div>
            <div className={styles.exampleLinks}>
              <Link
                to='https://stackblitz.com/edit/primer-checkout-without-frameworks-yhbluksu?file=index.html'
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
                src='https://stackblitz.com/edit/primer-checkout-without-frameworks-yhbluksu?ctl=1&embed=1&file=.vscode%2Fsnippets.json&hideExplorer=1&hideNavigation=1&view=preview'
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
              Custom Layout Implementation
            </Heading>
            <p className={styles.exampleDescription}>
              This showcase demonstrates how to create a fully customized
              checkout layout using Composable Checkout. You'll learn how to use
              slots to reorganize payment methods, prioritize specific payment
              options, and add custom styling.
            </p>

            <p className={styles.exampleDescription}>
              The example will show how to place card payments at the top,
              highlight PayPal with custom styling, and organize additional
              payment methods in a clean grid layout - all while maintaining the
              core functionality and security of Primer's SDK.
            </p>
            <div className={styles.exampleLinks}>
              <Link
                to='https://stackblitz.com/edit/resct-no-wrappers?file=index.html'
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
                src='https://stackblitz.com/edit/resct-no-wrappers?ctl=1&embed=1&file=index.html&hideExplorer=1&hideNavigation=1&view=preview'
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
              See how to create a unique payment form layout with card number
              and CVV on the same line, making efficient use of space while
              maintaining a clean user experience.
            </p>
            <p className={styles.exampleDescription}>
              This example demonstrates a two-column checkout design with an
              order summary sidebar, interactive discount code functionality,
              and custom styling—all while leveraging Primer's secure card form
              components.
            </p>
            <div className={styles.exampleLinks}>
              <Link
                to='https://stackblitz.com/edit/resct-no-wrappers-txnkzptg?file=index.html'
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
                src='https://stackblitz.com/edit/resct-no-wrappers-txnkzptg?ctl=1&embed=1&file=index.html&hideExplorer=1&hideNavigation=1&view=preview'
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
