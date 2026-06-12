import { useFormContext } from 'react-hook-form';
import { Input, Select, Textarea } from '@components/ui';
import { PhotoUpload, FileDrop } from './UploadFields';
import { ChipPicker } from './ChipPicker';
import {
    MENTORSHIP_TYPES,
    MARITAL_STATUS_OPTIONS,
    EMPLOYMENT_STATUS_OPTIONS,
    COUNTRY_OPTIONS,
} from '../schemas/kyc-schemas';

const StepHead = ({ title, subtitle }) => (
    <div className="mb-6">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-1.5">{title}</h3>
        <p className="text-sm text-slate-500">{subtitle}</p>
    </div>
);

export const IdentityStep = ({ pictureUrl, onPictureChange }) => {
    const { register, setValue, watch, formState: { errors } } = useFormContext();
    return (
        <>
            <StepHead title="Tell us who you are" subtitle="The basics. We use this to personalize your nest and verify identity." />
            <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Profile photo <span className="text-red-500" aria-label="required">*</span>
                </label>
                <PhotoUpload url={pictureUrl} onChange={onPictureChange} />
                {!pictureUrl && (
                    <p className="text-xs text-slate-500 mt-1.5">A clear face photo helps mentors recognize you.</p>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="Full legal name"
                    required
                    placeholder="As shown on your ID"
                    error={errors.full_name?.message}
                    {...register('full_name')}
                />
                <Input
                    label="National ID / Passport #"
                    required
                    placeholder="A12345678"
                    hint="encrypted"
                    error={errors.national_id_number?.message}
                    {...register('national_id_number')}
                />
                <Input
                    label="Phone number"
                    required
                    placeholder="+1 555 123 4567"
                    error={errors.phone_number?.message}
                    {...register('phone_number')}
                />
                <Select
                    label="Marital status"
                    required
                    value={watch('marital_status') || ''}
                    onChange={(e) => setValue('marital_status', e.target.value, { shouldValidate: true })}
                    options={MARITAL_STATUS_OPTIONS}
                    placeholder="Select…"
                    error={errors.marital_status?.message}
                />
            </div>
        </>
    );
};

export const ProfessionalStep = () => {
    const { register, setValue, watch, formState: { errors } } = useFormContext();
    const desc = watch('profile_description') || '';
    return (
        <>
            <StepHead title="Your professional life" subtitle="Eaglets choose mentors based partly on your career path. Be specific." />
            <Input
                label="Current location (city, country)"
                required
                placeholder="Boston, USA"
                error={errors.location?.message}
                {...register('location')}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Select
                    label="Employment status"
                    required
                    value={watch('employment_status') || ''}
                    onChange={(e) => setValue('employment_status', e.target.value, { shouldValidate: true })}
                    options={EMPLOYMENT_STATUS_OPTIONS}
                    placeholder="Select…"
                    error={errors.employment_status?.message}
                />
                <Input
                    label="LinkedIn (optional)"
                    placeholder="linkedin.com/in/you"
                    error={errors.linkedin_url?.message}
                    {...register('linkedin_url')}
                />
            </div>
            <div className="mt-4">
                <Textarea
                    label="Mentor bio"
                    required
                    rows={5}
                    placeholder="What's your story? What can you help with? Eaglets will read this to decide if you're the right Eagle for them."
                    error={errors.profile_description?.message}
                    {...register('profile_description')}
                />
                <p className={`text-xs mt-1.5 ${desc.trim().length >= 100 ? 'text-primary' : 'text-slate-500'}`}>
                    {desc.trim().length}/100+ chars {desc.trim().length >= 100 && '✓'}
                </p>
            </div>
        </>
    );
};

export const BackgroundStep = () => {
    const { register, setValue, watch, formState: { errors } } = useFormContext();
    const bio = watch('bio') || '';
    return (
        <>
            <StepHead title="Where you're flying from" subtitle="Helps us match you with mentors in your timezone and culture." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                    label="Country"
                    required
                    value={watch('country') || ''}
                    onChange={(e) => setValue('country', e.target.value, { shouldValidate: true })}
                    options={COUNTRY_OPTIONS}
                    placeholder="Select country…"
                    error={errors.country?.message}
                />
                <Input
                    label="City"
                    required
                    placeholder="Accra"
                    error={errors.city?.message}
                    {...register('city')}
                />
                <Input
                    label="Area / Neighbourhood"
                    placeholder="e.g. Osu"
                    error={errors.location?.message}
                    {...register('location')}
                />
                <Select
                    label="Employment / education status"
                    required
                    value={watch('employment_status') || ''}
                    onChange={(e) => setValue('employment_status', e.target.value, { shouldValidate: true })}
                    options={EMPLOYMENT_STATUS_OPTIONS}
                    placeholder="Select…"
                    error={errors.employment_status?.message}
                />
                <Input
                    label="LinkedIn (optional)"
                    placeholder="linkedin.com/in/you"
                    error={errors.linkedin_url?.message}
                    {...register('linkedin_url')}
                />
            </div>
            <div className="mt-4">
                <Textarea
                    label="A short bio"
                    required
                    rows={5}
                    placeholder="Where are you in your journey? What are you trying to figure out? What kind of mentor would help most?"
                    error={errors.bio?.message}
                    {...register('bio')}
                />
                <p className={`text-xs mt-1.5 ${bio.trim().length >= 50 ? 'text-primary' : 'text-slate-500'}`}>
                    {bio.trim().length}/50+ chars {bio.trim().length >= 50 && '✓'}
                </p>
            </div>
        </>
    );
};

export const MentorshipStep = ({ role }) => {
    const { setValue, watch, formState: { errors } } = useFormContext();
    return (
        <>
            <StepHead
                title={role === 'mentor' ? 'What can you mentor on?' : 'What do you want to grow?'}
                subtitle={role === 'mentor'
                    ? 'Pick up to 6 areas. Be honest — Eaglets value depth over breadth.'
                    : "Pick up to 6 areas. We'll match you with Eagles who specialize in these."}
            />
            <ChipPicker
                options={MENTORSHIP_TYPES}
                value={watch('mentorship_types') || []}
                onChange={(v) => setValue('mentorship_types', v, { shouldValidate: true })}
                max={6}
            />
            {errors.mentorship_types?.message && (
                <p className="text-xs text-red-600 mt-2">{errors.mentorship_types.message}</p>
            )}
        </>
    );
};

export const DocumentsStep = ({ cvFile, onCvChange, idDocFile, onIdDocChange }) => {
    return (
        <>
            <StepHead title="Upload your documents" subtitle="Eagles upload a CV so we can verify professional claims. ID document optional but speeds review." />
            <div className="space-y-4">
                <FileDrop
                    label="Upload your CV / Resume"
                    hint="PDF, DOC, DOCX · max 10MB"
                    accept=".pdf,.doc,.docx"
                    file={cvFile}
                    onChange={onCvChange}
                />
                <FileDrop
                    label="Upload ID document (optional)"
                    hint="Driver's license, passport, or national ID"
                    accept="image/*,.pdf"
                    file={idDocFile}
                    onChange={onIdDocChange}
                />
            </div>
        </>
    );
};

const ReviewRow = ({ label, value }) => (
    <div className="flex justify-between gap-4 py-2.5 border-b border-slate-100 last:border-0">
        <span className="text-sm text-slate-500">{label}</span>
        <span className="text-sm font-semibold text-slate-900 text-right">{value}</span>
    </div>
);

export const ReviewStep = ({ role, cvFile }) => {
    const { register, watch, formState: { errors } } = useFormContext();
    const v = watch();
    return (
        <>
            <StepHead title="Review and submit" subtitle="Quick check before takeoff." />
            <div className="bg-slate-50 rounded-2xl p-5 mb-5">
                <ReviewRow label="Name" value={v.full_name || '—'} />
                <ReviewRow label="ID number" value={v.national_id_number ? '••••••••' + v.national_id_number.slice(-4) : '—'} />
                <ReviewRow label="Phone" value={v.phone_number || '—'} />
                {role === 'mentor' ? (
                    <>
                        <ReviewRow label="Location" value={v.location || '—'} />
                        <ReviewRow label="Bio" value={v.profile_description ? `${v.profile_description.slice(0, 60)}…` : '—'} />
                        <ReviewRow label="CV" value={cvFile?.name || '—'} />
                    </>
                ) : (
                    <>
                        <ReviewRow label="Country" value={v.country || '—'} />
                        <ReviewRow label="City" value={v.city || '—'} />
                        <ReviewRow label="Bio" value={v.bio ? `${v.bio.slice(0, 60)}…` : '—'} />
                    </>
                )}
                <ReviewRow label="Mentorship areas" value={`${(v.mentorship_types || []).length} selected`} />
            </div>

            <label className="flex items-start gap-3 p-4 bg-white border-2 border-slate-200 rounded-xl cursor-pointer hover:border-primary/40 transition">
                <input
                    type="checkbox"
                    className="mt-0.5 w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                    {...register('agree')}
                />
                <span className="text-sm text-slate-700 leading-relaxed">
                    I confirm the information above is accurate and consent to verification per the{' '}
                    <a
                        href="/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary font-semibold hover:underline"
                    >
                        Privacy Policy
                    </a>{' '}
                    and{' '}
                    <a
                        href={role === 'mentor' ? '/mentor-code-of-conduct' : '/code-of-conduct'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary font-semibold hover:underline"
                    >
                        {role === 'mentor' ? 'Mentor Code of Conduct' : 'Code of Conduct'}
                    </a>.
                </span>
            </label>
            {errors.agree?.message && (
                <p className="text-xs text-red-600 mt-2">{errors.agree.message}</p>
            )}
        </>
    );
};
