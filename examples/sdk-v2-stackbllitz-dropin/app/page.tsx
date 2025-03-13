'use client';

import { useEffect, useState, useRef } from 'react';
import { fetchClientToken } from '@/lib/fetchClientToken';
import { CheckoutComponent } from '@/components/CheckoutComponent';

export default function Home() {
  const [clientToken, setClientToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use a ref to track if we've already started the token fetch
  const hasStartedFetchRef = useRef(false);

  useEffect(() => {
    // Skip if we've already started the fetch
    if (hasStartedFetchRef.current) return;

    // Mark that we've started the fetch
    hasStartedFetchRef.current = true;

    async function getToken() {
      setIsLoading(true);
      try {
        // You'll need to replace this with your actual API key
        const response = await fetchClientToken('a1b2c3d4e5f6g7h8i9j0');
        if (response.success) {
          console.log('Client token:', response.clientToken);
          setClientToken(response.clientToken);
        } else {
          console.error('Failed to fetch client token:', response.error);
          setError(response.error);
        }
      } catch (err) {
        console.error('Error fetching token:', err);
        setError('Failed to initialize checkout');
      } finally {
        setIsLoading(false);
      }
    }

    getToken();
  }, []);

  return (
    <main className='flex-1 p-6 md:p-12'>
      <div className='max-w-5xl mx-auto'>
        <header className='mb-12 text-center'>
          <h1 className='text-3xl md:text-4xl font-bold mb-3'>
            Primer Checkout Demo
          </h1>
          <p className='text-lg text-gray-600'>
            A simplified integration of Primer&#39;s drop-in checkout with
            Next.js
          </p>
        </header>

        <div className='grid md:grid-cols-2 gap-8'>
          <div className='flex flex-col'>
            <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
              <h2 className='text-xl font-semibold mb-4'>Order Summary</h2>
              <div className='space-y-3'>
                <div className='flex justify-between'>
                  <span>Product</span>
                  <span>$99.00</span>
                </div>
                <div className='flex justify-between'>
                  <span>Shipping</span>
                  <span>$5.00</span>
                </div>
                <div className='flex justify-between'>
                  <span>Tax</span>
                  <span>$10.00</span>
                </div>
                <div className='border-t pt-3 mt-3'>
                  <div className='flex justify-between font-bold'>
                    <span>Total</span>
                    <span>$114.00</span>
                  </div>
                </div>
              </div>
            </div>
            <div className='bg-white rounded-lg shadow-md p-6'>
              <h2 className='text-xl font-semibold mb-4'>
                Customer Information
              </h2>
              <div className='space-y-2 text-gray-700'>
                <p>
                  <strong>Name:</strong> John Doe
                </p>
                <p>
                  <strong>Email:</strong> john.doe@example.com
                </p>
                <p>
                  <strong>Shipping Address:</strong> 123 Main St, Anytown, USA
                </p>
              </div>
            </div>
          </div>

          <div>
            {isLoading ? (
              <div className='bg-white rounded-lg shadow-md p-6 text-center'>
                <p className='text-gray-600'>Loading checkout experience...</p>
              </div>
            ) : error ? (
              <div className='bg-white rounded-lg shadow-md p-6'>
                <div className='bg-red-50 border border-red-200 text-red-700 p-4 rounded-md'>
                  {error}
                </div>
              </div>
            ) : (
              <CheckoutComponent clientToken={clientToken} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
