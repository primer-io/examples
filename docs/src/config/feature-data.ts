export interface FeatureStatus {
  name: string;
  completion: number;
  status:
    | 'complete'
    | 'nearlyComplete'
    | 'inProgress'
    | 'earlyDevelopment'
    | 'planned';
  statusText: string;
  currentLimitations?: string;
  futureRoadmap?: string;
  importantNotes?: string;
}

export const featureData: FeatureStatus[] = [
  {
    name: 'Card Form',
    completion: 80,
    status: 'inProgress',
    statusText: 'In Progress (80%)',
    currentLimitations: `
- Surcharge display functionality not yet implemented
- Dedicated scene mode unavailable
- Card form underlying logic not yet optimized
    `,
    futureRoadmap: `
- Complete surcharge display in next release
- Dedicated scene mode available soon
- Improved error handling for card form fields (validate on blur)
- Performance improvements and optimizations
    `,
  },
  {
    name: 'Localization',
    completion: 90,
    status: 'nearlyComplete',
    statusText: 'Nearly Complete (90%)',
    currentLimitations: `
- Custom language loading not supported (can't register custom translations)
- No proper tree shaking for language files
    `,
    futureRoadmap: `
- Custom language registration API
- Tree shaking implementation for language files
    `,
  },
  {
    name: 'PayPal',
    completion: 100,
    status: 'complete',
    statusText: 'Complete (100%)',
    currentLimitations: '',
    futureRoadmap: `
- Additional PayPal button for different PayPal products
    `,
    importantNotes: `
- Future enhancements are planned for later stages and not currently in active development
    `,
  },
  {
    name: 'Apple Pay',
    completion: 100,
    status: 'complete',
    statusText: 'Complete (100%)',
    currentLimitations: '',
    futureRoadmap: `
- Cross-browser support including desktop browsers
- Enhanced customization options for button appearance
    `,
    importantNotes: `
- Future enhancements are planned for later stages and not currently in active development
    `,
  },
  {
    name: 'Google Pay',
    completion: 100,
    status: 'complete',
    statusText: 'Complete (100%)',
    currentLimitations: '',
    futureRoadmap: `
- Enhanced customization options for button appearance
    `,
    importantNotes: `
- Future enhancements are planned for later stages and not currently in active development
    `,
  },
  {
    name: 'Redirect Payment Methods',
    completion: 100,
    status: 'complete',
    statusText: 'Complete (100%)',
    currentLimitations: '',
    futureRoadmap: '',
    importantNotes: `
- Before implementing any payment method, consult the [available payment methods matrix](https://primer.io/docs/payment-methods/available-payment-methods)
- Only payment methods available in the Headless SDK are supported
    `,
  },
  {
    name: 'Klarna',
    completion: 0,
    status: 'planned',
    statusText: 'Planned (0%)',
    currentLimitations: `
- Development not yet started
    `,
    futureRoadmap: `
- Development scheduled to begin soon
    `,
  },
  {
    name: 'Stripe ACH',
    completion: 0,
    status: 'planned',
    statusText: 'Planned (0%)',
    currentLimitations: `
- Early planning phase
    `,
    futureRoadmap: `
- Development planned to begin after Klarna implementation
    `,
  },
  {
    name: 'Up-to-date & Reusable Assets',
    completion: 25,
    status: 'earlyDevelopment',
    statusText: 'Early Development (25%)',
    currentLimitations: `
- Early development stage
    `,
    futureRoadmap: `
- Comprehensive asset library for embedding in UIs
- Consistent styling across all payment methods
- Asset versioning system
- Initial release expected in Q2 2025
    `,
  },
  {
    name: 'Analytics',
    completion: 0,
    status: 'planned',
    statusText: 'Planned (0%)',
    currentLimitations: `
- Early planning phase
- Requirement gathering in progress
    `,
    futureRoadmap: `
- Not planned for current development cycle
- Long-term feature (beyond Cycle 3)
    `,
  },
];
