import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'diCatat — Aplikasi Pencatat Keuangan Hand-Drawn Bareng Si Oren 🐾📓',
  description:
    'Catat pengeluaran harian, atur budget bulanan, dan scan struk otomatis pakai Gemini Vision AI ditemani maskot Si Kucing Oren Akuntan!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Patrick+Hand&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-paper text-ink antialiased selection:bg-highlight selection:text-ink">
        <svg
          aria-hidden="true"
          className="pointer-events-none fixed w-0 h-0 overflow-hidden"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="wobble-card" x="-8%" y="-8%" width="116%" height="116%">
              <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="3" result="noise" seed="7" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="5.5" xChannelSelector="R" yChannelSelector="G" />
            </filter>
            <filter id="wobble-sketch" x="-8%" y="-8%" width="116%" height="116%">
              <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" result="noise" seed="12" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.5" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
        </svg>
        {children}
      </body>
    </html>
  );
}

