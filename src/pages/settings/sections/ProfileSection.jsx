import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@store';
import { profileService } from '../../../modules/profile/services/profile-service';
import {
  MENTORSHIP_TYPES,
  MARITAL_STATUS_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS,
  COUNTRY_OPTIONS,
} from '../../../modules/kyc/schemas/kyc-schemas';

const SUPPORT_EMAIL = 'support.eaglesandeaglets@gmail.com';

const STATUS_BADGE = {
  approved: 'bg-emerald-100 text-emerald-700',
  submitted: 'bg-amber-100 text-amber-700',
  under_review: 'bg-amber-100 text-amber-700',
  requires_changes: 'bg-orange-100 text-orange-700',
  rejected: 'bg-red-100 text-red-700',
  draft: 'bg-slate-100 text-slate-600',
};

const inputCls =
  'w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:bg-slate-50 disabled:text-slate-400';
const labelCls = 'block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5';

/**
 * Settings → Profile: view KYC details, edit safe fields post-approval.
 *
 * Edit policy (two-tier v1, mirrors BE whitelist in apps/users/views/profile.py):
 *   - Safe fields (contact / preference data) save freely.
 *   - Identity fields (national ID, CoC snapshot) are locked once approved —
 *     shown read-only with a contact-support escape hatch.
 */
export default function ProfileSection() {
  const { user } = useAuthStore();
  const role = user?.role;

  if (role !== 'eagle' && role !== 'eaglet') {
    return (
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-800">Profile</h2>
        <p className="text-sm text-slate-500">
          KYC profiles only apply to mentor and mentee accounts.
        </p>
      </div>
    );
  }

  return <KycProfileForm role={role} />;
}

function KycProfileForm({ role }) {
  const isMentor = role === 'eagle';
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', message }

  const { data, isLoading, isError } = useQuery({
    queryKey: ['kyc-profile', role],
    queryFn: async () => {
      const res = isMentor
        ? await profileService.getMentorProfile()
        : await profileService.getMenteeProfile();
      return res.data || res;
    },
  });

  if (isLoading) {
    return <div className="text-sm text-slate-400 py-8">Loading your profile…</div>;
  }
  if (isError || !data) {
    return (
      <div className="text-sm text-red-600 py-8">
        Could not load your profile. Refresh the page or try again later.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Profile</h2>
          <p className="mt-1 text-sm text-slate-500">
            Your verified KYC details. Contact and preference fields are editable.
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
            STATUS_BADGE[data.status] || STATUS_BADGE.draft
          }`}
        >
          {(data.status || 'draft').replaceAll('_', ' ')}
        </span>
      </div>

      <IdentityCard data={data} />
      <EditableCard
        key={data.updated_at || 'kyc'}
        data={data}
        isMentor={isMentor}
        feedback={feedback}
        setFeedback={setFeedback}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ['kyc-profile', role] })}
      />
    </div>
  );
}

/** Locked identity fields — read-only with support escape hatch. */
function IdentityCard({ data }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-slate-400 text-lg">lock</span>
        <h3 className="text-sm font-bold text-slate-700">Identity details</h3>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <span className={labelCls}>National ID / Passport</span>
          <p className="text-sm text-slate-800 font-mono">
            {data.national_id_number || '—'}
          </p>
        </div>
      </div>
      <p className="mt-4 text-xs text-slate-400 leading-relaxed">
        Identity details are locked after verification. To change them, email{' '}
        <a
          href={`mailto:${SUPPORT_EMAIL}?subject=Identity%20detail%20change%20request`}
          className="text-primary font-semibold hover:underline"
        >
          support
        </a>
        .
      </p>
    </div>
  );
}

/** Safe-field edit form (whitelist mirrors the backend). */
function EditableCard({ data, isMentor, feedback, setFeedback, onSaved }) {
  const {
    register,
    handleSubmit,
    formState: { isDirty, errors },
    reset,
  } = useForm({
    defaultValues: {
      phone_number: data.phone_number || '',
      location: data.location || '',
      marital_status: data.marital_status || '',
      employment_status: data.employment_status || '',
      linkedin_url: data.linkedin_url || '',
      mentorship_types: data.mentorship_types || [],
      ...(isMentor
        ? { profile_description: data.profile_description || '' }
        : {
            country: data.country || '',
            city: data.city || '',
            bio: data.bio || '',
          }),
    },
  });

  const mutation = useMutation({
    mutationFn: (values) =>
      isMentor
        ? profileService.updateMentorProfile(values)
        : profileService.updateMenteeProfile(values),
    onSuccess: (res, values) => {
      setFeedback({ type: 'success', message: 'Profile updated.' });
      reset(values); // new baseline — clears isDirty
      onSaved();
    },
    onError: (err) => {
      const apiErr = err?.response?.data?.error;
      setFeedback({
        type: 'error',
        message:
          apiErr?.type === 'IdentityFieldLocked'
            ? 'Those details are locked after verification — contact support.'
            : apiErr?.message || 'Could not save changes. Please try again.',
      });
    },
  });

  const onSubmit = (values) => {
    setFeedback(null);
    // Drop empty-string optionals so BE validators (e.g. min_length bio)
    // don't trip on fields the user left untouched.
    const payload = Object.fromEntries(
      Object.entries(values).filter(([, v]) =>
        Array.isArray(v) ? v.length > 0 : v !== '',
      ),
    );
    mutation.mutate(payload);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4"
    >
      <h3 className="text-sm font-bold text-slate-700 mb-1">Contact &amp; preferences</h3>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls} htmlFor="pf-phone">Phone number</label>
          <input id="pf-phone" type="tel" className={inputCls} {...register('phone_number')} />
        </div>
        <div>
          <label className={labelCls} htmlFor="pf-marital">Marital status</label>
          <select id="pf-marital" className={inputCls} {...register('marital_status')}>
            <option value="">Select…</option>
            {MARITAL_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="pf-employment">Employment status</label>
          <select id="pf-employment" className={inputCls} {...register('employment_status')}>
            <option value="">Select…</option>
            {EMPLOYMENT_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="pf-linkedin">LinkedIn URL</label>
          <input
            id="pf-linkedin"
            type="url"
            placeholder="https://linkedin.com/in/…"
            className={inputCls}
            {...register('linkedin_url')}
          />
        </div>

        {!isMentor && (
          <>
            <div>
              <label className={labelCls} htmlFor="pf-country">Country</label>
              <select id="pf-country" className={inputCls} {...register('country')}>
                <option value="">Select…</option>
                {COUNTRY_OPTIONS.map((o) => (
                  <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="pf-city">City</label>
              <input id="pf-city" className={inputCls} {...register('city')} />
            </div>
          </>
        )}

        <div className="sm:col-span-2">
          <label className={labelCls} htmlFor="pf-location">Location</label>
          <input
            id="pf-location"
            placeholder="e.g. Osu, Accra"
            className={inputCls}
            {...register('location')}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelCls} htmlFor="pf-about">
            {isMentor ? 'Profile description' : 'Bio'}
          </label>
          <textarea
            id="pf-about"
            rows={4}
            className={inputCls}
            {...register(isMentor ? 'profile_description' : 'bio', {
              validate: (v) => {
                if (!v) return true;
                const min = isMentor ? 100 : 50;
                return v.trim().length >= min || `Minimum ${min} characters.`;
              },
            })}
          />
          {(errors.profile_description || errors.bio) && (
            <p className="mt-1 text-xs text-red-600">
              {errors.profile_description?.message || errors.bio?.message}
            </p>
          )}
        </div>

        <fieldset className="sm:col-span-2">
          <legend className={labelCls}>Mentorship areas</legend>
          <div className="flex flex-wrap gap-2">
            {MENTORSHIP_TYPES.map((t) => (
              <label
                key={t.value ?? t}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:text-primary cursor-pointer"
              >
                <input
                  type="checkbox"
                  value={t.value ?? t}
                  className="accent-[var(--color-primary,#10b981)]"
                  {...register('mentorship_types')}
                />
                {t.label ?? t}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {feedback && (
        <p
          className={`text-sm font-medium ${
            feedback.type === 'success' ? 'text-emerald-600' : 'text-red-600'
          }`}
          role={feedback.type === 'error' ? 'alert' : 'status'}
        >
          {feedback.message}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!isDirty || mutation.isPending}
          className="px-5 py-2.5 text-sm font-bold text-white bg-primary rounded-xl shadow-lg shadow-primary/25 hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mutation.isPending ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}
