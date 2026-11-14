import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { ArrowRight, BadgeCheck, FileText, HandHeart, ShieldCheck, Users } from 'lucide-react';
import DashboardLayout from '../../shared/components/layout/DashboardLayout';
import PageHeader from '../../shared/components/layout/PageHeader';
import { useAuthStore } from '@store';
import { useAdminDashboardStats } from '../../modules/analytics/hooks/useAnalytics';
import LoadError from '../../shared/components/ui/LoadError';
import { formatRelativeTime } from '../../shared/utils';
import { formatCount } from '@shared/utils/format';
import Icon from '@shared/components/ui/Icon';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const CHART = { color: '#047857', grid: '#E7E5E4', tick: { fontSize: 11, fill: '#78716C' } };

/**
 * Admin home — the work queue first (verifications waiting on an admin),
 * then membership, sign-up trend and recent activity.
 */
const AdminDashboardPage = () => {
  const { user } = useAuthStore();
  // Donations is superadmin-only (backend 403s + SuperAdminRoute redirects).
  const isSuperAdmin = Boolean(user?.is_superuser);
  const [chartPeriod, setChartPeriod] = useState('weekly');

  const { data: stats, isLoading, isError, isFetching, refetch } = useAdminDashboardStats(chartPeriod);
  const chartLoading = isFetching && !isLoading;

  // Helper: format date as YYYY-MM-DD using local timezone (matches backend TruncDate)
  const toLocalDateStr = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Build chart data from recent_registrations
  const chartData = useMemo(() => {
    const regs = stats?.recent_registrations || [];

    // Match helper: sum counts for a date range (week) or exact date
    const findCount = (dateStr) => {
      const match = regs.find((r) => r.date === dateStr);
      return match?.count || 0;
    };

    if (chartPeriod === 'monthly') {
      // Monthly view: show last 4 weeks, sum each week's daily counts
      const weekLabels = [];
      for (let i = 3; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i * 7);
        const weekStart = new Date(d);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
        const label = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        // Sum all days in this week
        let weekTotal = 0;
        for (let day = 0; day < 7; day++) {
          const wd = new Date(weekStart);
          wd.setDate(wd.getDate() + day);
          weekTotal += findCount(toLocalDateStr(wd));
        }

        weekLabels.push({
          day: `Wk ${label}`,
          value: weekTotal,
          date: toLocalDateStr(weekStart),
        });
      }

      const maxVal = Math.max(...weekLabels.map((d) => d.value), 1);
      return weekLabels.map((d, idx) => ({
        ...d,
        height: Math.max(5, (d.value / maxVal) * 100),
        isHighlighted: idx === weekLabels.length - 1,
      }));
    }

    // Weekly view: show last 7 days
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = toLocalDateStr(d);
      days.push({
        day: dayNames[d.getDay()],
        value: findCount(dateStr),
        date: dateStr,
      });
    }

    const maxVal = Math.max(...days.map((d) => d.value), 1);
    return days.map((d, idx) => ({
      ...d,
      height: Math.max(5, (d.value / maxVal) * 100),
      isHighlighted: idx === days.length - 1,
    }));
  }, [stats, chartPeriod]);

  const totalRegistrations = useMemo(() => chartData.reduce((sum, d) => sum + d.value, 0), [chartData]);

  const totalUsers = stats?.users?.total || 0;
  const totalEagles = stats?.users?.eagles || 0;
  const totalEaglets = stats?.users?.eaglets || 0;
  const suspended = stats?.users?.suspended || 0;
  const pendingKYC = stats?.kyc?.total_pending || 0;
  const recentActivity = (stats?.recent_activity || []).slice(0, 5);

  if (isError) {
    return (
      <DashboardLayout variant="admin">
        <LoadError variant="page" title="We couldn’t load the dashboard" retryLabel="Try again" onRetry={() => refetch()} />
      </DashboardLayout>
    );
  }

  const queue = [
    {
      icon: ShieldCheck,
      tone: 'bg-amber-50 text-amber-800',
      title: pendingKYC > 0 ? `${formatCount(pendingKYC, 'identity check')} waiting` : 'No identity checks waiting',
      detail: pendingKYC > 0 ? 'Mentors and mentees can’t start until they’re verified.' : 'Verification queue is clear.',
      to: '/admin/kyc',
      cta: pendingKYC > 0 ? 'Review' : 'Open',
    },
    {
      icon: BadgeCheck,
      tone: 'bg-sky-50 text-sky-800',
      title: 'Mentor applications',
      detail: 'Mentees asking to become mentors.',
      to: '/admin/mentor-applications',
      cta: 'Open',
    },
  ];

  const membership = [
    ['Members', totalUsers],
    ['Mentors', totalEagles],
    ['Mentees', totalEaglets],
    ['Suspended', suspended],
  ];

  const quickLinks = [
    { to: '/admin/users', icon: Users, label: 'Manage people' },
    { to: '/admin/content', icon: FileText, label: 'Manage content' },
    ...(isSuperAdmin ? [{ to: '/admin/donations', icon: HandHeart, label: 'Donations' }] : []),
  ];

  return (
    <DashboardLayout variant="admin">
      <PageHeader
        title="Platform overview"
        description={`Welcome back, ${user?.first_name || 'admin'}. Here’s what needs an admin today.`}
        actions={pendingKYC > 0 ? (
          <Button asChild><Link to="/admin/kyc"><ShieldCheck aria-hidden="true" /> Review {pendingKYC} pending</Link></Button>
        ) : null}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Waiting on an admin</CardTitle>
              <CardDescription>Decisions that unblock members.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="divide-y rounded-lg border">
                {queue.map(({ icon: RowIcon, tone, title, detail, to, cta }) => (
                  <li key={to} className="flex items-center gap-3 p-3">
                    <span className={cn('grid size-9 shrink-0 place-items-center rounded-md', tone)}>
                      <RowIcon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{isLoading ? <Skeleton className="h-4 w-40" /> : title}</span>
                      <span className="block truncate text-xs text-muted-foreground">{detail}</span>
                    </span>
                    <Button asChild size="sm" variant="outline"><Link to={to}>{cta}</Link></Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">New members</CardTitle>
              <CardDescription>
                {isLoading ? 'Loading…' : `${formatCount(totalRegistrations, 'sign-up')} ${chartPeriod === 'weekly' ? 'in the last 7 days' : 'in the last 4 weeks'}`}
              </CardDescription>
              <CardAction>
                <Tabs value={chartPeriod} onValueChange={setChartPeriod}>
                  <TabsList aria-label="Chart period">
                    <TabsTrigger value="weekly">7 days</TabsTrigger>
                    <TabsTrigger value="monthly">4 weeks</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardAction>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-56 w-full" />
              ) : (
                <div className={cn('transition-opacity', chartLoading && 'opacity-50')} aria-busy={chartLoading || undefined}>
                  <ResponsiveContainer width="100%" height={224}>
                    <BarChart data={chartData} barSize={chartPeriod === 'weekly' ? 28 : 40} margin={{ left: 0, right: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
                      <XAxis dataKey="day" tick={CHART.tick} axisLine={false} tickLine={false} />
                      <YAxis tick={CHART.tick} axisLine={false} tickLine={false} width={32} allowDecimals={false} />
                      <Tooltip
                        cursor={{ fill: '#ECFDF5' }}
                        contentStyle={{ background: '#1C1917', border: 'none', borderRadius: 8, fontSize: 12, color: '#fff' }}
                        formatter={(v) => [formatCount(v, 'new member'), '']}
                        separator=""
                      />
                      <Bar dataKey="value" fill={CHART.color} radius={[4, 4, 0, 0]} name="Sign-ups" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Membership</CardTitle></CardHeader>
            <CardContent>
              <dl className="divide-y">
                {membership.map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                    <dt className="text-sm text-muted-foreground">{label}</dt>
                    <dd className="text-sm font-semibold tabular-nums">
                      {isLoading ? <Skeleton className="h-4 w-8" /> : value.toLocaleString()}
                    </dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent activity</CardTitle>
              <CardAction>
                <Button asChild variant="ghost" size="sm"><Link to="/admin/users">People <ArrowRight aria-hidden="true" /></Link></Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
              ) : recentActivity.length > 0 ? (
                <ul className="space-y-4">
                  {recentActivity.map((a, index) => (
                    <li key={`${a.title}-${index}`} className="flex items-start gap-3">
                      <span className={cn('grid size-8 shrink-0 place-items-center rounded-md', a.icon_bg || a.iconBg || 'bg-muted')}>
                        <Icon name={a.icon} className="text-sm" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{a.title}</span>
                        <span className="block truncate text-xs text-muted-foreground">{a.description}</span>
                      </span>
                      <span className="whitespace-nowrap text-xs text-muted-foreground">{a.time || formatRelativeTime(a.timestamp)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No activity yet. New sign-ups and reviews will appear here.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Shortcuts</CardTitle></CardHeader>
            <CardContent className="grid gap-2">
              {quickLinks.map(({ to, icon: LinkIcon, label }) => (
                <Button key={to} asChild variant="outline" className="justify-start">
                  <Link to={to}><LinkIcon aria-hidden="true" /> {label}</Link>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboardPage;
