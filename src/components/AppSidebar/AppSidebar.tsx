import { BrandIcon, Sidebar, AppTopbar, Icon } from '@primer-io/goat';
import { FC, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styles from './AppSidebar.module.scss';
import { CodeMerge } from '@primer-io/goat-icons';

export const AppSidebar: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className={styles.container}>
      <AppTopbar>
        <Sidebar>
          <Sidebar.Root className={styles.sidebar}>
            <Sidebar.Header>
              <Link to={'/'}>
                <BrandIcon
                  src='https://goat-assets.production.core.primer.io/primer/icon/black.svg'
                  size='large'
                  alt='Logo'
                />
              </Link>
              <Sidebar.Lock
                ariaLabelFloating='Lock sidebar'
                ariaLabelLocked='Hide sidebar'
              />
            </Sidebar.Header>

            <Sidebar.Content>
              <Sidebar.Item as={Link} to='/'>
                Home
              </Sidebar.Item>
              <Sidebar.Item as={Link} to='/drop-in'>
                <Icon as={CodeMerge} /> Web Drop-In
              </Sidebar.Item>
            </Sidebar.Content>
          </Sidebar.Root>

          <AppTopbar.Root className={styles.topbar}>
            <Sidebar.Trigger className={styles.trigger} />
          </AppTopbar.Root>
          <div className={styles.content}>{children}</div>
        </Sidebar>
      </AppTopbar>
    </div>
  );
};
