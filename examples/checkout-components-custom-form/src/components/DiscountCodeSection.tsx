import { FC, useRef, useState } from 'react';

interface DiscountCodeSectionProps {
  onApplyDiscount?: (code: string) => void;
}

/**
 * DiscountCodeSection - Component for handling discount code entry and validation
 *
 * This component provides a clean UI for entering and applying discount codes,
 * with appropriate loading and success states.
 */
export const DiscountCodeSection: FC<DiscountCodeSectionProps> = ({
  onApplyDiscount,
}) => {
  const [applyingDiscount, setApplyingDiscount] = useState<boolean>(false);
  const [discountApplied, setDiscountApplied] = useState<boolean>(false);
  const discountInputRef = useRef<HTMLInputElement | null>(null);

  const handleApplyDiscount = () => {
    const discountCode = discountInputRef.current?.value;

    if (!discountCode) {
      alert('Please enter a discount code');
      return;
    }

    setApplyingDiscount(true);

    // Simulate API call to validate discount code
    setTimeout(() => {
      setApplyingDiscount(false);
      setDiscountApplied(true);

      // Disable the input after applying discount
      if (discountInputRef.current) {
        discountInputRef.current.disabled = true;
      }

      // Call the callback if provided
      if (onApplyDiscount) {
        onApplyDiscount(discountCode);
      }
    }, 800);
  };

  return (
    <div className='form-row discount-row'>
      <primer-input-wrapper>
        <primer-input-label slot='label'>Discount Code</primer-input-label>
        <div slot='input' className='discount-field'>
          <primer-input
            id='discount-code'
            ref={discountInputRef}
          ></primer-input>
          <button
            className={`discount-button ${
              discountApplied ? 'applied' : ''
            } ${applyingDiscount ? 'loading' : ''}`}
            onClick={handleApplyDiscount}
            disabled={discountApplied || applyingDiscount}
          >
            {discountApplied
              ? 'Applied'
              : applyingDiscount
                ? 'Applying...'
                : 'Apply'}
          </button>
        </div>
        {discountApplied && (
          <span slot='error' className='discount-success'>
            Discount applied successfully!
          </span>
        )}
      </primer-input-wrapper>
    </div>
  );
};
