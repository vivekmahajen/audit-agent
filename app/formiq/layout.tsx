import type { Metadata } from 'next';
import { DM_Serif_Display, IBM_Plex_Mono, Inter } from 'next/font/google';

const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-dm-serif',
  display: 'swap',
});

const ibmMono = IBM_Plex_Mono({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-ibm-mono',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FormIQ — Instant Form Intelligence',
  description:
    'Type any form name and get plain-English instructions, field guides, and a realistic filled sample.',
};

export default function FormIQLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${dmSerif.variable} ${ibmMono.variable} ${inter.variable} min-h-screen`}>
      {children}
    </div>
  );
}
