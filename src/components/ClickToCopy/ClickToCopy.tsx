import { Icon, IconButton, Tooltip, cx } from '@primer-io/goat';
import {
  ExclamationTriangleSolid,
  CheckCircleSolid,
  Copy,
} from '@primer-io/goat-icons';
import { ComponentProps, ReactNode, useState } from 'react';
import styles from './ClickToCopy.module.scss';

type Props = {
  children: ReactNode;
  value?: string;
};

function useClickToCopy(value: string) {
  const [copied, setCopied] = useState<boolean>();

  return {
    copied,
    onClick: async () => {
      try {
        await navigator.clipboard.writeText(value);
        setCopied(true);
      } catch {
        setCopied(false);
      } finally {
        setTimeout(() => setCopied(undefined), 3000);
      }
    },
  };
}

export function ClickToCopy({
  children,
  value = children?.toString() || '',
}: Props) {
  const { copied, onClick } = useClickToCopy(value);

  return (
    <Tooltip open={copied != null ? true : undefined}>
      <Tooltip.Trigger className={styles.trigger} onClick={onClick}>
        {children}
      </Tooltip.Trigger>
      <Tooltip.Content side='top'>
        {copyText(copied)}
        <Icon as={copyIcon(copied)} size='small' />
      </Tooltip.Content>
    </Tooltip>
  );
}

type CopyIconButtonProps = Omit<
  ComponentProps<typeof IconButton>,
  'icon' | 'onClick'
> & {
  value: string;
};

export function CopyIconButton({
  value,
  className,
  ...rest
}: CopyIconButtonProps) {
  const { copied, onClick } = useClickToCopy(value);

  return (
    <Tooltip open={copied != null ? true : undefined}>
      <Tooltip.Trigger
        {...rest}
        as={IconButton}
        icon={Copy}
        className={cx(styles.trigger, className)}
        onClick={onClick}
      />
      <Tooltip.Content side='top' hideWhenDetached>
        {copyText(copied)}
        <Icon as={copyIcon(copied)} size='small' />
      </Tooltip.Content>
    </Tooltip>
  );
}

function copyText(copied: boolean | undefined) {
  if (copied) return 'Copied';
  if (copied === false) return 'Failed';
  return 'Click to copy';
}

function copyIcon(copied: boolean | undefined) {
  if (copied) return CheckCircleSolid;
  if (copied === false) return ExclamationTriangleSolid;
  return Copy;
}
