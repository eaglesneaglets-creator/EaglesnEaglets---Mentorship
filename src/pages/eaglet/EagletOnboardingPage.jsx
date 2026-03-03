import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@store';
import { eagletProfileService } from '../../modules/auth/services/auth-service';
import {
  eagletOnboardingSchema,
  AGE_GROUPS,
  EDUCATIONAL_LEVELS,
  MENTORSHIP_INTERESTS,
  MENTORSHIP_GOALS,
  MENTOR_EXPERTISE,
} from '../../modules/auth/schemas/eaglet-schema';
import { Button, Select, Checkbox, Textarea, Alert } from '@components/ui';
import Logo from '../../assets/EaglesnEagletsLogo.jpeg';

/**
 * EagletOnboardingPage Component
 * Optional profile setup for new Eaglet (mentee) users
 */
const EagletOnboardingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(eagletOnboardingSchema),
    defaultValues: {
      age_group: '',
      educational_level: '',
      field_of_study: '',
      institution: '',
      interests: [],
      goals: [],
      preferred_mentor_expertise: [],
      bio: '',
      expectations: '',
    },
  });

  const selectedInterests = watch('interests') || [];
  const selectedGoals = watch('goals') || [];
  const selectedExpertise = watch('preferred_mentor_expertise') || [];

  const toggleArrayValue = (field, value) => {
    const current = watch(field) || [];
    if (current.includes(value)) {
      setValue(field, current.filter(v => v !== value));
    } else {
      setValue(field, [...current, value]);
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const response = await eagletProfileService.completeOnboarding(data);

      if (response.success) {
        navigate('/dashboard');
      } else {
        setError(response.error?.message || 'Failed to complete onboarding');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    try {
      setIsSubmitting(true);
      await eagletProfileService.skipOnboarding();
      navigate('/dashboard');
    } catch {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={Logo} alt="Eagles & Eaglets" className="h-10 w-auto" />
          </Link>
          <button
            onClick={handleSkip}
            disabled={isSubmitting}
            className="text-sm text-text-secondary hover:text-primary"
          >
            Skip for now
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Welcome, {user?.first_name}!
          </h1>
          <p className="text-text-secondary">
            Help us find the perfect mentors for you by telling us a bit about yourself.
          </p>
        </div>

        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* About You */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">About You</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Age Group"
                {...register('age_group')}
                error={errors.age_group?.message}
              >
                <option value="">Select your age group</option>
                {AGE_GROUPS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>

              <Select
                label="Educational Level"
                {...register('educational_level')}
                error={errors.educational_level?.message}
              >
                <option value="">Select your level</option>
                {EDUCATIONAL_LEVELS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-text-primary">
                  Field of Study (Optional)
                </label>
                <input
                  type="text"
                  {...register('field_of_study')}
                  placeholder="e.g., Computer Science"
                  className="form-input"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-text-primary">
                  School/Workplace (Optional)
                </label>
                <input
                  type="text"
                  {...register('institution')}
                  placeholder="e.g., University of Lagos"
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Interests */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-2">
              What would you like to learn?
            </h2>
            <p className="text-sm text-text-secondary mb-4">
              Select all areas you are interested in (min 1, max 10)
            </p>

            {errors.interests && (
              <p className="text-sm text-error mb-3">{errors.interests.message}</p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {MENTORSHIP_INTERESTS.map(interest => (
                <label
                  key={interest.value}
                  className={`
                    flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all
                    ${selectedInterests.includes(interest.value)
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={selectedInterests.includes(interest.value)}
                    onChange={() => toggleArrayValue('interests', interest.value)}
                  />
                  <span className="text-sm">{interest.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Goals */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-2">
              What are your goals?
            </h2>
            <p className="text-sm text-text-secondary mb-4">
              Select up to 5 goals for your mentorship journey
            </p>

            {errors.goals && (
              <p className="text-sm text-error mb-3">{errors.goals.message}</p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {MENTORSHIP_GOALS.map(goal => (
                <label
                  key={goal.value}
                  className={`
                    flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all
                    ${selectedGoals.includes(goal.value)
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={selectedGoals.includes(goal.value)}
                    onChange={() => toggleArrayValue('goals', goal.value)}
                  />
                  <span className="text-sm">{goal.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Preferred Mentor Expertise (Optional) */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-2">
              Preferred Mentor Expertise (Optional)
            </h2>
            <p className="text-sm text-text-secondary mb-4">
              What kind of mentor are you looking for?
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {MENTOR_EXPERTISE.map(expertise => (
                <label
                  key={expertise.value}
                  className={`
                    flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all
                    ${selectedExpertise.includes(expertise.value)
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={selectedExpertise.includes(expertise.value)}
                    onChange={() => toggleArrayValue('preferred_mentor_expertise', expertise.value)}
                  />
                  <span className="text-sm">{expertise.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Bio & Expectations (Optional) */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              Tell Us More (Optional)
            </h2>

            <Textarea
              label="About Me"
              {...register('bio')}
              placeholder="Share a bit about yourself, your background, and what makes you unique..."
              rows={3}
              error={errors.bio?.message}
            />

            <div className="mt-4">
              <Textarea
                label="What I Hope to Gain"
                {...register('expectations')}
                placeholder="What are your expectations from this mentorship journey?"
                rows={3}
                error={errors.expectations?.message}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Complete Profile'}
            </Button>
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={handleSkip}
              disabled={isSubmitting}
            >
              Skip for Now
            </Button>
          </div>

          <p className="text-center text-sm text-text-muted">
            You can always update your profile later from settings.
          </p>
        </form>
      </main>
    </div>
  );
};

export default EagletOnboardingPage;
