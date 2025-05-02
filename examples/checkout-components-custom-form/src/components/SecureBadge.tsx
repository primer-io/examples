import { FC } from 'react';

/**
 * SecureBadge - A simple component that displays a secure payment badge
 * 
 * This component shows a lock icon with text to reassure users about
 * the security of their payment information.
 */
export const SecureBadge: FC = () => {
  return (
    <div className='secure-badge'>
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='16'
        height='16'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <rect
          x='3'
          y='11'
          width='18'
          height='11'
          rx='2'
          ry='2'
        ></rect>
        <path d='M7 11V7a5 5 0 0 1 10 0v4'></path>
      </svg>
      <span>Secure payment</span>
    </div>
  );
};