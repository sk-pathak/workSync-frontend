import { Outlet } from 'react-router-dom';
import { Suspense, lazy, memo } from 'react';

const Sidebar = lazy(() => import('./Sidebar').then(module => ({ default: module.Sidebar })));
const Footer = lazy(() => import('./Footer').then(module => ({ default: module.Footer })));

const LayoutLoadingFallback = memo(() => {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent"></div>
    </div>
  );
});

LayoutLoadingFallback.displayName = 'LayoutLoadingFallback';

const MainContent = memo(() => {
  return (
    <main className="flex-1 overflow-auto p-6 md:p-10 glass-card m-4 rounded-2xl h-[calc(100vh-2rem-3.5rem)]">
      <div className="animate-fade-in">
        <Outlet />
      </div>
    </main>
  );
});

MainContent.displayName = 'MainContent';

export const Layout = memo(() => {
  return (
    <div className="h-screen flex flex-col bg-gradient-dark">
      <div className="flex flex-1 overflow-hidden">
        <Suspense fallback={<LayoutLoadingFallback />}>
          <Sidebar />
        </Suspense>
        <MainContent />
      </div>
      <Suspense fallback={<LayoutLoadingFallback />}>
        <Footer />
      </Suspense>
    </div>
  );
});

Layout.displayName = 'Layout';
