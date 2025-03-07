import type { ReactNode } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import CodeBlock from '@theme/CodeBlock';

import styles from './index.module.css';

function HomepageHeader(): ReactNode {
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className='container'>
        <Heading as='h1' className='hero__title'>
          Composable Checkout <span className={styles.betaBadge}>BETA</span>
        </Heading>
        <p className='hero__subtitle'>
          Build powerful, customizable checkout experiences with Web Components
        </p>
        <div className={styles.buttons}>
          <Link
            className='button button--secondary button--lg'
            to='/documentation/getting-started'
          >
            Getting Started
          </Link>
          <Link
            className='button button--secondary button--lg'
            to='/beta-program'
          >
            About Beta
          </Link>
        </div>
      </div>
    </header>
  );
}

function FeatureOverview(): ReactNode {
  return (
    <section className={styles.overview}>
      <div className='container'>
        <div className='row'>
          <div className='col col--12'>
            <Heading as='h2' className={styles.overviewTitle}>
              Why Composable Checkout?
            </Heading>
          </div>
        </div>
        <div className='row'>
          <div className='col col--4'>
            <div className='text--center padding-horiz--md'>
              <Heading as='h3'>Web Component Power</Heading>
              <p>
                Built on modern web standards, our components provide maximum
                flexibility and performance while maintaining framework
                independence.
              </p>
            </div>
          </div>
          <div className='col col--4'>
            <div className='text--center padding-horiz--md'>
              <Heading as='h3'>Complete Design Control</Heading>
              <p>
                Take full control of your checkout experience with a
                comprehensive design token system and slot-based customization.
              </p>
            </div>
          </div>
          <div className='col col--4'>
            <div className='text--center padding-horiz--md'>
              <Heading as='h3'>PCI Compliant</Heading>
              <p>
                Focus on building great experiences while we handle the complex
                payment logic and security requirements behind the scenes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CodeExample(): ReactNode {
  const codeExample = `<primer-checkout clientToken="your-client-token">
  <!-- Customizable checkout experience -->
  <primer-main slot="main">
    <div slot="payments">
      <primer-payment-method type="PAYMENT_CARD"></primer-payment-method>
      <primer-payment-method type="APPLE_PAY"></primer-payment-method>
      <primer-payment-method type="GOOGLE_PAY"></primer-payment-method>
    </div>
  </primer-main>
</primer-checkout>`;

  return (
    <div className={styles.codeExample}>
      <CodeBlock language='jsx'>{codeExample}</CodeBlock>
    </div>
  );
}

function BetaBanner(): ReactNode {
  return (
    <section className={styles.betaBanner}>
      <div className='container'>
        <div className='row'>
          <div className='col'>
            <div className={styles.betaBannerContent}>
              <Heading as='h2'>Currently in Beta</Heading>
              <p>
                Composable Checkout is in beta development. Join the beta
                program to get early access, shape the future of the product,
                and receive direct engineering support.
              </p>
              <Link
                className='button button--primary button--lg'
                to='/beta-program'
              >
                Learn More About the Beta
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function GettingStarted(): ReactNode {
  return (
    <section className={styles.gettingStarted}>
      <div className='container'>
        <div className='row'>
          <div className='col'>
            <Heading as='h2'>Getting Started is Simple</Heading>
            <div className={styles.stepsGrid}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <Heading as='h3'>Install the SDK</Heading>
                <p>
                  Install via NPM or include via CDN to get started with
                  Composable Checkout.
                </p>
                <div className={styles.stepCode}>
                  <CodeBlock language='bash'>
                    npm install @primer-io/primer-js
                  </CodeBlock>
                </div>
              </div>

              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <Heading as='h3'>Add Components</Heading>
                <p>
                  Add the checkout components to your HTML and customize the
                  layout to fit your needs.
                </p>
                <div className={styles.stepCode}>
                  <CodeBlock language='html'>{`<primer-checkout client-token="...">
  <primer-main slot="main"></primer-main>
</primer-checkout>`}</CodeBlock>
                </div>
              </div>

              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <Heading as='h3'>Customize Appearance</Heading>
                <p>
                  Use CSS variables to style the components according to your
                  brand guidelines.
                </p>
                <div className={styles.stepCode}>
                  <CodeBlock language='css'>{`:root {
  --primer-color-brand: #4a6cf7;
  --primer-typography-brand: 'Inter', sans-serif;
}`}</CodeBlock>
                </div>
              </div>
            </div>
            <div className={styles.getStartedCta}>
              <Link
                className='button button--primary button--lg'
                to='/documentation/getting-started'
              >
                View Full Documentation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout
      title='Composable Checkout Documentation'
      description="Build customizable, compliant checkout experiences with Primer's Composable Checkout. Powered by Web Components for maximum flexibility and performance."
    >
      <HomepageHeader />
      <main>
        <FeatureOverview />
        <CodeExample />
        <BetaBanner />
        <GettingStarted />
      </main>
    </Layout>
  );
}
