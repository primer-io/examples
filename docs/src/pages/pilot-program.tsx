import Layout from '@theme/Layout';
import BetaHeader from '../components/BetaProgram/BetaHeader';
import BetaExplanation from '../components/BetaProgram/BetaExplanation';
import BetaAccess from '../components/BetaProgram/BetaAccess';
import type { ReactNode } from 'react';

export default function BetaProgram(): ReactNode {
  return (
    <Layout
      title='Checkout Components - Pilot Program'
      description="Join the Pilot Program for Primer's Checkout Components and shape the future of checkout experiences."
    >
      <BetaHeader />
      <main>
        <BetaExplanation />
        <BetaAccess />
      </main>
    </Layout>
  );
}
