'use client';
import { usePrimerDropIn } from '@/hooks/usePrimerDropIn';
import { useRouter } from 'next/navigation';

interface CheckoutComponentProps {
  clientToken: string | null;
}

export function CheckoutComponent({ clientToken }: CheckoutComponentProps) {
  const router = useRouter();

  // Use our simplified drop-in hook
  const { isLoading, isSuccess, error, resetPrimerInstance } = usePrimerDropIn({
    clientToken,
    containerId: 'primer-checkout-container',
    onCheckoutComplete: (data) => {
      console.log('Payment completed successfully!', data);
      // Show success state for 2 seconds, then redirect
      setTimeout(() => {
        router.push('/success'); // You can create this success page later
      }, 2000);
    },
  });

  // Handle reset/retry
  const handleReset = () => {
    resetPrimerInstance();
  };

  return (
    <div className='bg-white rounded-lg shadow-md p-6'>
      <h2 className='text-2xl font-semibold mb-4'>Payment</h2>

      {/* Loading state */}
      {isLoading && (
        <div className='py-4 text-center text-gray-600'>
          <div className='flex justify-center items-center mb-2'>
            <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600'></div>
          </div>
          Processing payment...
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className='bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-4'>
          <p className='font-medium'>Payment error</p>
          <p className='text-sm'>{String(error)}</p>
          <button
            onClick={handleReset}
            className='mt-2 text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded transition'
          >
            Try again
          </button>
        </div>
      )}

      {/* Success message */}
      {isSuccess && (
        <div className='bg-green-50 border border-green-200 text-green-700 p-4 rounded-md'>
          <div className='flex items-center'>
            <svg
              className='w-5 h-5 mr-2'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M5 13l4 4L19 7'
              />
            </svg>
            <span className='font-medium'>Payment successful!</span>
          </div>
          <p className='text-sm mt-1'>Redirecting to order confirmation...</p>
        </div>
      )}

      {/* Drop-in checkout container */}
      {!error && !isSuccess && (
        <div
          id='primer-checkout-container'
          className='min-h-[400px] border border-gray-200 rounded-md'
        ></div>
      )}
    </div>
  );
}
