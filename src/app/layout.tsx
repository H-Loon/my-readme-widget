/**
 * Root Layout
 * 
 * This is the top-level layout component for the entire Next.js application.
 * It wraps every page in the app and is used to define the global HTML structure.
 * 
 * Key Responsibilities:
 * - Defining the <html> and <body> tags.
 * - Loading global fonts (Geist Sans and Geist Mono) using `next/font`.
 * - Importing global CSS styles.
 * - Setting default metadata (title, description, icons).
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Configure the Geist Sans font
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Configure the Geist Mono font
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Define global metadata for SEO and browser tab display
export const metadata: Metadata = {
  title: "Readme Widget",
  description: "Create beautiful widgets for your GitHub Readme",
  icons: {
    icon: "/logo.svg",
  },
};

/**
 * The RootLayout component.
 * @param children The content of the page being rendered.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
