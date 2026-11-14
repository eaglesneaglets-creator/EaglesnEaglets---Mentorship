import { useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Compass, Flame, Play, Quote, Sparkles } from 'lucide-react';
import DashboardLayout from '../../shared/components/layout/DashboardLayout';
import PageHeader from '../../shared/components/layout/PageHeader';
import { useAuthStore, useHasActiveProgram } from '@store';
import { formatCount } from '@shared/utils/format';
import { useEagletDashboardStats, useCheckIn } from '../../modules/analytics/hooks/useAnalytics';
import { toast } from '@shared/components/ui/toast-utils';
import BadgeShelf from '../../shared/components/ui/BadgeShelf';
import ActiveProgramCard from '../../shared/components/dashboard/ActiveProgramCard';
import MenteeLevelCard from '../../shared/components/dashboard/MenteeLevelCard';
import Icon from '@shared/components/ui/Icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const DAILY_VERSES = [
  { text: 'But those who hope in the Lord will renew their strength. They will soar on wings like eagles.', ref: 'Isaiah 40:31' },
  { text: 'I can do all this through him who gives me strength.', ref: 'Philippians 4:13' },
  { text: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you.', ref: 'Jeremiah 29:11' },
  { text: 'Trust in the Lord with all your heart and lean not on your own understanding.', ref: 'Proverbs 3:5' },
  { text: 'Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you.', ref: 'Joshua 1:9' },
  { text: 'The Lord is my shepherd, I lack nothing.', ref: 'Psalm 23:1' },
  { text: 'And we know that in all things God works for the good of those who love him.', ref: 'Romans 8:28' },
  { text: 'Do not conform to the pattern of this world, but be transformed by the renewing of your mind.', ref: 'Romans 12:2' },
  { text: 'Commit to the Lord whatever you do, and he will establish your plans.', ref: 'Proverbs 16:3' },
  { text: 'The steadfast love of the Lord never ceases; his mercies never come to an end.', ref: 'Lamentations 3:22' },
  { text: 'Cast all your anxiety on him because he cares for you.', ref: '1 Peter 5:7' },
  { text: 'Let your light shine before others, that they may see your good deeds.', ref: 'Matthew 5:16' },
  { text: 'No good thing does he withhold from those whose walk is blameless.', ref: 'Psalm 84:11' },
  { text: 'He gives strength to the weary and increases the power of the weak.', ref: 'Isaiah 40:29' },
];

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getDailyVerse(now = new Date()) {
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / 86400000);
  return DAILY_VERSES[dayOfYear % DAILY_VERSES.length];
}

function greeting(now = new Date()) {
  const h = now.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const CONTENT_META = {
  link: { icon: 'link', label: 'Link' },
  document: { icon: 'description', label: 'Document' },
  file: { icon: 'attachment', label: 'File' },
  video: { icon: 'play_circle', label: 'Video' },
};

/** Check-in + week strip + verse: the daily rhythm, in one card. */
function TodayCard({ streak, checkedIn, week, checkingIn, onCheckIn, verse }) {
  const todayIdx = new Date().getDay();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Today</CardTitle>
        <CardDescription>
          {checkedIn ? 'You’ve checked in. See you tomorrow.' : 'Check in to keep your streak going and earn 10 points.'}
        </CardDescription>
        <CardAction>
          <Badge variant="secondary" className="gap-1 bg-orange-50 text-orange-800">
            <Flame className="size-3.5" aria-hidden="true" /> {formatCount(streak, 'day')}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <ol className="flex gap-1.5" aria-label="This week’s check-ins">
            {WEEKDAYS.map((day, i) => {
              const done = Boolean(week[i]);
              return (
                <li
                  key={day}
                  className={cn(
                    'grid size-9 place-items-center rounded-full text-xs font-semibold',
                    done ? 'bg-emerald-700 text-white' : 'bg-muted text-muted-foreground',
                    i === todayIdx && !done && 'ring-2 ring-emerald-700/40',
                  )}
                  aria-label={`${day}: ${done ? 'checked in' : 'not checked in'}${i === todayIdx ? ' (today)' : ''}`}
                >
                  {done ? <Check className="size-4" aria-hidden="true" /> : <span aria-hidden="true">{day[0]}</span>}
                </li>
              );
            })}
          </ol>
          <Button onClick={onCheckIn} disabled={checkedIn || checkingIn} className="sm:min-w-36">
            {checkedIn ? (<><Check aria-hidden="true" /> Checked in</>) : checkingIn ? 'Checking in…' : 'Check in'}
          </Button>
        </div>

        <Separator />

        <figure className="space-y-2">
          <Quote className="size-5 text-emerald-700" aria-hidden="true" />
          <blockquote className="text-base leading-relaxed text-foreground italic">
            “{verse.text}”
          </blockquote>
          <figcaption className="text-sm font-medium text-muted-foreground">{verse.ref}</figcaption>
        </figure>
      </CardContent>
    </Card>
  );
}

function NewContentCard({ items, loading, hasActiveProgram }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">New from your mentor</CardTitle>
        <CardDescription>Lessons and resources shared with your nest.</CardDescription>
        {items.length > 0 && (
          <CardAction>
            <Button asChild variant="ghost" size="sm">
              <Link to="/eaglet/resources">View all <ArrowRight aria-hidden="true" /></Link>
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3" aria-hidden="true">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : items.length > 0 ? (
          <ul className="divide-y rounded-lg border">
            {items.map((item, index) => {
              const meta = CONTENT_META[item.type] || { icon: 'article', label: item.type };
              return (
                <li key={item.id || index} className="flex items-center gap-3 p-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-md bg-sky-50 text-sky-800">
                    <Icon name={meta.icon} className="text-base" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">{item.title}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {[item.nestName, meta.label].filter(Boolean).join(' · ')}
                    </span>
                  </span>
                  <Badge variant="outline">New</Badge>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-10 text-center">
            <Compass className="size-6 text-muted-foreground" aria-hidden="true" />
            <div className="space-y-1">
              <p className="text-sm font-medium">{hasActiveProgram ? 'Nothing new yet' : 'Join a nest to start learning'}</p>
              <p className="text-sm text-muted-foreground">
                {hasActiveProgram
                  ? 'Your mentor will share lessons here as your program progresses.'
                  : 'Find a mentor whose nest matches your goals. Their lessons will show up here.'}
              </p>
            </div>
            {!hasActiveProgram && (
              <Button asChild size="sm">
                <Link to="/eaglet/nest">Discover mentors</Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ProgressSummary({ points, modules, streak, loading }) {
  const rows = [
    { label: 'Growth points', value: points.toLocaleString(), icon: <Sparkles className="size-4 text-emerald-700" aria-hidden="true" /> },
    { label: 'Modules completed', value: modules.toLocaleString(), icon: <Icon name="school" className="text-base text-sky-700" /> },
    { label: 'Current streak', value: formatCount(streak, 'day'), icon: <Flame className="size-4 text-orange-600" aria-hidden="true" /> },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Your progress</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="divide-y">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
              <dt className="flex items-center gap-2 text-sm text-muted-foreground">{row.icon}{row.label}</dt>
              <dd className="text-sm font-semibold tabular-nums text-foreground">
                {loading ? <Skeleton className="h-4 w-10" /> : row.value}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

/**
 * Eaglet home — "Today": the daily rhythm first (check in, verse), then the
 * program and what's new, with progress and badges alongside.
 */
const EagletDashboardPage = () => {
  const { user } = useAuthStore();
  const { data: dashboardData, isLoading } = useEagletDashboardStats();
  const { mutate: checkIn, isPending: isCheckingIn } = useCheckIn();
  const checkInLockRef = useRef(false);
  const verse = useMemo(() => getDailyVerse(), []);

  const points = dashboardData?.points || 0;
  const modulesCompleted = dashboardData?.modules_completed || 0;
  const streak = dashboardData?.streak || 0;
  const hasCheckedInToday = dashboardData?.has_checked_in_today || false;
  const weeklyCheckins = dashboardData?.weekly_checkins || [false, false, false, false, false, false, false];
  const recentContent = (dashboardData?.recent_content || []).slice(0, 4);

  // Enrollment truth lives in access_status (auth store); the analytics
  // payload does not carry active_program.
  const hasActiveProgramFromAccess = useHasActiveProgram();
  const hasActiveProgram = hasActiveProgramFromAccess
    || Boolean(dashboardData?.active_program || dashboardData?.has_active_program);

  const handleCheckIn = () => {
    if (checkInLockRef.current) return;
    checkInLockRef.current = true;
    checkIn(null, {
      onSuccess: () => toast.success('Checked in. You earned 10 points.'),
      onError: (error) => toast.error(error.message || 'Check-in didn’t go through. Please try again.'),
      onSettled: () => { checkInLockRef.current = false; },
    });
  };

  const today = new Intl.DateTimeFormat('en-GH', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());

  return (
    <DashboardLayout variant="eaglet">
      <PageHeader
        title={`${greeting()}, ${user?.first_name || 'friend'}`}
        description={today}
        actions={hasActiveProgram ? (
          <Button asChild size="lg">
            <Link to="/eaglet/assignments"><Play aria-hidden="true" /> Continue learning</Link>
          </Button>
        ) : (
          <Button asChild size="lg">
            <Link to="/eaglet/nest"><Compass aria-hidden="true" /> Find a mentor</Link>
          </Button>
        )}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <TodayCard
            streak={streak}
            checkedIn={hasCheckedInToday}
            week={weeklyCheckins}
            checkingIn={isCheckingIn}
            onCheckIn={handleCheckIn}
            verse={verse}
          />
          <ActiveProgramCard />
          <NewContentCard items={recentContent} loading={isLoading} hasActiveProgram={hasActiveProgram} />
        </div>

        <div className="flex flex-col gap-6">
          <ProgressSummary points={points} modules={modulesCompleted} streak={streak} loading={isLoading} />
          <MenteeLevelCard />
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <BadgeShelf />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EagletDashboardPage;
