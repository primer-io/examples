import { cx } from '@primer-io/goat';
import styles from './PageContainer.module.scss';

type PageContainerProps = JSX.IntrinsicElements['main'];

export const PageContainer = ({ className, ...rest }: PageContainerProps) => (
  <main {...rest} className={cx(styles.container, className)} />
);
