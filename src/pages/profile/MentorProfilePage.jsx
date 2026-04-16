import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@store';
import { profileService, MENTORSHIP_TYPES, MARITAL_STATUS_OPTIONS, EMPLOYMENT_STATUS_OPTIONS } from '../../modules/profile/services/profile-service';
import { mentorProfileSchema } from '../../modules/profile/schemas/mentor-profile-schema';
import ProfilePictureUpload from '../../modules/profile/components/ProfilePictureUpload';
import SkillsTagEditor from '../../modules/profile/components/SkillsTagEditor';
import AvailabilityCalendar from '../../modules/profile/components/AvailabilityCalendar';
import PortfolioSection from '../../modules/profile/components/PortfolioSection';
import { Button, Input, Select, Textarea, Alert, Checkbox } from '@components/ui';
import FileUpload from '@components/ui/FileUpload';
import Logo from '../../assets/EaglesnEagletsLogo.jpeg';
import { logger } from '../../shared/utils/logger';

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
  const [skills, setSkills] = useState([]);
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

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
      phone_number: '',
      profile_description: '',
      linkedin_url: '',
      mentorship_types: [],
    },
  });

  const DRAFT_KEY = 'mentor-profile-draft';

  // Persist draft to sessionStorage on every change (survives refresh, clears on tab close)
  const isRestoringRef = useRef(false);
  const watchedValues = watch();
  const selectedMentorshipTypes = watchedValues.mentorship_types || [];
  const profileDescription = watchedValues.profile_description || '';

  // Always calculate completion locally from current form values
  const completionPercentage = useMemo(() => {
    const requiredFields = [
      { key: 'location', filled: !!watchedValues.location?.trim() },
      { key: 'national_id_number', filled: !!watchedValues.national_id_number?.trim() },
      { key: 'marital_status', filled: !!watchedValues.marital_status },
      { key: 'employment_status', filled: !!watchedValues.employment_status },
      { key: 'phone_number', filled: !!watchedValues.phone_number?.trim() },
      { key: 'profile_description', filled: (watchedValues.profile_description?.trim()?.length || 0) >= 100 },
      { key: 'mentorship_types', filled: (watchedValues.mentorship_types?.length || 0) > 0 },
      { key: 'profile_picture', filled: !!pictureUrl },
      { key: 'cv', filled: cvUploaded || !!profileData?.cv },
    ];

    const filledCount = requiredFields.filter(f => f.filled).length;
    return Math.round((filledCount / requiredFields.length) * 100);
  }, [watchedValues, pictureUrl, cvUploaded, profileData?.cv]);

  // Auto-save draft to sessionStorage on every change (skip during API-driven resets)
  useEffect(() => {
    if (isRestoringRef.current) return;
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(watchedValues));
    } catch { /* ignore quota errors */ }
  }, [watchedValues]);

  // Load existing profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await profileService.getMentorProfile();
        if (response.success) {
          const data = response.data;
          setProfileData(data);
          setPictureUrl(data.display_picture);
          if (data.cv) setCvUploaded(true);
          // Populate skills from area_of_expertise
          if (data.area_of_expertise) {
            const parsed = Array.isArray(data.area_of_expertise)
              ? data.area_of_expertise
              : data.area_of_expertise.split(',').map(s => s.trim()).filter(Boolean);
            setSkills(parsed);
          }

          isRestoringRef.current = true;
          // Reset form with existing data
          reset({
            location: data.location || '',
            national_id_number: data.national_id_number || '',
            marital_status: data.marital_status || '',
            employment_status: data.employment_status || '',
            phone_number: data.user_phone_number || '',
            profile_description: data.profile_description || '',
            linkedin_url: data.linkedin_url || '',
            mentorship_types: data.mentorship_types || [],
          });
          // Clear draft — API data is the source of truth once loaded
          sessionStorage.removeItem(DRAFT_KEY);
          isRestoringRef.current = false;
        }
      } catch {
        // New user — restore draft if available
        logger.debug('No existing profile data');
        try {
          const saved = sessionStorage.getItem(DRAFT_KEY);
          if (saved) {
            isRestoringRef.current = true;
            reset(JSON.parse(saved));
            isRestoringRef.current = false;
          }
        } catch { /* ignore */ }
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [reset]);

  // Load availability slots
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        setAvailabilityLoading(true);
        const response = await profileService.getAvailability?.();
        if (response?.success) setAvailabilitySlots(response.data || []);
      } catch { /* availability not critical */ }
      finally { setAvailabilityLoading(false); }
    };
    fetchSlots();
  }, []);

  const handleAddSlot = async (slot) => {
    try {
      const response = await profileService.addAvailabilitySlot?.(slot);
      if (response?.success) setAvailabilitySlots(prev => [...prev, response.data]);
    } catch { setError('Failed to add availability slot'); }
  };

  const handleRemoveSlot = async (slotId) => {
    try {
      await profileService.removeAvailabilitySlot?.(slotId);
      setAvailabilitySlots(prev => prev.filter(s => s.id !== slotId));
    } catch { setError('Failed to remove availability slot'); }
  };

  const handleSkillsChange = async (newSkills) => {
    setSkills(newSkills);
    try {
      await profileService.updateMentorProfile({ area_of_expertise: newSkills.join(', ') });
    } catch { /* non-blocking */ }
  };

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
      sessionStorage.removeItem(DRAFT_KEY);
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

  const kycStatus = profileData?.status;
  const isLocked = kycStatus === 'submitted' || kycStatus === 'under_review' || kycStatus === 'approved';
  const isRejected = kycStatus === 'rejected';
  const needsChanges = kycStatus === 'requires_changes';
  const canEdit = !isLocked;
  const canSubmit = completionPercentage === 100 && canEdit;
  const isResubmission = isRejected || needsChanges;

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
            {isResubmission ? 'Update Your Mentor Profile' : 'Complete Your Mentor Profile'}
          </h1>
          <p className="text-text-secondary">
            {isResubmission
              ? 'Please address the feedback below and resubmit your profile for review.'
              : 'Fill in your details to become an Eagle Mentor. All fields marked with * are required.'}
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

        {isLocked && kycStatus !== 'approved' && (
          <Alert variant="info" className="mb-6">
            Your profile is currently under review. You cannot make changes until the review is complete.
          </Alert>
        )}

        {kycStatus === 'approved' && (
          <Alert variant="success" className="mb-6">
            Your profile has been approved. Welcome to Eagles & Eaglets!
          </Alert>
        )}

        {/* Rejection / Changes Requested Feedback */}
        {isRejected && (
          <div className="mb-6 rounded-xl border-2 border-red-200 bg-red-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-800 mb-1">Profile Rejected</h3>
                <p className="text-sm text-red-700 mb-2">
                  Your profile was not approved. Please review the feedback below, make necessary changes, and resubmit.
                </p>
                {profileData?.rejection_reason && (
                  <div className="mt-2 p-3 bg-white rounded-lg border border-red-200">
                    <p className="text-sm font-medium text-red-800 mb-1">Admin Feedback:</p>
                    <p className="text-sm text-red-700">{profileData.rejection_reason}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {needsChanges && (
          <div className="mb-6 rounded-xl border-2 border-amber-200 bg-amber-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-800 mb-1">Changes Requested</h3>
                <p className="text-sm text-amber-700 mb-2">
                  The admin has requested some updates to your profile. Please address the feedback below and resubmit.
                </p>
                {profileData?.rejection_reason && (
                  <div className="mt-2 p-3 bg-white rounded-lg border border-amber-200">
                    <p className="text-sm font-medium text-amber-800 mb-1">Requested Changes:</p>
                    <p className="text-sm text-amber-700">{profileData.rejection_reason}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
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

          {/* Contact Information */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Contact Information</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Email Address"
                  value={profileData?.user_email || user?.email || ''}
                  disabled
                  hint="From your account"
                />

                <Input
                  label="Phone Number"
                  placeholder="e.g., +233 XX XXX XXXX"
                  {...register('phone_number')}
                  error={errors.phone_number?.message}
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
              {!cvUploaded && !cvFile && !profileData?.cv && (
                <p className="text-sm text-error">CV is required</p>
              )}
              {(cvUploaded || profileData?.cv) && (
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

          {/* Areas of Expertise (Skills) */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-2">Areas of Expertise</h2>
            <p className="text-sm text-text-muted mb-4">Add skills or topics you can mentor (press Enter or comma to add)</p>
            <SkillsTagEditor
              value={skills}
              onChange={handleSkillsChange}
              placeholder="e.g. Product Design, React, Leadership..."
              disabled={isLocked}
            />
          </div>

          {/* Availability */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-2">Weekly Availability</h2>
            <p className="text-sm text-text-muted mb-4">Click time slots to mark when you&apos;re available for mentoring sessions</p>
            <AvailabilityCalendar
              slots={availabilitySlots}
              onAdd={handleAddSlot}
              onRemove={handleRemoveSlot}
              readOnly={isLocked}
              isLoading={availabilityLoading}
            />
          </div>

          {/* Portfolio Preview */}
          {profileData && (
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4">Portfolio Preview</h2>
              <PortfolioSection
                data={{ ...profileData, area_of_expertise: skills }}
                editMode={canEdit}
                onSave={async (field, value) => {
                  try {
                    await profileService.updateMentorProfile({ [field]: value });
                    setProfileData(prev => ({ ...prev, [field]: value }));
                  } catch { setError('Failed to save field'); }
                }}
              />
            </div>
          )}

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
              {isResubmission ? 'Resubmit for Review' : 'Submit for Review'}
            </Button>
          </div>

          {!canSubmit && canEdit && (
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
