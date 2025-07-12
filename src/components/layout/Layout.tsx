import { Outlet } from 'react-router-dom';
import { Suspense, lazy } from 'react';

const Header = lazy(() => import('./Header').then(module => ({ default: module.Header })));
const Sidebar = lazy(() => import('./Sidebar').then(module => ({ default: module.Sidebar })));

function LayoutLoadingFallback() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
    </div>
  );
}

export function Layout() {
  return (
    <div className="h-screen flex flex-col bg-gradient-dark">
      <Suspense fallback={<LayoutLoadingFallback />}>
        <Header />
      </Suspense>
      <div className="flex flex-1 overflow-hidden">
        <Suspense fallback={<LayoutLoadingFallback />}>
          <Sidebar />
        </Suspense>
        <main className="flex-1 overflow-auto p-6 md:p-10 neu-card">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
