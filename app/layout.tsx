/**
 * Root layout component for the Next.js application.
 * This file defines the base HTML structure and global configuration for the entire application.
 */

// Import necessary types and components
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

// Initialize the Inter font with Latin subset for consistent typography across the application
const inter = Inter({ subsets: ['latin'] });

// Define metadata for the application, used for SEO and browser tab information
export const metadata: Metadata = {
  title: 'Warehouse Dashboard',
  description: 'Warehouse utilization dashboard',
};

/**
 * RootLayout Component
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to be rendered within the layout
 * @returns {JSX.Element} The root layout structure
 * 
 * This component:
 * 1. Sets up the HTML document structure
 * 2. Applies the Inter font to the body
 * 3. Wraps the application with Providers for global state management
 * 4. Suppresses hydration warnings for Next.js
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
