import { FC } from 'react';

interface CopyButtonProps {
  cardNumber: string;
  isCopied: boolean;
  onCopy: (cardNumber: string) => void;
}

/**
 * CopyButton - A reusable button component for copying text to clipboard
 * 
 * This component shows a copy icon and handles the copy action.
 * It also shows a "Copied!" message when the text has been copied.
 */
export const CopyButton: FC<CopyButtonProps> = ({ cardNumber, isCopied, onCopy }) => {
  return (
    <button 
      className={`copy-button ${isCopied ? 'copied' : ''}`}
      title='Copy to clipboard' 
      onClick={() => onCopy(cardNumber)}
    >
      {isCopied ? (
        <span className='copied-text'>Copied!</span>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 4V16C8 16.5304 8.21071 17.0391 8.58579 17.4142C8.96086 17.7893 9.46957 18 10 18H18C18.5304 18 19.0391 17.7893 19.4142 17.4142C19.7893 17.0391 20 16.5304 20 16V7.242C20 6.97556 19.9467 6.71181 19.8433 6.46624C19.7399 6.22068 19.5885 5.99824 19.398 5.812L16.188 2.602C15.8129 2.22698 15.3133 2.0157 14.794 2H10C9.46957 2 8.96086 2.21071 8.58579 2.58579C8.21071 2.96086 8 3.46957 8 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 18V20C16 20.5304 15.7893 21.0391 15.4142 21.4142C15.0391 21.7893 14.5304 22 14 22H6C5.46957 22 4.96086 21.7893 4.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V8C4 7.46957 4.21071 6.96086 4.58579 6.58579C4.96086 6.21071 5.46957 6 6 6H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </button>
  );
};
