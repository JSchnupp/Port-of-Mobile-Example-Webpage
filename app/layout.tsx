import React from "react";
import type { Metadata, Viewport } from "next";
<<<<<<< HEAD
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
=======
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
>>>>>>> e78b90b622e73d421b35500af8ee6504239fac0f
import "./globals.css";
import "./styles/patterns.css";
import { Providers } from './providers'
import Link from "next/link";

<<<<<<< HEAD
const geistSans = GeistSans
const geistMono = GeistMono
=======
const geistSans = GeistSans;
const geistMono = GeistMono;
>>>>>>> e78b90b622e73d421b35500af8ee6504239fac0f

export const metadata: Metadata = {
  title: "Warehouse Management System",
  description: "Track and manage warehouse utilization",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
