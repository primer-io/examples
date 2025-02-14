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
          Primer Web SDK
        </Heading>
        <p className='hero__subtitle'>
          Build powerful, customizable checkout experiences with Web Components
        </p>
        <div className={styles.buttons}>
          <Link
            className='button button--secondary button--lg'
            to='/docs/getting-started'
          >
            Quick Start Guide
          </Link>
        </div>
      </div>
    </header>
  );
}

function CodePreview(): ReactNode {
  const codeExample = `<primer-checkout clientToken={token}>
  <!-- Use our components -->
  <primer-main>
    <primer-payment-method type="card" />
  </primer-main>
  
  <!-- Or build your own UI -->
  <div class="custom-checkout">
    {paymentMethods.map(method => (
      <primer-payment-method type={method.type} />
    ))}
  </div>
</primer-checkout>`;

  return (
    <div className={styles.codePreview}>
      <CodeBlock language='jsx'>{codeExample}</CodeBlock>
    </div>
  );
}

function Features(): ReactNode {
  return (
    <section className={styles.features}>
      <div className='container'>
        <div className='row'>
          <div className='col col--4'>
            <div className='text--center padding-horiz--md'>
              <Heading as='h3'>Built with Web Components</Heading>
              <p>
                Powered by Lit and modern Web Components, our SDK works
                seamlessly with any framework while maintaining optimal
                performance and minimal bundle size.
              </p>
            </div>
          </div>
          <div className='col col--4'>
            <div className='text--center padding-horiz--md'>
              <Heading as='h3'>Total Layout Freedom</Heading>
              <p>
                Mix our components with your own HTML structure. Take full
                control of the UI while we handle the complex payment logic and
                PCI compliance behind the scenes.
              </p>
            </div>
          </div>
          <div className='col col--4'>
            <div className='text--center padding-horiz--md'>
              <Heading as='h3'>Framework Agnostic</Heading>
              <p>
                Native support for React, Vue, Angular, and any other modern
                framework. No wrappers or adapters needed – just import and
                start building.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BetaAccess(): ReactNode {
  return (
    <section className={styles.beta}>
      <div className='container'>
        <div className='row'>
          <div className='col col--6'>
            <Heading as='h2'>Join the Beta Program</Heading>
            <p>
              Get early access to our next-generation SDK and help shape the
              future of checkout experiences. Our beta program includes:
            </p>
            <ul>
              <li>Direct access to our engineering team</li>
              <li>Early preview of upcoming features</li>
              <li>Priority support and implementation guidance</li>
              <li>Influence on our product roadmap</li>
            </ul>
            <Link className='button button--primary button--lg'>
              Request Beta Access
            </Link>
          </div>
          <div className='col col--6'>
            <div className={styles.betaFeatures}>
              <Heading as='h3'>Coming Soon</Heading>
              <ul>
                <li>Advanced styling and theming API</li>
                <li>Enhanced payment method components</li>
                <li>Improved TypeScript support</li>
                <li>Mobile SDK for iOS and Android</li>
              </ul>
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
      title='Primer Web SDK Documentation'
      description="Build customizable, compliant checkout experiences with Primer's Web SDK. Powered by Web Components for maximum flexibility and performance."
    >
      <HomepageHeader />
      <main>
        <CodePreview />
        <Features />
        <BetaAccess />
      </main>
    </Layout>
  );
}
