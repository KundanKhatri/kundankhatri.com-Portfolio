import type { Metadata } from 'next';
import { Inter, Cormorant_Garamond } from 'next/font/google';
import { site } from '@/data/content';
import { JsonLd } from '@/components/ui/JsonLd';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
// Luxury serif for the display headlines — the Dribbble reference uses something like this.
const serif = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '500', '700'], variable: '--font-serif', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.kundankhatri.com'),
  title: {
    default: 'Kundan Khatri — AI Agent & Website Developer, India',
    template: '%s · Kundan Khatri',
  },
  description: site.description,
  alternates: { canonical: 'https://www.kundankhatri.com/' },
  keywords: [
    'Kundan Khatri', 'ZeroTheory AI', 'business website developer India',
    'AI agents developer India', 'AI automation agency India', 'hire AI engineer India',
    'production AI platform', 'revenue systems', 'web developer Bengaluru Chennai',
  ],
  openGraph: {
    title: site.title,
    description: site.description,
    url: 'https://www.kundankhatri.com',
    siteName: 'Kundan Khatri',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: { card: 'summary_large_image', title: site.title, description: site.description },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${serif.variable}`}>
      <body>
        <JsonLd />
        {children}
      </body>
    </html>
  );
}
