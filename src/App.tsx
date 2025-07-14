import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Suspense, lazy, memo, useMemo } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { Layout } from '@/components/layout/Layout';
import { useAuthStore } from '@/stores/authStore';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { queryClient } from '@/lib/queryConfig';
import { AnalyticsPage } from '@/pages/AnalyticsPage';

const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then(module => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage').then(module => ({ default: module.RegisterPage })));
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then(module => ({ default: module.DashboardPage })));
const ProjectsPage = lazy(() => import('@/pages/ProjectsPage').then(module => ({ default: module.ProjectsPage })));
const ProjectDetailPage = lazy(() => import('@/pages/ProjectDetailPage').then(module => ({ default: module.ProjectDetailPage })));
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then(module => ({ default: module.ProfilePage })));
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then(module => ({ default: module.SettingsPage })));
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage').then(module => ({ default: module.NotificationsPage })));
const ProjectCreatePage = lazy(() => import('@/pages/ProjectCreatePage').then(module => ({ default: module.ProjectCreatePage })));

const PageLoadingFallback = memo(() => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-dark">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
});

PageLoadingFallback.displayName = 'PageLoadingFallback';

const ProtectedRoute = memo(({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
});

ProtectedRoute.displayName = 'ProtectedRoute';

const RouteWrapper = memo(({
  element,
  fallback = <PageLoadingFallback />
}: {
  element: React.ReactNode;
  fallback?: React.ReactNode;
}) => (
  <Suspense fallback={fallback}>
    {element}
  </Suspense>
));

RouteWrapper.displayName = 'RouteWrapper';

const App = memo(() => {
  const authRoutes = useMemo(() => [
    {
      path: "/login",
      element: <LoginPage />
    },
    {
      path: "/register",
      element: <RegisterPage />
    }
  ], []);

  const protectedRoutes = useMemo(() => [
    {
      path: "dashboard",
      element: <DashboardPage />
    },
    {
      path: "projects",
      element: <ProjectsPage />
    },
    {
      path: "projects/new",
      element: <ProjectCreatePage />
    },
    {
      path: "projects/:id",
      element: <ProjectDetailPage />
    },
    {
      path: "profile",
      element: <ProfilePage />
    },
    {
      path: "settings",
      element: <SettingsPage />
    },
    {
      path: "notifications",
      element: <NotificationsPage />
    },
    {
      path: "analytics",
      element: <AnalyticsPage />
    }
  ], []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <Router>
            <div className="space-bg" />
            <Routes>
              {authRoutes.map(({ path, element }) => (
                <Route
                  key={path}
                  path={path}
                  element={<RouteWrapper element={element} />}
                />
              ))}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                {protectedRoutes.map(({ path, element }) => (
                  <Route
                    key={path}
                    path={path}
                    element={<RouteWrapper element={element} />}
                  />
                ))}
                <Route path="" element={<Navigate to="/dashboard" />} />
              </Route>
            </Routes>
          </Router>
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
});

App.displayName = 'App';

export default App;