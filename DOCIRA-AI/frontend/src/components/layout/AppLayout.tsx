import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface AppLayoutProps {
  children: React.ReactNode;
  breadcrumb?: string[];
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  breadcrumb,
}) => (
  <div className="app-shell h-screen overflow-hidden">
    <div className="ambient-scene" aria-hidden="true" />

    <div className="app-content flex h-full overflow-hidden">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <Header breadcrumb={breadcrumb} />

        <main className="flex-1 min-h-0 overflow-y-auto p-6 bg-transparent">
          {children}
        </main>
      </div>
    </div>
  </div>
);
