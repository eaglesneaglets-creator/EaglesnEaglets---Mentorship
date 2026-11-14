import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PropTypes from 'prop-types';
import { Award, Loader2, Wallet } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { useOwnedNests } from '../../nest/hooks/useNests';
import { useEagletsByNest, useAwardManualPoints, useAwardBudget } from '../hooks/usePoints';


const descriptionRule = z.string()
    .min(5, 'Description must be at least 5 characters')
    .max(250, 'Description must be under 250 characters');

/**
 * Build the validation schema from the LIVE policy (Phase 31-02).
 *
 * Deliberately not a module-level constant: a superadmin can change the ceiling
 * at runtime, and this component must never hold its own copy of the limit —
 * that drift is exactly what Phase 31 removed on the backend. Admins
 * (`is_enforced === false`) get no upper bound.
 */
const buildSchema = (budget) => {
    let points = z.number({ invalid_type_error: 'Points must be a number' })
        .int('Points must be a whole number')
        .min(1, 'Minimum 1 point');

    if (budget?.is_enforced) {
        const perAward = budget.max_per_award ?? Infinity;
        const remaining = budget.remaining ?? Infinity;
        const cap = Math.min(perAward, remaining);
        if (Number.isFinite(cap)) {
            const message = cap === remaining && remaining < perAward
                ? `Only ${remaining} points left in today's budget`
                : `Maximum ${cap} points per award`;
            points = points.max(cap, message);
        }
    }

    return z.object({ points, description: descriptionRule });
};

const AwardPointsModal = ({ isOpen, onClose, prefillEagletId = null, prefillNestId = null }) => {
    const [selectedNestId, setSelectedNestId] = useState(prefillNestId || '');
    const [selectedEagletId, setSelectedEagletId] = useState(prefillEagletId || '');

    // Mentor awarding points must pick from nests they OWN, not nests
    // they're a member of (which is empty for eagles).
    const { data: nestsData } = useOwnedNests();
    const nests = nestsData?.data?.results || nestsData?.data || [];

    const { data: eagletsData, isLoading: eagletsLoading } = useEagletsByNest(selectedNestId);
    const eaglets = eagletsData?.data || [];

    // Only fetch while the modal is open.
    const { data: budgetData } = useAwardBudget({ enabled: isOpen });
    const budget = budgetData?.data ?? budgetData ?? null;

    const isLimited = Boolean(budget?.is_enforced);
    const remaining = isLimited ? (budget.remaining ?? 0) : null;
    const budgetExhausted = isLimited && remaining <= 0;

    const awardMutation = useAwardManualPoints();

    const schema = useMemo(() => buildSchema(budget), [budget]);

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { points: '', description: '' },
    });

    const handleClose = () => {
        reset();
        setSelectedNestId(prefillNestId || '');
        setSelectedEagletId(prefillEagletId || '');
        onClose();
    };

    const onSubmit = (formData) => {
        if (!selectedEagletId) return;
        awardMutation.mutate(
            {
                eaglet_id: selectedEagletId,
                points: formData.points,
                description: formData.description,
                ...(selectedNestId && { nest_id: selectedNestId }),
            },
            { onSuccess: handleClose }
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Award className="size-5 text-emerald-700" aria-hidden="true" />
                        Award points
                    </DialogTitle>
                    <DialogDescription>Recognise an eaglet’s effort. They’ll be notified straight away.</DialogDescription>
                </DialogHeader>

                {/* Daily budget: only for users the policy applies to (admins see nothing). */}
                {isLimited && (
                    <Alert variant={budgetExhausted ? 'destructive' : 'default'} className={budgetExhausted ? '' : 'bg-muted/50'}>
                        <Wallet aria-hidden="true" />
                        <AlertDescription>
                            {budgetExhausted ? (
                                <span>
                                    <strong>Daily limit reached.</strong> You’ve awarded all {budget.daily_limit} of
                                    today’s points. Your budget resets tomorrow.
                                </span>
                            ) : (
                                <span>
                                    <strong>{remaining}</strong> of {budget.daily_limit} points left today
                                    {budget.max_per_award != null && (<> · max <strong>{budget.max_per_award}</strong> per award</>)}
                                </span>
                            )}
                        </AlertDescription>
                    </Alert>
                )}

                <form id="award-points-form" onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
                    {!prefillNestId && (
                        <div className="grid gap-2">
                            <Label htmlFor="award-nest">Nest</Label>
                            <NativeSelect
                                id="award-nest"
                                value={selectedNestId}
                                onChange={(e) => { setSelectedNestId(e.target.value); setSelectedEagletId(''); }}
                                wrapperClassName="w-full"
                            >
                                <NativeSelectOption value="">Choose a nest…</NativeSelectOption>
                                {nests.map((nest) => (
                                    <NativeSelectOption key={nest.id} value={nest.id}>{nest.name}</NativeSelectOption>
                                ))}
                            </NativeSelect>
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="award-eaglet">Eaglet</Label>
                        <NativeSelect
                            id="award-eaglet"
                            value={selectedEagletId}
                            onChange={(e) => setSelectedEagletId(e.target.value)}
                            disabled={(!selectedNestId && !prefillNestId) || eagletsLoading}
                            aria-describedby={!selectedNestId && !prefillNestId ? 'award-eaglet-hint' : undefined}
                            wrapperClassName="w-full"
                        >
                            <NativeSelectOption value="">{eagletsLoading ? 'Loading eaglets…' : 'Choose an eaglet…'}</NativeSelectOption>
                            {eaglets.map((e) => (
                                <NativeSelectOption key={e.id} value={e.id}>
                                    {e.full_name || `${e.first_name} ${e.last_name}`}
                                </NativeSelectOption>
                            ))}
                        </NativeSelect>
                        {!selectedNestId && !prefillNestId && (
                            <p id="award-eaglet-hint" className="text-xs text-muted-foreground">Choose a nest first.</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="award-points">Points to award</Label>
                        <Input
                            id="award-points"
                            type="number"
                            inputMode="numeric"
                            min={1}
                            placeholder={isLimited && budget.max_per_award != null ? `Up to ${budget.max_per_award}` : 'e.g. 10'}
                            disabled={budgetExhausted}
                            aria-invalid={Boolean(errors.points) || undefined}
                            aria-describedby={errors.points ? 'award-points-error' : undefined}
                            {...register('points', { valueAsNumber: true })}
                        />
                        {errors.points && <p id="award-points-error" className="text-xs text-destructive">{errors.points.message}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="award-reason">Reason</Label>
                        <Textarea
                            id="award-reason"
                            rows={3}
                            placeholder="e.g. Thoughtful submission on the leadership module"
                            aria-invalid={Boolean(errors.description) || undefined}
                            aria-describedby={errors.description ? 'award-reason-error' : 'award-reason-hint'}
                            {...register('description')}
                        />
                        {errors.description
                            ? <p id="award-reason-error" className="text-xs text-destructive">{errors.description.message}</p>
                            : <p id="award-reason-hint" className="text-xs text-muted-foreground">The eaglet sees this with their points.</p>}
                    </div>
                </form>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
                    <Button
                        type="submit"
                        form="award-points-form"
                        disabled={!selectedEagletId || budgetExhausted || awardMutation.isPending}
                    >
                        {awardMutation.isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Award aria-hidden="true" />}
                        {awardMutation.isPending ? 'Awarding…' : 'Award points'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

AwardPointsModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    prefillEagletId: PropTypes.string,
    prefillNestId: PropTypes.string,
};

export default AwardPointsModal;
