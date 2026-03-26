import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '名刺管理アプリ',
  description: '名刺をデジタルで管理するアプリ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <header className="border-b bg-background sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center">
            <a href="/" className="font-bold text-lg">📇 名刺管理</a>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-6 w-full">{children}</main>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
