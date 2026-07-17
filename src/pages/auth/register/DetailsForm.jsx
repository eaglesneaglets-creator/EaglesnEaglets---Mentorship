import { useForm, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PropTypes from 'prop-types';
import { Button, Input, Checkbox, PasswordStrengthMeter } from '@components/ui';
import { registerSchema } from '../../../modules/auth/schemas/register-schema';

const MailIcon = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const PhoneIcon = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);
const LockIcon = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

/**
 * DetailsForm — the registration fields, now driven by react-hook-form +
 * zodResolver for real-time (onTouched) inline validation. Google SSO sits
 * above the email form. Password strength meter reacts as the user types.
 *
 * onSubmit receives the validated values; the parent owns the API call so
 * this component stays presentational + testable.
 */
const DetailsForm = ({ selectedRole, onSubmit, isSubmitting, onGoogle, isGoogleLoading }) => {
  const isEagle = selectedRole === 'eagle';

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: {
      email: '',
      first_name: '',
      last_name: '',
      phone_number: '',
      password: '',
      password_confirm: '',
      role: selectedRole,
      terms_accepted: false,
    },
  });

  const passwordValue = useWatch({ control, name: 'password' });

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-border/50 p-4 sm:p-6 lg:p-8">
      {/* Google SSO — carries selected role into OAuth state */}
      <button
        type="button"
        onClick={() => onGoogle(selectedRole)}
        disabled={isGoogleLoading}
        className="group w-full h-13 sm:h-14 flex items-center justify-center gap-3 px-6 rounded-full bg-white text-slate-700 text-sm sm:text-base font-semibold border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 mb-5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 py-3"
      >
        {isGoogleLoading ? (
          <span className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
        )}
        <span>{isGoogleLoading ? 'Connecting…' : 'Continue with Google'}</span>
      </button>

      {/* Divider */}
      <div className="relative mb-5">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
        <div className="relative flex justify-center"><span className="px-3 bg-white text-xs font-medium text-slate-400">or sign up with email</span></div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5" autoComplete="on" noValidate>
        {/* Hidden role — keeps zod schema satisfied */}
        <input type="hidden" {...register('role')} value={selectedRole} readOnly />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Input label="First Name" placeholder="Enter your first name" required autoComplete="given-name" error={errors.first_name?.message} {...register('first_name')} />
          <Input label="Last Name" placeholder="Enter your last name" required autoComplete="family-name" error={errors.last_name?.message} {...register('last_name')} />
        </div>

        <Input label="Email Address" type="email" placeholder="name@example.com" required autoComplete="email" inputMode="email" leftIcon={MailIcon} error={errors.email?.message} {...register('email')} />

        <Input
          label={isEagle ? 'Phone Number' : 'Phone Number (Optional)'}
          type="tel"
          placeholder="+233543688169"
          required={isEagle}
          autoComplete="tel"
          inputMode="tel"
          hint={isEagle ? 'Required for mentor verification' : 'Optional'}
          leftIcon={PhoneIcon}
          error={errors.phone_number?.message}
          {...register('phone_number')}
        />

        <div>
          <Input label="Password" type="password" placeholder="Create a strong password" required autoComplete="new-password" hint="Min 10 chars, upper, lower, number, special character" leftIcon={LockIcon} error={errors.password?.message} {...register('password')} />
          <PasswordStrengthMeter password={passwordValue} />
        </div>

        <Input label="Confirm Password" type="password" placeholder="Confirm your password" required autoComplete="new-password" leftIcon={LockIcon} error={errors.password_confirm?.message} {...register('password_confirm')} />

        {isEagle && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4">
            <div className="flex gap-2 sm:gap-3">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-xs sm:text-sm font-medium text-amber-800">Mentor Verification Required</p>
                <p className="text-xs sm:text-sm text-amber-700 mt-0.5 sm:mt-1">
                  After registration, you&apos;ll complete a 4-step KYC verification to ensure the safety of our mentees.
                </p>
              </div>
            </div>
          </div>
        )}

        {!isEagle && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <div className="flex gap-2 sm:gap-3">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <div>
                <p className="text-xs sm:text-sm font-medium text-blue-800">Quick Verification</p>
                <p className="text-xs sm:text-sm text-blue-700 mt-0.5 sm:mt-1">
                  After registration, you&apos;ll complete a short profile so we can match you with the right mentors and keep the community safe.
                </p>
              </div>
            </div>
          </div>
        )}

        <Controller
          name="terms_accepted"
          control={control}
          render={({ field }) => (
            <Checkbox
              name="terms_accepted"
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
              error={errors.terms_accepted?.message}
              label={
                <>
                  I agree to the{' '}
                  <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
                  {isEagle && (<>, and the <a href="/mentor-code-of-conduct" className="text-primary hover:underline">Mentor Code of Conduct</a></>)}
                </>
              }
            />
          )}
        />

        <Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting} className="!rounded-full !py-3 sm:!py-3.5">
          {isEagle ? 'Create Mentor Account' : 'Create Account'}
        </Button>
      </form>
    </div>
  );
};

DetailsForm.propTypes = {
  selectedRole: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
  onGoogle: PropTypes.func.isRequired,
  isGoogleLoading: PropTypes.bool,
};

export default DetailsForm;
