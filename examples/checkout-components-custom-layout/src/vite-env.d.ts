/// <reference types="vite/client" />
import { CustomElements } from '@primer-io/primer-js/dist/jsx/index';

// Extend JSX IntrinsicElements with Primer components
declare module "react" {
  namespace JSX {
    interface IntrinsicElements extends CustomElements {}
  }
}
