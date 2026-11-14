import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { ArrowRight, Award, CalendarDays, ClipboardCheck, Upload, UserPlus, Users } from 'lucide-react';
import DashboardLayout from '../../shared/components/layout/DashboardLayout';
import PageHeader from '../../shared/components/layout/PageHeader';
import { useAuthStore } from '@store';
import { useEagleDashboardStats } from '../../modules/analytics/hooks/useAnalytics';
import LoadError from '../../shared/components/ui/LoadError';
import Avatar from '../../shared/components/ui/Avatar';
import AwardPointsModal from '../../modules/points/components/AwardPointsModal';
import { getEagletStatus } from '../../shared/utils/eagletStatus';
import { formatCount, formatDate } from '@shared/utils/format';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

const CHART = { color: '#047857', grid: '#E7E5E4', tick: { fontSize: 11, fill: '#78716C' } };
const TOOLTIP = { background: '#1C1917', border: 'none', borderRadius: 8, fontSize: 12, color: '#fff' };

function greeting(now = new Date()) {
  const h = now.getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

function StatusBadge({ status }) {
  const config = getEagletStatus(status);
  return <Badge variant="secondary" className={cn('font-medium', config.bg, config.text)}>{config.label}</Badge>;
}

/** The mentor's to-do list: the reason to open the dashboard. */
function NeedsAttention({ pendingRequests, nextSession }) {
  const rows = [
    {
      icon: UserPlus,
      tone: 'bg-amber-50 text-amber-800',
      title: pendingRequests > 0 ? `${formatCount(pendingRequests, 'join request')} waiting` : 'No join requests',
      detail: pendingRequests > 0 ? 'Eaglets are waiting for your answer.' : 'You’re up to date.',
      action: pendingRequests > 0 ? { label: 'Review', to: '/eagle/nests' } : null,
    },
    {
      icon: ClipboardCheck,
      tone: 'bg-sky-50 text-sky-800',
      title: 'Grade submitted work',
      detail: 'Scores and feedback reach eaglets straight away.',
      action: { label: 'Open grading', to: '/eagle/grading' },
    },
    {
      icon: CalendarDays,
      tone: 'bg-emerald-50 text-emerald-800',
      title: nextSession ? nextSession.title : 'No sessions scheduled',
      detail: nextSession ? formatDate(nextSession.date, { withTime: true }) : 'Schedule a session to keep your nest connected.',
      action: nextSession?.link
        ? { label: 'Join', href: nextSession.link }
        : { label: nextSession ? 'View' : 'Schedule', to: '/eagle/nests' },
    },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Needs you today</CardTitle>
        <CardDescription>Requests, grading and your next session.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="divide-y rounded-lg border">
          {rows.map(({ icon: RowIcon, tone, title, detail, action }) => (
            <li key={title} className="flex items-center gap-3 p-3">
              <span className={cn('grid size-9 shrink-0 place-items-center rounded-md', tone)}>
                <RowIcon className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-foreground">{title}</span>
                <span className="block truncate text-xs text-muted-foreground">{detail}</span>
              </span>
              {action && (
                <Button asChild size="sm" variant="outline">
                  {action.href
                    ? <a href={action.href} target="_blank" rel="noopener noreferrer">{action.label}</a>
                    : <Link to={action.to}>{action.label}</Link>}
                </Button>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function EagletsCard({ eaglets, onAward }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Your eaglets</CardTitle>
        <CardDescription>Where each eaglet is in their program.</CardDescription>
        {eaglets.length > 0 && (
          <CardAction>
            <Button asChild variant="ghost" size="sm">
              <Link to="/eagle/eaglets">View all <ArrowRight aria-hidden="true" /></Link>
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        {eaglets.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-10 text-center">
            <Users className="size-6 text-muted-foreground" aria-hidden="true" />
            <div className="space-y-1">
              <p className="text-sm font-medium">No eaglets yet</p>
              <p className="text-sm text-muted-foreground">
                Share your nest so mentees can request to join, then add lessons for them.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Button asChild size="sm"><Link to="/eagle/nests">Open my nest</Link></Button>
              <Button asChild size="sm" variant="outline"><Link to="/eagle/content">Add content</Link></Button>
            </div>
          </div>
        ) : (
          <>
            {/* Phones: list */}
            <ul className="divide-y rounded-lg border md:hidden">
              {eaglets.map((e) => (
                <li key={e.id} className="space-y-2 p-3">
                  <div className="flex items-center gap-3">
                    <Avatar user={e} name={e.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{e.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{e.module || 'In progress'}</p>
                    </div>
                    <StatusBadge status={e.status} />
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={e.progress} className="flex-1" aria-label={`${e.name}: ${e.progress}% complete`} />
                    <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">{e.progress}%</span>
                    <Button size="sm" variant="ghost" onClick={() => onAward(e)} aria-label={`Award points to ${e.name}`}>
                      <Award aria-hidden="true" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
            {/* Tablet and up: table */}
            <div className="hidden rounded-lg border md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Eaglet</TableHead>
                    <TableHead>Current module</TableHead>
                    <TableHead className="w-44">Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-24 text-right"><span className="sr-only">Actions</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eaglets.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar user={e} name={e.name} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate font-medium">{e.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{e.nest_name || 'No nest'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{e.module || 'In progress'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={e.progress} aria-label={`${e.name}: ${e.progress}% complete`} />
                          <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">{e.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell><StatusBadge status={e.status} /></TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" onClick={() => onAward(e)}>
                          <Award aria-hidden="true" /> Award
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function ChartCard({ title, description, children }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3" aria-busy="true" aria-label="Loading your dashboard">
      <div className="space-y-6 lg:col-span-2">
        <Skeleton className="h-56 w-full rounded-xl" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-52 w-full rounded-xl" />
      </div>
    </div>
  );
}

/**
 * Mentor home — workload first: what needs the mentor now, then how the
 * eaglets are doing, with nest trends alongside.
 */
const EagleDashboardPage = () => {
  const { user } = useAuthStore();
  const { data, isLoading, isError, refetch } = useEagleDashboardStats();
  const [award, setAward] = useState({ open: false, eagletId: null, nestId: null });

  const totalEaglets = data?.total_eaglets || 0;
  const pendingRequests = data?.pending_requests || 0;
  const pointsAwarded = data?.points_awarded || 0;
  const eaglets = (data?.eaglets || []).slice(0, 6);
  const sessions = (data?.upcoming_sessions || []).filter((s) => new Date(s.date) >= new Date()).slice(0, 3);

  const openAward = (e) => setAward({ open: true, eagletId: e?.id ?? null, nestId: e?.nest_id ?? null });

  return (
    <DashboardLayout variant="eagle">
      <PageHeader
        title={`${greeting()}, ${user?.first_name || 'mentor'}`}
        description="Here’s what needs you today and how your eaglets are doing."
        actions={(
          <>
            <Button variant="outline" onClick={() => openAward(null)}><Award aria-hidden="true" /> Award points</Button>
            <Button asChild><Link to="/eagle/content/upload"><Upload aria-hidden="true" /> Upload lesson</Link></Button>
          </>
        )}
      />

      {isLoading ? (
        <DashboardSkeleton />
      ) : isError ? (
        <LoadError variant="page" title="We couldn’t load your dashboard" retryLabel="Try again" onRetry={() => refetch()} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
            <NeedsAttention pendingRequests={pendingRequests} nextSession={sessions[0]} />
            <EagletsCard eaglets={eaglets} onAward={openAward} />
          </div>

          <div className="flex min-w-0 flex-col gap-6">
            <Card>
              <CardHeader><CardTitle className="text-lg">Your nest</CardTitle></CardHeader>
              <CardContent>
                <dl className="divide-y">
                  {[
                    ['Eaglets', totalEaglets.toLocaleString()],
                    ['Join requests', pendingRequests.toLocaleString()],
                    ['Points awarded', pointsAwarded.toLocaleString()],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                      <dt className="text-sm text-muted-foreground">{label}</dt>
                      <dd className="text-sm font-semibold tabular-nums">{value}</dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>

            <ChartCard title="Average completion" description="Across your eaglets, last 8 weeks">
              <ResponsiveContainer width="100%" height={150}>
                <AreaChart data={data?.completion_by_week ?? []} margin={{ left: 0, right: 4 }}>
                  <defs>
                    <linearGradient id="eagleCompletion" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART.color} stopOpacity={0.18} />
                      <stop offset="95%" stopColor={CHART.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
                  <XAxis dataKey="week" tick={CHART.tick} axisLine={false} tickLine={false} />
                  <YAxis tick={CHART.tick} axisLine={false} tickLine={false} width={44} domain={[0, 100]} unit="%" />
                  <Tooltip contentStyle={TOOLTIP} formatter={(v) => [`${v}%`, 'Average completion']} />
                  <Area type="monotone" dataKey="completion" stroke={CHART.color} strokeWidth={2} fill="url(#eagleCompletion)" dot={false} name="Completion" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Points awarded" description="Per week, all nests">
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={data?.points_by_week ?? []} barSize={14} margin={{ left: 0, right: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
                  <XAxis dataKey="week" tick={CHART.tick} axisLine={false} tickLine={false} />
                  <YAxis tick={CHART.tick} axisLine={false} tickLine={false} width={44} allowDecimals={false} />
                  <Tooltip contentStyle={TOOLTIP} cursor={{ fill: '#ECFDF5' }} />
                  <Bar dataKey="points" fill={CHART.color} radius={[4, 4, 0, 0]} name="Points" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {sessions.length > 1 && (
              <Card>
                <CardHeader><CardTitle className="text-lg">Upcoming sessions</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {sessions.map((s) => (
                      <li key={`${s.title}-${s.date}`} className="flex items-start gap-3">
                        <CalendarDays className="mt-0.5 size-4 shrink-0 text-emerald-700" aria-hidden="true" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{s.title}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(s.date, { withTime: true })}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      <AwardPointsModal
        isOpen={award.open}
        onClose={() => setAward({ open: false, eagletId: null, nestId: null })}
        prefillEagletId={award.eagletId}
        prefillNestId={award.nestId}
      />
    </DashboardLayout>
  );
};

export default EagleDashboardPage;
