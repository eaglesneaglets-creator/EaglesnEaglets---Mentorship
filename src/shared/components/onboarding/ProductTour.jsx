import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const LG = 1024;
const PAD = 6; // spotlight padding around the target, px

const findTarget = (step) => {
  if (!step || typeof document === 'undefined') return null;
  const mobile = window.innerWidth < LG;
  const ids = mobile && step.mobileTarget ? [step.mobileTarget, step.target] : [step.target];
  for (const id of ids) {
    const el = document.querySelector(`[data-tour="${id}"]`);
    if (el) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) return el;
    }
  }
  return null;
};

/**
 * ProductTour — welcome dialog, then coach marks that spotlight real UI.
 *
 * - Spotlight: a fixed "hole" sized to the target with a huge box-shadow
 *   scrim; it follows the element on resize/scroll.
 * - Card: shadcn Popover anchored to the target rect (Radix handles
 *   placement and collisions). Targets that aren't on screen get a centred card.
 * - Keyboard: → / Enter next, ← back, Esc ends the tour. Focus moves to each card.
 * - Respects prefers-reduced-motion (no position transitions).
 */
export default function ProductTour({ tour, open, onFinish }) {
  const [index, setIndex] = useState(-1); // -1 = welcome dialog
  const [rect, setRect] = useState(null);
  const targetRef = useRef(null);
  const steps = tour?.steps || [];
  const step = index >= 0 ? steps[index] : null;
  const isLast = index === steps.length - 1;

  const measure = useCallback(() => {
    const el = targetRef.current;
    setRect(el ? el.getBoundingClientRect() : null);
  }, []);

  // Locate the target for the current step and keep its rect fresh.
  // (Rendered only while open — the parent mounts it fresh each run, so
  // index starts on the welcome screen without a reset effect.)
  useLayoutEffect(() => {
    if (!open || !step) {
      targetRef.current = null;
      return undefined;
    }
    const el = findTarget(step);
    targetRef.current = el;
    if (el) el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    let frame = requestAnimationFrame(measure);
    const onChange = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    window.addEventListener('resize', onChange);
    window.addEventListener('scroll', onChange, true);
    const ro = typeof ResizeObserver !== 'undefined' && el ? new ResizeObserver(onChange) : null;
    ro?.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', onChange);
      window.removeEventListener('scroll', onChange, true);
      ro?.disconnect();
    };
  }, [open, step, measure]);

  const finish = useCallback((completed) => onFinish?.({ completed }), [onFinish]);
  const next = useCallback(() => (isLast ? finish(true) : setIndex((i) => i + 1)), [isLast, finish]);
  const back = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

  useEffect(() => {
    if (!open || index < 0) return undefined;
    const onKey = (event) => {
      if (event.key === 'ArrowRight') { event.preventDefault(); next(); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); back(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, index, next, back]);

  const virtualRef = useMemo(
    () => ({ current: { getBoundingClientRect: () => targetRef.current?.getBoundingClientRect() ?? new DOMRect() } }),
    [],
  );

  if (!open || !tour) return null;

  // Welcome
  if (index < 0) {
    return (
      <Dialog open onOpenChange={(o) => { if (!o) finish(false); }}>
        <DialogContent className="sm:max-w-md" data-testid="tour-welcome">
          <DialogHeader>
            <DialogTitle className="text-xl">{tour.welcome.title}</DialogTitle>
            <DialogDescription className="text-base leading-relaxed">{tour.welcome.body}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-between">
            <Button variant="ghost" onClick={() => finish(false)}>Not now</Button>
            <Button onClick={() => setIndex(0)} autoFocus>
              Show me around
              <span className="text-xs opacity-80">· {steps.length} steps</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const hasTarget = Boolean(rect);
  const side = step.side || (window.innerWidth < LG ? 'top' : 'right');

  return (
    <>
      {/* Scrim + spotlight. Blocks clicks on the page while the tour runs. */}
      <div className="fixed inset-0 z-[60]" aria-hidden="true" onClick={(e) => e.stopPropagation()}>
        {hasTarget ? (
          <>
            {/* SVG mask cut-out: robust where a 9999px box-shadow is not painted. */}
            <svg className="pointer-events-none fixed inset-0 size-full" aria-hidden="true">
              <defs>
                <mask id="tour-spotlight-mask">
                  <rect width="100%" height="100%" fill="white" />
                  <rect
                    x={rect.left - PAD}
                    y={rect.top - PAD}
                    width={rect.width + PAD * 2}
                    height={rect.height + PAD * 2}
                    rx="10"
                    fill="black"
                  />
                </mask>
              </defs>
              <rect width="100%" height="100%" fill="#1c1917" fillOpacity="0.6" mask="url(#tour-spotlight-mask)" />
            </svg>
            <div
              className="pointer-events-none fixed rounded-[10px] outline-2 outline-offset-0 outline-white motion-safe:transition-all motion-safe:duration-200 motion-safe:ease-out"
              style={{
                top: rect.top - PAD,
                left: rect.left - PAD,
                width: rect.width + PAD * 2,
                height: rect.height + PAD * 2,
              }}
            />
          </>
        ) : (
          <div className="fixed inset-0 bg-stone-900/55" />
        )}
      </div>

      <Popover open modal={false}>
        {hasTarget ? (
          <PopoverAnchor virtualRef={virtualRef} />
        ) : (
          <PopoverAnchor className="fixed top-1/2 left-1/2 size-0" />
        )}
        <PopoverContent
          key={index}
          side={hasTarget ? side : 'bottom'}
          align="start"
          sideOffset={hasTarget ? PAD + 10 : 0}
          collisionPadding={12}
          onEscapeKeyDown={() => finish(false)}
          onInteractOutside={(e) => e.preventDefault()}
          onOpenAutoFocus={(e) => { e.preventDefault(); e.currentTarget?.focus?.(); }}
          tabIndex={-1}
          role="dialog"
          aria-modal="false"
          aria-labelledby="tour-step-title"
          aria-describedby="tour-step-body"
          className={cn('z-[61] w-80 max-w-[calc(100vw-1.5rem)] p-0 outline-none', !hasTarget && '-translate-x-1/2 -translate-y-1/2')}
          data-testid="tour-step"
        >
          <div className="space-y-2 p-4">
            <p className="text-xs font-medium text-muted-foreground" aria-live="polite">
              Step {index + 1} of {steps.length}
            </p>
            <h2 id="tour-step-title" className="text-base font-semibold leading-snug text-foreground">{step.title}</h2>
            <p id="tour-step-body" className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
          </div>
          <div className="flex items-center gap-1 px-4 pb-1" aria-hidden="true">
            {steps.map((s, i) => (
              <span
                key={s.title}
                className={cn('h-1 flex-1 rounded-full', i <= index ? 'bg-primary' : 'bg-muted')}
              />
            ))}
          </div>
          <div className="flex items-center justify-between gap-2 p-3">
            <Button variant="ghost" size="sm" onClick={() => finish(false)}>Skip tour</Button>
            <div className="flex gap-2">
              {index > 0 && <Button variant="outline" size="sm" onClick={back}>Back</Button>}
              <Button size="sm" onClick={next}>{isLast ? 'Finish' : 'Next'}</Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}

ProductTour.propTypes = {
  tour: PropTypes.shape({
    id: PropTypes.string.isRequired,
    welcome: PropTypes.shape({ title: PropTypes.string, body: PropTypes.string }).isRequired,
    steps: PropTypes.arrayOf(PropTypes.shape({
      target: PropTypes.string.isRequired,
      mobileTarget: PropTypes.string,
      title: PropTypes.string.isRequired,
      body: PropTypes.string.isRequired,
      side: PropTypes.oneOf(['top', 'right', 'bottom', 'left']),
    })).isRequired,
  }),
  open: PropTypes.bool.isRequired,
  onFinish: PropTypes.func,
};
