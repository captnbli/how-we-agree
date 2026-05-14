import type { Metadata } from 'next';
import './globals.css';
import HeaderNav from '@/components/HeaderNav';

export const metadata: Metadata = {
  title: 'how-we-agree',
  description: 'A forum for people who have already met.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="layout">
          <header className="site-header">
            <h1>how-we-agree</h1>
            <HeaderNav />
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}
