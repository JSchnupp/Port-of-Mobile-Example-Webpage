/**
 * Providers Component
 * This file sets up the application's global providers and context wrappers.
 * It's marked as a client component to enable client-side functionality.
 */

'use client'

// Import the ThemeProvider from next-themes for dark/light mode support
import { ThemeProvider } from 'next-themes'

/**
 * Providers Component
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to be wrapped with providers
 * @returns {JSX.Element} The wrapped application with theme support
 * 
 * This component:
 * 1. Wraps the application with ThemeProvider for theme management
 * 2. Enables system theme detection
 * 3. Uses class-based theme switching
 * 4. Sets system theme as the default
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  )
} 