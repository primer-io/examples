/* eslint-disable @typescript-eslint/no-empty-object-type */
/// <reference types="vite/client" />
import { CustomElements } from '@primer-io/primer-js/dist/jsx/index';

// Extend JSX IntrinsicElements with Primer components
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends CustomElements {}
  }
}

// This file is a module (it has an import), so augment the global types.
declare global {
  interface ImportMetaEnv {
    readonly VITE_PRIMER_API_KEY?: string;
    readonly VITE_PRIMER_API_URL?: string;
  }
}
