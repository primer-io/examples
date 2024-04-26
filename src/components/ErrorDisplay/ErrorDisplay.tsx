import { FC, ReactNode } from 'react';
import { Notification } from '@primer-io/goat';

interface NotificationErrorProps {
  className?: string;
  children?: ReactNode;
}

export const ErrorDisplay: FC<NotificationErrorProps> = ({
  className,
  children,
}) => {
  return (
    <Notification.Root sentiment='negative' className={className}>
      <Notification.Icon />
      <Notification.Content flow='column'>{children}</Notification.Content>
    </Notification.Root>
  );
};
