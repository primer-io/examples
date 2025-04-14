import { CheckoutHero } from '@site/src/components/CheckoutHero';
import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import CodeBlock from '@theme/CodeBlock';
import { Icon } from '@iconify/react';

import styles from './index.module.css';

function HomepageHeader() {
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className='container'>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <Heading as='h1' className={styles.heroTitle}>
              Checkout Components&nbsp;
              <Link to='/pilot-program' className={styles.betaBadge}>
               Pilot Program
              </Link>
            </Heading>
            <p className={styles.heroSubtitle}>
              The next-generation checkout experience that combines the{' '}
              <span className={styles.highlight}>simplicity of Drop-in</span>{' '}
              with the{' '}
              <span className={styles.highlight}>flexibility of Headless</span>
            </p>
            <div className={styles.heroCta}>
              <Link
                className='button button--primary button--lg'
                to='/documentation/getting-started'
              >
                Start Building
              </Link>
              <Link
                className='button button--secondary button--lg'
                to='/pilot-program'
              >
                Learn About Pilot Program
              </Link>
            </div>
          </div>
          <div className={styles.heroImage}>
            <CheckoutHero className={styles.heroIllustration} />
          </div>
        </div>
      </div>
      <div className={styles.heroBgPattern}></div>
    </header>
  );
}

function CoreBenefits() {
  return (
    <section className={styles.benefits}>
      <div className='container'>
        <div className={styles.sectionHeader}>
          <Heading as='h2'>Why Choose Checkout Components?</Heading>
          <p>Powerful flexibility with effortless integration</p>
        </div>

        <div className={styles.benefitsGrid}>
          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}>
              <Icon icon='mdi:puzzle' width='28' height='28' />
            </div>
            <Heading as='h3'>Web Component Power</Heading>
            <p>
              Built on modern, framework-agnostic web standards for maximum
              flexibility and performance across any tech stack
            </p>
            <Link
              to='/documentation/components-technology'
              className={styles.learnMore}
            >
              Learn about our technology →
            </Link>
          </div>

          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}>
              <Icon icon='mdi:mustache' width='28' height='28' />
            </div>
            <Heading as='h3'>Powerful Layout Customization</Heading>
            <p>
              Create unique checkout experiences with flexible layout options
              that adapt to your specific business needs and customer journey
            </p>
            <Link
              to='/documentation/layout-customizations-guide'
              className={styles.learnMore}
            >
              Explore layout options →
            </Link>
          </div>

          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}>
              <Icon icon='mdi:brush' width='28' height='28' />
            </div>
            <Heading as='h3'>Scalable Styling API</Heading>
            <p>
              Maintain brand consistency with our comprehensive styling
              variables that make design changes simple, scalable, and
              maintainable
            </p>
            <Link to='/api/styling-api-docs' className={styles.learnMore}>
              View styling variables →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function ComposableFeature() {
  return (
    <section className={styles.featureSection}>
      <div className='container'>
        <div className={styles.featureRow}>
          <div className={styles.featureContent}>
            <Heading as='h2'>Best of Both Worlds</Heading>
            <p className={styles.featureDescription}>
              With Checkout Components, we want you to offer your customers the
              most tailored checkout experience. No more choosing between the
              simplicity of Drop-in and the flexibility of Headless—Checkout Components combine the best of both worlds, giving you maximum
              customization with minimal configuration effort.
            </p>
            <Link
              to='/documentation/getting-started'
              className={clsx('button button--primary', styles.featureBtn)}
            >
              Get Started
            </Link>
          </div>
          <div className={styles.featureMedia}>
            <div className={styles.featureVideoWrapper}>
              <video
                autoPlay
                loop
                muted
                playsInline
                className={styles.featureVideo}
                poster='/img/composable_checkout-poster.jpg'
              >
                <source src='/img/composable_checkout.webm' type='video/webm' />
                <source src='/img/composable_checkout.mp4' type='video/mp4' />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StyleFeature() {
  return (
    <section className={clsx(styles.featureSection, styles.altBackground)}>
      <div className='container'>
        <div className={styles.featureRow}>
          <div className={styles.featureMedia}>
            <div className={styles.featureWideVideoWrapper}>
              <video
                autoPlay
                loop
                muted
                playsInline
                className={styles.featureWideVideo}
                poster='/img/style_variables-poster.jpg'
              >
                <source src='/img/style_variables.webm' type='video/webm' />
                <source src='/img/style_variables.mp4' type='video/mp4' />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
          <div className={styles.featureContent}>
            <Heading as='h2'>Effortless Styling</Heading>
            <p className={styles.featureDescription}>
              To meet all your UI needs, we've introduced{' '}
              <strong>Style Variables</strong>—a set of variables that let you
              precisely and effortlessly configure the appearance of your
              checkout to match your brand.
            </p>
            <Link
              to='/api/styling-api-docs'
              className={clsx('button button--primary', styles.featureBtn)}
            >
              Explore Style Variables
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function CodeExample() {
  return (
    <section className={styles.codeExampleSection}>
      <div className='container'>
        <div className={styles.sectionHeader}>
          <Heading as='h2'>Simple Implementation</Heading>
          <p>Add a few lines of code and you're ready to go</p>
        </div>

        <div className={styles.codeExampleWrapper}>
          <CodeBlock
            language='jsx'
            className={styles.codeBlock}
          >{`<primer-checkout clientToken="your-client-token">
  <!-- Customizable checkout experience -->
  <primer-main slot="main">
    <div slot="payments">
      <primer-payment-method type="PAYMENT_CARD"></primer-payment-method>
      <primer-payment-method type="APPLE_PAY"></primer-payment-method>
      <primer-payment-method type="GOOGLE_PAY"></primer-payment-method>
    </div>
  </primer-main>
</primer-checkout>`}</CodeBlock>
        </div>

        <div className={styles.codeExampleCta}>
          <Link
            className='button button--primary button--lg'
            to='/documentation/getting-started'
          >
            View Documentation
          </Link>
        </div>
      </div>
    </section>
  );
}

function ShowcaseSection() {
  return (
    <section className={styles.showcaseSection}>
      <div className='container'>
        <div className={styles.showcaseContent}>
          <Heading as='h2'>See It In Action</Heading>
          <p className={styles.showcaseDescription}>
            Visit our Showcase to explore practical examples of Checkout
            Components implementations. Interact with live demos and see how
            different customization options affect the checkout experience.
          </p>
          <Link className='button button--outline button--lg' to='/showcase'>
            View Interactive Examples
          </Link>
        </div>
      </div>
    </section>
  );
}

function BetaCallout() {
  return (
    <section className={styles.betaCallout}>
      <div className='container'>
        <div className={styles.betaCalloutContent}>
          <div className={styles.betaBanner}>
            <span>Pilot Program</span>
          </div>
          <Heading as='h2'>Join the Pilot Program</Heading>
          <p>
            Checkout Components is currently in beta. Join our Pilot Program to
            get early access, shape the future of the product, and receive
            direct support from our engineering team.
          </p>
          <Link
            className='button button--primary button--lg'
            to='/pilot-program'
          >
            Learn About the Pilot Program
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout
      title='Checkout Components'
      description="Build powerful, customizable checkout experiences with Primer's Checkout Components. Maximum customization with minimal configuration."
    >
      <HomepageHeader />
      <main className={styles.mainContent}>
        <CoreBenefits />
        <ComposableFeature />
        <StyleFeature />
        <CodeExample />
        <ShowcaseSection />
        <BetaCallout />
      </main>
    </Layout>
  );
}
