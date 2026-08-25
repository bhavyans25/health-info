import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Community Health Awareness Hub',
  description: 'Anonymous, secure public health awareness platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-black min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
