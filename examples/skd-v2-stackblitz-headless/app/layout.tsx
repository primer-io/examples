import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Primer Headless Checkout',
  description: 'Next.js implementation of Primer Headless Checkout',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="max-w-4xl mx-auto p-5">{children}</main>
      </body>
    </html>
  );
}
