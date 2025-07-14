import { useEffect, useState, Suspense, lazy, memo, useMemo } from 'react';
import { analyticsApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const LazyBarChart = lazy(() => import('recharts').then(module => ({ default: module.BarChart })));
const LazyBar = lazy(() => import('recharts').then(module => ({ default: module.Bar })));
const LazyXAxis = lazy(() => import('recharts').then(module => ({ default: module.XAxis })));
const LazyYAxis = lazy(() => import('recharts').then(module => ({ default: module.YAxis })));
const LazyTooltip = lazy(() => import('recharts').then(module => ({ default: module.Tooltip })));
const LazyResponsiveContainer = lazy(() => import('recharts').then(module => ({ default: module.ResponsiveContainer })));
const LazyCartesianGrid = lazy(() => import('recharts').then(module => ({ default: module.CartesianGrid })));

const ChartLoadingFallback = memo(() => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <Loader2 className="animate-spin w-8 h-8 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Loading chart...</p>
      </div>
    </div>
  );
});

ChartLoadingFallback.displayName = 'ChartLoadingFallback';

interface AnalyticsPanelProps {
  projectId: string;
}

export const AnalyticsPanel = memo(({ projectId }: AnalyticsPanelProps) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    analyticsApi.getProjectAnalytics(projectId)
      .then(setData)
      .catch(() => setError('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, [projectId]);

  const processedData = useMemo(() => {
    if (!data) return null;

    return {
      stats: data.stats || {},
      commitsOverTime: data.commitsOverTime || [],
    };
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin w-8 h-8 mr-2" /> Loading analytics...
      </div>
    );
  }

  if (error) {
    return <div className="text-destructive text-center py-12">{error}</div>;
  }

  if (!processedData) {
    return <div className="text-muted-foreground text-center py-12">No analytics data available.</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Summary</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-8 flex-wrap">
          <div>
            <div className="text-2xl font-bold">{processedData.stats?.totalCommits ?? '-'}</div>
            <div className="text-muted-foreground">Commits</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{processedData.stats?.openIssues ?? '-'}</div>
            <div className="text-muted-foreground">Open Issues</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{processedData.stats?.contributors ?? '-'}</div>
            <div className="text-muted-foreground">Contributors</div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Commits Over Time</CardTitle>
        </CardHeader>
        <CardContent style={{ height: 300 }}>
          {processedData.commitsOverTime && processedData.commitsOverTime.length > 0 ? (
            <Suspense fallback={<ChartLoadingFallback />}>
              <LazyResponsiveContainer width="100%" height="100%">
                <LazyBarChart data={processedData.commitsOverTime} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                  <LazyCartesianGrid strokeDasharray="3 3" />
                  <LazyXAxis dataKey="date" />
                  <LazyYAxis allowDecimals={false} />
                  <LazyTooltip />
                  <LazyBar dataKey="count" fill="#6366f1" />
                </LazyBarChart>
              </LazyResponsiveContainer>
            </Suspense>
          ) : (
            <div className="text-muted-foreground text-center">No commit data available.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

AnalyticsPanel.displayName = 'AnalyticsPanel';
