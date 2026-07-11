import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { site } from '@/data/content';
import { JsonLd } from '@/components/ui/JsonLd';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://kundankhatri.com'),
  title: {
    default: 'Kundan Khatri — AI Agent & Website Developer, India',
    template: '%s · Kundan Khatri',
  },
  description: site.description,
  alternates: { canonical: 'https://kundankhatri.com/' },
  keywords: [
    'Kundan Khatri', 'ZeroTheory AI', 'business website developer India',
    'AI agents developer', 'production AI platform', 'web developer Chennai Bangalore',
  ],
  openGraph: {
    title: site.title,
    description: site.description,
    url: 'https://kundankhatri.com',
    siteName: 'Kundan Khatri',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: { card: 'summary_large_image', title: site.title, description: site.description },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <JsonLd />
        {children}
      </body>
    </html>
  );
}
