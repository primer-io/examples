import Layout from '@theme/Layout';
import ProgressTracking from '../components/BetaProgram/ProgressTracking';
import BetaHeader from '../components/BetaProgram/BetaHeader';
import BetaExplanation from '../components/BetaProgram/BetaExplanation';
import BetaAccess from '../components/BetaProgram/BetaAccess';
import type { ReactNode } from 'react';

export default function BetaProgram(): ReactNode {
  return (
    <Layout
      title='Composable Checkout Beta Program'
      description="Join the beta program for Primer's Composable Checkout and shape the future of checkout experiences."
    >
      <BetaHeader />
      <main>
        <ProgressTracking />
        <BetaExplanation />
        <BetaAccess />
      </main>
    </Layout>
  );
}
