/* eslint-disable @typescript-eslint/no-empty-object-type */
import { CustomElements } from './primer-components';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements extends CustomElements {}
  }
}
