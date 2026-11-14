/**
 * ActiveProgramCard — the mentee's program state (shadcn Card).
 *
 * Three states from access_status:
 *   - active program  -> name, nest, objectives progress, Open nest
 *   - pending request -> waiting on mentor approval
 *   - empty           -> browse communities
 */
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Compass, Flag } from 'lucide-react';
import { useActiveProgram, usePendingProgramRequest } from '@store';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatCount } from '@shared/utils/format';

export default function ActiveProgramCard() {
  const active = useActiveProgram();
  const pending = usePendingProgramRequest();

  if (active) {
    const total = active.objectives_count ?? 0;
    const done = active.objectives_completed ?? 0;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return (
      <Card>
        <CardHeader>
          <CardDescription>Your program</CardDescription>
          <CardTitle className="text-xl">{active.name || 'Your program'}</CardTitle>
          {active.nest_name && <p className="text-sm text-muted-foreground">in {active.nest_name}</p>}
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Flag className="size-4" aria-hidden="true" />
              {formatCount(total, 'objective')}
            </span>
            {active.objectives_completed !== undefined && (
              <span className="font-medium text-foreground">{done} done</span>
            )}
          </div>
          {total > 0 && <Progress value={pct} aria-label={`${pct}% of objectives complete`} />}
        </CardContent>
        <CardFooter>
          <Button asChild variant="outline">
            <Link to="/eaglet/nest">
              Open nest <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (pending) {
    return (
      <Card className="border-amber-200 bg-amber-50/60">
        <CardHeader className="flex flex-row items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-amber-100 text-amber-800">
            <Clock className="size-5" aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <CardTitle className="text-base text-amber-950">Application pending</CardTitle>
            <CardDescription className="text-amber-900">
              {pending.nest_name
                ? `Awaiting approval from ${pending.nest_name}. You’ll be notified as soon as your mentor responds.`
                : 'Your application is awaiting mentor approval.'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardFooter>
          <Button asChild variant="link" className="h-auto p-0 text-amber-950">
            <Link to="/eaglet/nest">View request <ArrowRight aria-hidden="true" /></Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Join a community</CardTitle>
        <CardDescription>
          Apply to a mentor’s program to unlock assignments, messages and resources.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button asChild>
          <Link to="/eaglet/nest"><Compass aria-hidden="true" /> Browse communities</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
