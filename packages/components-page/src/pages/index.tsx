import type { ReactNode } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import Admonition from '@theme/Admonition/Type/Info';

import styles from './index.module.css';

function HomepageHeader(): ReactNode {
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className='container'>
        <Heading as='h1' className='hero__title'>
          Primer Components
        </Heading>
        <p className='hero__subtitle'>
          Beta Documentation for the Web SDK – Built with Lit &amp; Modern Web
          Tech
        </p>
        <div className={styles.buttons}>
          <Link className='button button--secondary button--lg'>
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

function BetaOverview(): ReactNode {
  return (
    <section className={styles.betaOverview}>
      <div className='container'>
        <Heading as='h2'>Welcome to the Beta</Heading>
        <Admonition type='info' title='Beta Release Notice'>
          This documentation is for the beta release of Primer Components. It
          isn’t the official release yet.
        </Admonition>
        <div className={clsx('row', styles.featureRow)}>
          <div className={clsx('col col--4')}>
            <div className='text--center'>
              <img
                className={styles.featureSvg}
                role='img'
                alt=''
                src='https://goat-assets.production.core.primer.io/product/templates-payment-orchestration.svg'
              />
            </div>
            <div className='text--center padding-horiz--md'>
              <Heading as='h3'>Customizable Checkout Experience</Heading>
              <p>
                Primer Components is a cutting-edge web SDK designed to deliver
                a seamless, customizable checkout experience. Built using{' '}
                <strong>Lit</strong> and modern web components, this beta
                documentation gives you a sneak peek at our current progress and
                future vision.
              </p>
            </div>
          </div>

          <div className={clsx('col col--4')}>
            <div className='text--center'>
              <img
                className={styles.featureSvg}
                role='img'
                alt=''
                src='https://goat-assets.production.core.primer.io/product/conditions-utility.svg'
              />
            </div>
            <div className='text--center padding-horiz--md'>
              <Heading as='h3'>Mobile Platform in Development</Heading>
              <p>
                While this docs site covers our web SDK, keep an eye out for our
                mobile version (iOS &amp; Android). Our mobile platform is
                currently in early development, with initial support and updates
                scheduled for the second half of 2025.
              </p>
            </div>
          </div>
          <div className={clsx('col col--4')}>
            <div className='text--center'>
              <img
                className={styles.featureSvg}
                role='img'
                alt=''
                src='https://goat-assets.production.core.primer.io/product/primer-web-request.svg'
              />
            </div>
            <div className='text--center padding-horiz--md'>
              <Heading as='h3'>Discover Our Roadmap</Heading>
              <p>
                Dive in to explore our product vision, technology stack, and
                development roadmap as we work towards a fully production-ready
                solution. Our roadmap covers everything from building a robust
                Lit-based component library to streamlining our SDK
                architecture, ensuring maximum flexibility and performance for
                your checkout integrations.
              </p>
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
      title='Primer Components Documentation'
      description='Beta release docs for the Primer Components web SDK, featuring Lit, modern web components, and a flexible roadmap for the future.'
    >
      <HomepageHeader />
      <main>
        <BetaOverview />
      </main>
    </Layout>
  );
}
