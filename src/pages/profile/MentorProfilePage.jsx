import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@store';
import { profileService, MENTORSHIP_TYPES, MARITAL_STATUS_OPTIONS, EMPLOYMENT_STATUS_OPTIONS } from '../../modules/profile/services/profile-service';
import { mentorProfileSchema } from '../../modules/profile/schemas/mentor-profile-schema';
import ProfilePictureUpload from '../../modules/profile/components/ProfilePictureUpload';
import { Button, Input, Select, Textarea, Alert, Checkbox } from '@components/ui';
import FileUpload from '@components/ui/FileUpload';
import Logo from '../../assets/EaglesnEagletsLogo.jpeg';

/**
 * MentorProfilePage Component
 * Profile/KYC form for Eagle (Mentor) users
 */
const MentorProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingExit, setIsSavingExit] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [cvFile, setCvFile] = useState(null);
  const [cvUploaded, setCvUploaded] = useState(false);
  const [pictureUrl, setPictureUrl] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(mentorProfileSchema),
    defaultValues: {
      location: '',
      national_id_number: '',
      marital_status: '',
      employment_status: '',
      profile_description: '',
      linkedin_url: '',
      mentorship_types: [],
    },
  });

  // Watch all form values for completion calculation
  const watchedValues = watch();
  const selectedMentorshipTypes = watchedValues.mentorship_types || [];
  const profileDescription = watchedValues.profile_description || '';

  // Calculate completion percentage locally based on filled fields
  const completionPercentage = useMemo(() => {
    const requiredFields = [
      { key: 'location', filled: !!watchedValues.location?.trim() },
      { key: 'national_id_number', filled: !!watchedValues.national_id_number?.trim() },
      { key: 'marital_status', filled: !!watchedValues.marital_status },
      { key: 'employment_status', filled: !!watchedValues.employment_status },
      { key: 'profile_description', filled: (watchedValues.profile_description?.trim()?.length || 0) >= 100 },
      { key: 'mentorship_types', filled: (watchedValues.mentorship_types?.length || 0) > 0 },
      { key: 'profile_picture', filled: !!pictureUrl },
      { key: 'cv', filled: cvUploaded || !!profileData?.cv_url },
    ];

    const filledCount = requiredFields.filter(f => f.filled).length;
    return Math.round((filledCount / requiredFields.length) * 100);
  }, [watchedValues, pictureUrl, cvUploaded, profileData?.cv_url]);

  // Load existing profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await profileService.getMentorProfile();
        if (response.success) {
          const data = response.data;
          setProfileData(data);
          setPictureUrl(data.display_picture);
          if (data.cv_url) setCvUploaded(true);

          // Reset form with existing data
          reset({
            location: data.location || '',
            national_id_number: data.national_id_number || '',
            marital_status: data.marital_status || '',
            employment_status: data.employment_status || '',
            profile_description: data.profile_description || '',
            linkedin_url: data.linkedin_url || '',
            mentorship_types: data.mentorship_types || [],
          });
        }
      } catch {
        // Profile might not exist yet for new users
        console.log('No existing profile data');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [reset]);

  const toggleMentorshipType = (value) => {
    const current = selectedMentorshipTypes || [];
    if (current.includes(value)) {
      setValue('mentorship_types', current.filter(v => v !== value), { shouldDirty: true });
    } else if (current.length < 6) {
      setValue('mentorship_types', [...current, value], { shouldDirty: true });
    }
  };

  const handlePictureUpload = async (file) => {
    if (!file) return;

    try {
      setIsUploading(true);
      const response = await profileService.uploadPicture(file);
      if (response.success) {
        setPictureUrl(response.data.display_picture);
        setSuccess('Profile picture uploaded successfully');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch {
      setError('Failed to upload profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCVUpload = async (file) => {
    if (!file) {
      setCvFile(null);
      return;
    }

    setCvFile(file);

    try {
      setIsUploading(true);
      const response = await profileService.uploadCV(file);
      if (response.success) {
        setCvUploaded(true);
        setSuccess('CV uploaded successfully');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch {
      setError('Failed to upload CV');
      setCvFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const saveProfile = async (data) => {
    // Filter out empty/null/undefined values so backend skips validation on unfilled fields
    const cleanedData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => {
        if (value === null || value === undefined || value === '') return false;
        if (Array.isArray(value) && value.length === 0) return false;
        return true;
      })
    );

    // Don't send a request if there's nothing to save
    if (Object.keys(cleanedData).length === 0) return true;

    const response = await profileService.updateMentorProfile(cleanedData);
    if (response.success) {
      setProfileData(response.data);
      return true;
    }
    throw new Error(response.error?.message || 'Failed to save profile');
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setError(null);

      await saveProfile(data);
      setSuccess('Profile saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAndExit = async () => {
    try {
      setIsSavingExit(true);
      setError(null);

      // Get current form values and save them
      const data = getValues();
      await saveProfile(data);

      setSuccess('Progress saved! Redirecting to login...');

      // Logout and redirect after brief delay
      setTimeout(() => {
        logout();
        navigate('/login', {
          state: { message: 'Your progress has been saved. You can continue your application anytime.' }
        });
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to save progress');
      setIsSavingExit(false);
    }
  };

  const handleSubmitForReview = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Save current form data first
      const data = getValues();
      await saveProfile(data);

      // Then submit for review
      const response = await profileService.submitProfile();

      if (response.success) {
        navigate('/pending-approval');
      } else {
        setError(response.error?.message || 'Failed to submit profile');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const isLocked = profileData?.status === 'submitted' || profileData?.status === 'under_review';
  const canSubmit = completionPercentage === 100 && !isLocked;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={Logo} alt="Eagles & Eaglets" className="h-10 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-secondary">
              {user?.email}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveAndExit}
              disabled={isSavingExit || isLocked}
              loading={isSavingExit}
            >
              Save & Exit
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Complete Your Mentor Profile
          </h1>
          <p className="text-text-secondary">
            Fill in your details to become an Eagle Mentor. All fields marked with * are required.
          </p>

          {/* Completion Badge */}
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
            <div className={`w-2 h-2 rounded-full ${completionPercentage === 100 ? 'bg-green-500' : 'bg-primary'}`}></div>
            <span className="text-sm font-medium text-text-secondary">
              {completionPercentage}% Complete
            </span>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-6">
            {success}
          </Alert>
        )}

        {isLocked && (
          <Alert variant="info" className="mb-6">
            Your profile is currently under review. You cannot make changes until the review is complete.
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Profile Picture Section */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-6 text-center">Profile Picture *</h2>
            <ProfilePictureUpload
              value={pictureUrl}
              onUpload={handlePictureUpload}
              isUploading={isUploading}
              disabled={isLocked}
            />
            {!pictureUrl && (
              <p className="mt-2 text-center text-sm text-error">Profile picture is required</p>
            )}
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Personal Information</h2>

            <div className="space-y-4">
              <Input
                label="Location"
                placeholder="City, Country (e.g., Accra, Ghana)"
                {...register('location')}
                error={errors.location?.message}
                required
                disabled={isLocked}
              />

              <Input
                label="National ID Number"
                placeholder="Your national ID number"
                {...register('national_id_number')}
                error={errors.national_id_number?.message}
                required
                disabled={isLocked}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Marital Status"
                  options={MARITAL_STATUS_OPTIONS}
                  {...register('marital_status')}
                  error={errors.marital_status?.message}
                  required
                  disabled={isLocked}
                />

                <Select
                  label="Employment Status"
                  options={EMPLOYMENT_STATUS_OPTIONS}
                  {...register('employment_status')}
                  error={errors.employment_status?.message}
                  required
                  disabled={isLocked}
                />
              </div>
            </div>
          </div>

          {/* Professional Profile */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Professional Profile</h2>

            <div className="space-y-4">
              <div>
                <Textarea
                  label="Profile Description"
                  placeholder="Tell us about yourself, your experience, and what you can offer as a mentor..."
                  rows={5}
                  {...register('profile_description')}
                  error={errors.profile_description?.message}
                  required
                  disabled={isLocked}
                />
                <p className={`mt-1 text-xs ${profileDescription.length >= 100 ? 'text-green-600' : 'text-text-muted'}`}>
                  {profileDescription.length}/100 characters minimum {profileDescription.length >= 100 && '✓'}
                </p>
              </div>

              <Input
                label="LinkedIn Profile URL"
                placeholder="https://linkedin.com/in/your-profile"
                {...register('linkedin_url')}
                error={errors.linkedin_url?.message}
                hint="Optional but recommended"
                disabled={isLocked}
              />

              <FileUpload
                label="Curriculum Vitae (CV)"
                accept=".pdf,.docx"
                maxSize={5 * 1024 * 1024}
                hint="PDF or DOCX, max 5MB (required)"
                value={cvFile}
                onFileSelect={handleCVUpload}
                disabled={isLocked}
                required
              />
              {!cvUploaded && !cvFile && !profileData?.cv_url && (
                <p className="text-sm text-error">CV is required</p>
              )}
              {(cvUploaded || profileData?.cv_url) && (
                <p className="text-sm text-green-600">CV uploaded ✓</p>
              )}
            </div>
          </div>

          {/* Mentorship Specialization */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-2">Mentorship Specialization *</h2>
            <p className="text-sm text-text-muted mb-4">
              Select the types of mentorship you want to offer (up to 6)
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {MENTORSHIP_TYPES.map((type) => (
                <label
                  key={type.value}
                  className={`
                    flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all
                    ${selectedMentorshipTypes.includes(type.value)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                    }
                    ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}
                  `}
                >
                  <Checkbox
                    checked={selectedMentorshipTypes.includes(type.value)}
                    onChange={() => !isLocked && toggleMentorshipType(type.value)}
                    disabled={isLocked}
                  />
                  <span className="text-sm font-medium text-text-primary">
                    {type.label}
                  </span>
                </label>
              ))}
            </div>

            {errors.mentorship_types && (
              <p className="mt-2 text-sm text-error">{errors.mentorship_types.message}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              type="submit"
              variant="secondary"
              className="flex-1"
              disabled={isSubmitting || isLocked}
              loading={isSubmitting}
            >
              Save Progress
            </Button>

            <Button
              type="button"
              variant="primary"
              className="flex-1"
              disabled={isSubmitting || !canSubmit}
              onClick={handleSubmitForReview}
            >
              Submit for Review
            </Button>
          </div>

          {!canSubmit && !isLocked && (
            <p className="text-center text-sm text-text-muted">
              Complete all required fields ({completionPercentage}% done) to submit for review.
            </p>
          )}
        </form>
      </main>
    </div>
  );
};

export default MentorProfilePage;
