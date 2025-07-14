import { useEffect, useState } from 'react';
import { analyticsApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const STATUS_COLORS = ['#6366f1', '#a21caf', '#f59e42', '#10b981', '#ef4444'];

export function AnalyticsPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="glass-card bg-white/10 backdrop-blur-md border border-white/20 shadow-lg px-8 py-12 rounded-2xl">
          <span className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg text-center block">Access denied. Admins only.</span>
        </div>
      </div>
    );
  }

  useEffect(() => {
    setLoading(true);
    analyticsApi.getGeneralAnalytics()
      .then(setData)
      .catch(() => setError('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mr-4"></div>
        <span className="text-lg text-muted-foreground">Loading analytics...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-destructive text-center py-12">{error}</div>;
  }

  if (!data) {
    return <div className="text-muted-foreground text-center py-12">No analytics data available.</div>;
  }

  // Prepare data for PieChart
  const projectStatusData = data.projectStatusBreakdown
    ? Object.entries(data.projectStatusBreakdown)
        .map(([status, count]) => ({ name: status, value: count }))
    : [];
  const hasProjectStatusData = projectStatusData.some(d => Number(d.value) > 0);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-10">
      <h1 className="text-4xl font-bold mb-8 text-center text-white drop-shadow-lg z-10 relative">
        Workspace Analytics Overview
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="glass-card bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
          <CardHeader><CardTitle>Total Users</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{data.totalUsers}</div></CardContent>
        </Card>
        <Card className="glass-card bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
          <CardHeader><CardTitle>Total Projects</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{data.totalProjects}</div></CardContent>
        </Card>
        <Card className="glass-card bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
          <CardHeader><CardTitle>Total Tasks</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{data.totalTasks}</div></CardContent>
        </Card>
        <Card className="glass-card bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
          <CardHeader><CardTitle>Total Chats</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{data.totalChats}</div></CardContent>
        </Card>
        <Card className="glass-card bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
          <CardHeader><CardTitle>Total Messages</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{data.totalMessages}</div></CardContent>
        </Card>
        <Card className="glass-card bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
          <CardHeader><CardTitle>Total Notifications</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{data.totalNotifications}</div></CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
        <Card className="glass-card bg-white/10 backdrop-blur-md border border-white/20 shadow-lg col-span-1 md:col-span-2 flex flex-col items-center justify-center min-h-[400px]">
          <CardHeader><CardTitle>Project Status Breakdown</CardTitle></CardHeader>
          <CardContent className="flex flex-col items-center justify-center w-full h-full">
            {hasProjectStatusData ? (
              <div style={{ minWidth: 350, minHeight: 350, width: '100%', height: '100%' }} className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie data={projectStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
                      {projectStatusData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-muted-foreground text-center">No project status data.</div>
            )}
          </CardContent>
        </Card>
        <Card className="glass-card bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
          <CardHeader><CardTitle>Task Status Breakdown</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.taskStatusBreakdown && Object.entries(data.taskStatusBreakdown).map(([status, count]) => (
                <li key={String(status)} className="flex justify-between"><span>{String(status)}</span><span className="font-semibold">{String(count)}</span></li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="glass-card bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
          <CardHeader><CardTitle>User Role Breakdown</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.userRoleBreakdown && Object.entries(data.userRoleBreakdown).map(([role, count]) => (
                <li key={String(role)} className="flex justify-between"><span>{String(role)}</span><span className="font-semibold">{String(count)}</span></li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}