import { cx, P, PrimerLoader } from '@primer-io/goat';
import { FC, useEffect, useState } from 'react';
import styles from './Loading.module.scss';
import { loadingStrings } from './strings.ts';

interface LoadingProps {
  page?: boolean;
  children?: never;
  className?: string;
}

export const Loading: FC<LoadingProps> = ({ page, className }) => {
  //show extra text after two seconds
  const [showText, setShowText] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowText(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={cx({ [styles.page]: page }, className)}>
      <div className={styles.main}>
        <PrimerLoader>
          <PrimerLoader.Icon />
        </PrimerLoader>

        <div className={styles.textWrapper}>
          <P type='title-large' className={styles.loading}>
            {loadingStrings.loading}
          </P>
        </div>
        <P
          type='body-medium'
          color={'gray-600'}
          className={cx(styles.extraText, { [styles.showText]: showText })}
        >
          {loadingStrings.extra}
        </P>
      </div>
    </div>
  );
};
