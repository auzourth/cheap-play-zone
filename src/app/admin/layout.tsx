import { ReactNode } from 'react';
import { AppProvider } from '@/context/AppContext';
import AdminHeader from './_comp/header';
import '../globals.css';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-900 text-white">
        <AppProvider>
          <AdminHeader />

          <main className="container mx-auto px-4 py-6">{children}</main>
        </AppProvider>
      </body>
    </html>
  );
}
