import type { Metadata } from 'next';
import { DashboardNav } from '@/components/dashboard/dashboard-nav';

export const metadata: Metadata = {
  title: 'Dashboard | Sontine',
  description: 'Your Sontine dashboard',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}