// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast'; // Import Toaster
import AuthProvider from '@/components/AuthProvider';
import { CartProvider } from '@/store/CartContext';
import Script from 'next/script';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'Zee Crown',
  description: 'Discover Your Best Products Here',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans`}>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>

        {/* Configure Toaster with default options */}
        <Toaster
          position="bottom-center"
          toastOptions={{
            // Apply a default duration to all toast types unless overridden
            duration: 3000, // Set default duration to 3000ms (3 seconds)

            // Optional: Customize specific types
            success: {
              duration: 2000, // Success messages disappear faster
            },
            error: {
              duration: 4000, // Error messages stay a bit longer
            },
            // Style examples (optional)
            // style: {
            //   border: '1px solid #713200',
            //   padding: '16px',
            //   color: '#713200',
            // },
          }}
        />

        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}