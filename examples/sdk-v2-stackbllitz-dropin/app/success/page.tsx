'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function SuccessPage() {
  const [orderId] = useState(
    `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
  );

  return (
    <main className='flex-1 p-6 md:p-12 flex flex-col items-center justify-center'>
      <div className='max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center'>
        <div className='w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center'>
          <svg
            className='w-10 h-10 text-green-500 checkmark'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2.5}
              d='M5 13l4 4L19 7'
            />
          </svg>
        </div>

        <h1 className='text-2xl font-bold text-gray-800 mb-2'>
          Payment Successful!
        </h1>
        <p className='text-gray-600 mb-6'>
          Thank you for your purchase. Your order has been successfully
          processed.
        </p>

        <div className='bg-gray-50 p-4 rounded-md mb-6'>
          <p className='text-sm text-gray-500 mb-1'>Order Reference</p>
          <p className='font-medium text-gray-800'>{orderId}</p>
        </div>

        <div className='space-y-3'>
          <Link
            href='/'
            className='block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition'
          >
            Return to home page
          </Link>
        </div>
      </div>
    </main>
  );
}
