import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PropTypes from 'prop-types';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import { useMyNests } from '../../nest/hooks/useNests';
import { useEagletsByNest, useAwardManualPoints } from '../hooks/usePoints';

const schema = z.object({
    points: z.number({ invalid_type_error: 'Points must be a number' })
        .int('Points must be a whole number')
        .min(1, 'Minimum 1 point')
        .max(1000, 'Maximum 1000 points'),
    description: z.string()
        .min(5, 'Description must be at least 5 characters')
        .max(250, 'Description must be under 250 characters'),
});

const AwardPointsModal = ({ isOpen, onClose, prefillEagletId = null, prefillNestId = null }) => {
    const [selectedNestId, setSelectedNestId] = useState(prefillNestId || '');
    const [selectedEagletId, setSelectedEagletId] = useState(prefillEagletId || '');

    // useMyNests() calls GET /nests/my/ — scoped to the Eagle's own nests
    const { data: nestsData } = useMyNests();
    const nests = nestsData?.data?.results || nestsData?.data || [];

    const { data: eagletsData, isLoading: eagletsLoading } = useEagletsByNest(selectedNestId);
    const eaglets = eagletsData?.data || [];

    const awardMutation = useAwardManualPoints();

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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl p-6 z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                            <span className="material-symbols-outlined text-emerald-600">military_tech</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Award Points</h2>
                            <p className="text-xs text-slate-500">Reward your eaglet&apos;s progress</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    {/* Nest selector — hidden when pre-filled from dashboard row */}
                    {!prefillNestId && (
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-slate-700">
                                Select Nest
                            </label>
                            <select
                                value={selectedNestId}
                                onChange={(e) => {
                                    setSelectedNestId(e.target.value);
                                    setSelectedEagletId('');
                                }}
                                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                            >
                                <option value="">Choose a Nest...</option>
                                {nests.map((nest) => (
                                    <option key={nest.id} value={nest.id}>{nest.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Eaglet selector — disabled until nest is chosen */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-slate-700">
                            Select Eaglet
                        </label>
                        <select
                            value={selectedEagletId}
                            onChange={(e) => setSelectedEagletId(e.target.value)}
                            disabled={(!selectedNestId && !prefillNestId) || eagletsLoading}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <option value="">
                                {eagletsLoading ? 'Loading eaglets...' : 'Choose an eaglet...'}
                            </option>
                            {eaglets.map((e) => (
                                <option key={e.id} value={e.id}>
                                    {e.full_name || `${e.first_name} ${e.last_name}`}
                                </option>
                            ))}
                        </select>
                        {!selectedNestId && !prefillNestId && (
                            <p className="text-xs text-slate-400">Select a Nest first</p>
                        )}
                    </div>

                    {/* Points input */}
                    <Input
                        label="Points to Award"
                        type="number"
                        placeholder="e.g. 50"
                        error={errors.points?.message}
                        {...register('points', { valueAsNumber: true })}
                    />

                    {/* Description */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-slate-700">
                            Reason <span className="text-slate-400 font-normal">(required)</span>
                        </label>
                        <textarea
                            placeholder="e.g. Excellent submission on the leadership module..."
                            rows={3}
                            className={`w-full border rounded-lg px-3 py-2.5 text-sm text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                                errors.description ? 'border-red-300' : 'border-slate-200'
                            }`}
                            {...register('description')}
                        />
                        {errors.description && (
                            <p className="text-xs text-red-500">{errors.description.message}</p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            type="button"
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="success"
                            loading={awardMutation.isPending}
                            disabled={!selectedEagletId}
                            className="flex-1"
                        >
                            Award Points
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

AwardPointsModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    prefillEagletId: PropTypes.string,
    prefillNestId: PropTypes.string,
};

export default AwardPointsModal;
