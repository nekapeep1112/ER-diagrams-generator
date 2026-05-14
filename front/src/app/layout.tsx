import type { Metadata } from 'next';
import './tokens.css';
import './globals.css';
import { ToastContainer } from '@/components/ui/Toast';
import { AuthInit } from '@/components/auth/AuthInit';

export const metadata: Metadata = {
  title: 'ER Database',
  description: 'Проектирование БД на естественном языке',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap&subset=latin,cyrillic"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthInit />
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
