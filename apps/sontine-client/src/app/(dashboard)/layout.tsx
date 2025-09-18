import type { Metadata } from 'next';
import { DashboardNav } from '@/components/dashboard/dashboard-nav';
import { GradientBackground } from '@/components/ui/gradient-background';

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
    <div className="min-h-screen">
      <GradientBackground variant="subtle-mint" className="min-h-screen">
        <DashboardNav />
        <main className="container mx-auto px-4 py-6">
          {children}
        </main>
      </GradientBackground>
    </div>
  );
}