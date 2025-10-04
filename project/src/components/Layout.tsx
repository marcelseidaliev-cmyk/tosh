import { ReactNode } from 'react';
import { BottomNavigation } from './BottomNavigation';

interface LayoutProps {
  children: ReactNode;
  showNavigation?: boolean;
}

export function Layout({ children, showNavigation = true }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className={showNavigation ? 'pb-20' : ''}>
        {children}
      </main>
      {showNavigation && <BottomNavigation />}
    </div>
  );
}