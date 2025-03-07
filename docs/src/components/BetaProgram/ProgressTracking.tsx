import Heading from '@theme/Heading';
import type { ReactNode } from 'react';
import styles from './beta-program.module.css';
import { featureData } from '../../config/feature-data';
import FeatureStatusIndicator from './FeatureStatusIndicator';
import MarkdownFeatureContent from './MarkdownFeatureContent';

export default function ProgressTracking(): ReactNode {
  return (
    <section className={styles.progress} id='progress'>
      <div className='container'>
        <div className='row'>
          <div className='col'>
            <Heading as='h2'>Implementation Progress</Heading>
            <p>
              Here's the current status of Composable Checkout features. We're
              continuously working to enhance and expand these capabilities.
            </p>

            <div
              className={styles.progressGrid}
              role='table'
              aria-label='Feature implementation status'
            >
              {/* Header row */}
              <div className={styles.progressRow} role='row'>
                <div className={styles.progressHeader} role='columnheader'>
                  Feature
                </div>
                <div className={styles.progressHeader} role='columnheader'>
                  Status
                </div>
                <div className={styles.progressHeader} role='columnheader'>
                  Current Limitations
                </div>
                <div className={styles.progressHeader} role='columnheader'>
                  Future Roadmap
                </div>
              </div>

              {/* Data rows */}
              {featureData.map((feature, index) => (
                <div className={styles.progressRow} role='row' key={index}>
                  <div className={styles.progressCell} role='cell'>
                    {feature.name}
                  </div>
                  <div className={styles.progressCell} role='cell'>
                    <FeatureStatusIndicator
                      status={feature.status}
                      completion={feature.completion}
                      statusText={feature.statusText}
                    />
                  </div>
                  <div className={styles.progressCell} role='cell'>
                    {feature.currentLimitations ? (
                      <div className={styles.mdxContent}>
                        <MarkdownFeatureContent
                          content={feature.currentLimitations}
                        />
                      </div>
                    ) : (
                      <span className={styles.noLimitations}>
                        No current limitations
                      </span>
                    )}
                  </div>
                  <div className={styles.progressCell} role='cell'>
                    {feature.futureRoadmap ? (
                      <div className={styles.mdxContent}>
                        <MarkdownFeatureContent
                          content={feature.futureRoadmap}
                        />
                      </div>
                    ) : (
                      <span className={styles.noRoadmap}>
                        No planned updates
                      </span>
                    )}
                    {feature.importantNotes && (
                      <div className={styles.importantNotes}>
                        <strong>Important Notes:</strong>
                        <div className={styles.mdxContent}>
                          <MarkdownFeatureContent
                            content={feature.importantNotes}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <p className={styles.progressNote}>
              <em>
                This table will be updated continuously as we progress with the
                release of Composable Checkout.
              </em>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
