import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@store';
import { FileUpload, Alert } from '@components/ui';
import { kycService } from '../../modules/auth/services/auth-service';
import { logger } from '../../shared/utils/logger';
import Logo from '../../assets/EaglesnEagletsLogo.jpeg';

// Step definitions
const steps = [
  { id: 'personal', label: 'Personal', icon: 'user' },
  { id: 'ministry', label: 'Ministry', icon: 'church' },
  { id: 'experience', label: 'Experience', icon: 'briefcase' },
  { id: 'consent', label: 'Consent', icon: 'shield' },
];

// Expertise options
const expertiseOptions = [
  { value: 'spiritual_leadership', label: 'Spiritual Leadership' },
  { value: 'youth_ministry', label: 'Youth Ministry' },
  { value: 'career_guidance', label: 'Career Guidance' },
  { value: 'business_mentoring', label: 'Business & Entrepreneurship' },
  { value: 'technology', label: 'Technology & Innovation' },
  { value: 'education', label: 'Education & Academic' },
  { value: 'creative_arts', label: 'Creative Arts & Media' },
  { value: 'health_wellness', label: 'Health & Wellness' },
];

// Mentorship interest options
const interestOptions = [
  { value: 'career_advice', label: 'Career Advice', icon: '💼' },
  { value: 'technical_skills', label: 'Technical Skills', icon: '⚡' },
  { value: 'leadership', label: 'Leadership', icon: '🎯' },
  { value: 'interview_prep', label: 'Interview Prep', icon: '🎤' },
  { value: 'salary_negotiation', label: 'Salary Negotiation', icon: '💰' },
  { value: 'spiritual_growth', label: 'Spiritual Growth', icon: '✨' },
];

// Icons component
const Icons = {
  user: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  church: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  briefcase: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  shield: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  check: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  arrowLeft: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  ),
  arrowRight: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  ),
  save: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
  ),
  logout: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  linkedin: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  ),
  lock: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  spinner: (
    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  ),
};

/**
 * KYCWizardPage Component
 * Multi-step KYC verification wizard for mentors with premium design
 */
const KYCWizardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaveExitLoading, setIsSaveExitLoading] = useState(false);
  const [error, setError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form data for all steps
  const [formData, setFormData] = useState({
    // Step 1: Personal
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    date_of_birth: '',
    government_id: null,
    government_id_type: '',

    // Step 2: Ministry
    church_name: '',
    church_role: '',
    years_of_service: '',
    spiritual_testimony: '',
    recommendation_letter: null,

    // Step 3: Experience
    area_of_expertise: '',
    current_occupation: '',
    linkedin_url: '',
    mentorship_interests: [],

    // Step 4: Consent
    background_check_consent: false,
    code_of_conduct_agreed: false,
    statement_of_faith_agreed: false,
    digital_signature: '',
  });

  // Load existing KYC data
  useEffect(() => {
    const loadKYC = async () => {
      setIsLoading(true);
      try {
        const response = await kycService.getKYC();
        if (response.success && response.data) {
          const kyc = response.data;
          setFormData((prev) => ({
            ...prev,
            first_name: kyc.user_first_name || prev.first_name,
            last_name: kyc.user_last_name || prev.last_name,
            date_of_birth: kyc.user_date_of_birth || '',
            church_name: kyc.church_name || '',
            church_role: kyc.church_role || '',
            years_of_service: kyc.years_of_service || '',
            spiritual_testimony: kyc.spiritual_testimony || '',
            area_of_expertise: kyc.area_of_expertise || '',
            current_occupation: kyc.current_occupation || '',
            linkedin_url: kyc.linkedin_url || '',
            mentorship_interests: kyc.mentorship_interests || [],
            background_check_consent: kyc.background_check_consent || false,
            code_of_conduct_agreed: kyc.code_of_conduct_agreed || false,
            statement_of_faith_agreed: kyc.statement_of_faith_agreed || false,
            digital_signature: kyc.digital_signature || '',
          }));
          setCurrentStep(kyc.current_step || 1);

          // Mark completed steps
          const completed = [];
          for (let i = 1; i < kyc.current_step; i++) {
            completed.push(i);
          }
          setCompletedSteps(completed);
        }
      } catch (err) {
        logger.error('Failed to load KYC:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadKYC();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleInterestToggle = (interest) => {
    setFormData((prev) => {
      const interests = prev.mentorship_interests.includes(interest)
        ? prev.mentorship_interests.filter((i) => i !== interest)
        : [...prev.mentorship_interests, interest];
      return { ...prev, mentorship_interests: interests };
    });
  };

  const handleFileSelect = (field, file) => {
    setFormData((prev) => ({ ...prev, [field]: file }));
  };

  const saveStep = async (stepNumber) => {
    setError('');

    try {
      const stepData = {};

      if (stepNumber === 1) {
        Object.assign(stepData, {
          first_name: formData.first_name,
          last_name: formData.last_name,
          date_of_birth: formData.date_of_birth,
        });

        if (formData.government_id) {
          await kycService.uploadGovernmentID(formData.government_id);
        }
      } else if (stepNumber === 2) {
        Object.assign(stepData, {
          church_name: formData.church_name,
          church_role: formData.church_role,
          years_of_service: parseInt(formData.years_of_service, 10) || 0,
          spiritual_testimony: formData.spiritual_testimony,
        });

        if (formData.recommendation_letter) {
          await kycService.uploadRecommendation(formData.recommendation_letter);
        }
      } else if (stepNumber === 3) {
        Object.assign(stepData, {
          area_of_expertise: formData.area_of_expertise,
          current_occupation: formData.current_occupation,
          linkedin_url: formData.linkedin_url,
          mentorship_interests: formData.mentorship_interests,
        });
      } else if (stepNumber === 4) {
        Object.assign(stepData, {
          background_check_consent: formData.background_check_consent,
          code_of_conduct_agreed: formData.code_of_conduct_agreed,
          statement_of_faith_agreed: formData.statement_of_faith_agreed,
          digital_signature: formData.digital_signature,
        });
      }

      await kycService.updateKYCStep(stepNumber, stepData);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to save. Please try again.');
      return false;
    }
  };

  const handleNext = async () => {
    setIsSaving(true);
    const saved = await saveStep(currentStep);
    if (saved) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps((prev) => [...prev, currentStep]);
      }
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setIsSaving(false);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Save & Exit functionality
  const handleSaveAndExit = async () => {
    setIsSaveExitLoading(true);
    setError('');

    try {
      await saveStep(currentStep);
      setSaveSuccess(true);

      setTimeout(() => {
        // Log out the user first, then navigate to login
        // This prevents GuestGuard from redirecting authenticated users to dashboard
        logout();
        navigate('/login', {
          state: { message: 'Your progress has been saved. You can continue your application anytime.' }
        });
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to save progress. Please try again.');
      setIsSaveExitLoading(false);
    }
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    setError('');

    try {
      const saved = await saveStep(4);
      if (!saved) {
        setIsSaving(false);
        return;
      }

      await kycService.submitKYC();
      navigate('/kyc/pending', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to submit application. Please try again.');
      setIsSaving(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading your application...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Floating gradient blobs */}
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="blob blob-4" />

        {/* Floating shapes */}
        <div className="floating-shape shape-1" />
        <div className="floating-shape shape-2" />
        <div className="floating-shape shape-3" />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, var(--color-primary) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={Logo} alt="Eagles & Eaglets" className="h-10 w-auto rounded-lg shadow-sm" />
            <div>
              <h1 className="text-lg font-bold text-gray-900 tracking-tight">Mentor Verification</h1>
              <p className="text-xs text-primary font-medium">Eagle Application Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Save & Exit Button */}
            <button
              onClick={handleSaveAndExit}
              disabled={isSaveExitLoading}
              className="group flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all duration-300 disabled:opacity-50 shadow-sm hover:shadow-md"
            >
              {isSaveExitLoading ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                Icons.save
              )}
              <span className="hidden sm:inline text-sm font-medium">Save & Exit</span>
            </button>

            {/* Sign Out Button */}
            <button
              onClick={logout}
              className="group flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              {Icons.logout}
              <span className="hidden sm:inline text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Title Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Application In Progress
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            Become a Verified <span className="text-primary">Eagle Mentor</span>
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Complete your profile verification to unlock mentorship capabilities and guide the next generation.
          </p>
        </div>

        {/* Progress Stepper */}
        <div className="mb-10">
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 rounded-full">
              <div
                className="h-full bg-gradient-to-r from-primary to-teal-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              />
            </div>

            {steps.map((step, index) => {
              const stepNumber = index + 1;
              const isCompleted = completedSteps.includes(stepNumber);
              const isCurrent = currentStep === stepNumber;
              const isClickable = isCompleted || stepNumber <= currentStep;

              return (
                <button
                  key={step.id}
                  onClick={() => isClickable && setCurrentStep(stepNumber)}
                  disabled={!isClickable}
                  className={`relative flex flex-col items-center group transition-all duration-300 ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                >
                  {/* Step Circle */}
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 z-10 shadow-lg
                    ${isCompleted
                      ? 'bg-gradient-to-br from-primary to-teal-500 text-white'
                      : isCurrent
                        ? 'bg-gradient-to-br from-primary to-teal-500 text-white ring-4 ring-primary/20'
                        : 'bg-white border-2 border-gray-200 text-gray-400'
                    }
                    ${isClickable && !isCurrent ? 'group-hover:scale-110 group-hover:shadow-xl' : ''}
                  `}>
                    {isCompleted ? Icons.check : Icons[step.icon]}
                  </div>

                  {/* Step Label — hidden on mobile to prevent indicator overflow */}
                  <span className={`
                    hidden sm:inline mt-3 text-xs sm:text-sm font-semibold transition-colors duration-300
                    ${isCurrent ? 'text-primary' : isCompleted ? 'text-gray-700' : 'text-gray-400'}
                  `}>
                    {step.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Save Success Message */}
        {saveSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-primary/10 border border-primary/30 flex items-center gap-3 animate-fade-in">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              {Icons.check}
            </div>
            <div>
              <p className="text-primary font-semibold">Progress Saved Successfully!</p>
              <p className="text-primary/70 text-sm">Redirecting you to login...</p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Step Content Card */}
        <div className="bg-white rounded-3xl border border-gray-200/50 p-6 sm:p-8 shadow-xl shadow-gray-200/50 mb-8">
          {/* Step 1: Personal Identification */}
          {currentStep === 1 && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-gray-100 pb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-teal-500 flex items-center justify-center text-white shadow-lg shadow-primary/25">
                    {Icons.user}
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Personal Identification</h2>
                    <p className="text-gray-400 text-sm">Step 1 of 4</p>
                  </div>
                </div>
                <p className="text-gray-500 mt-3">
                  Please provide your legal name and date of birth as they appear on your government-issued ID.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">First Name</label>
                  <input
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="e.g. Jonathan"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Last Name</label>
                  <input
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="e.g. Edwards"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Date of Birth</label>
                <input
                  name="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                />
                <p className="text-gray-400 text-xs">Must be at least 18 years old to verify.</p>
              </div>

              <FileUpload
                label="Upload Government ID"
                onFileSelect={(file) => handleFileSelect('government_id', file)}
                value={formData.government_id}
                accept=".pdf,.jpg,.jpeg,.png"
                hint="SVG, PNG, JPG or PDF (max. 10MB)"
              />
            </div>
          )}

          {/* Step 2: Ministry Background */}
          {currentStep === 2 && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-gray-100 pb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-teal-500 flex items-center justify-center text-white shadow-lg shadow-primary/25">
                    {Icons.church}
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Ministry Background</h2>
                    <p className="text-gray-400 text-sm">Step 2 of 4</p>
                  </div>
                </div>
                <p className="text-gray-500 mt-3">
                  Share your spiritual service history and ministry experience.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Current Church/Ministry Name</label>
                  <input
                    name="church_name"
                    value={formData.church_name}
                    onChange={handleChange}
                    placeholder="e.g. Grace Community Church"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Role/Position</label>
                  <input
                    name="church_role"
                    value={formData.church_role}
                    onChange={handleChange}
                    placeholder="e.g. Youth Pastor"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Years of Active Service</label>
                <input
                  name="years_of_service"
                  type="number"
                  value={formData.years_of_service}
                  onChange={handleChange}
                  placeholder="e.g. 5"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Brief Spiritual Journey/Testimony</label>
                <textarea
                  name="spiritual_testimony"
                  value={formData.spiritual_testimony}
                  onChange={handleChange}
                  placeholder="Share a brief overview of your spiritual walk and ministry experience..."
                  rows={5}
                  maxLength={2500}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 resize-none"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Max 500 words</span>
                  <span>{formData.spiritual_testimony.length}/2500</span>
                </div>
              </div>

              <FileUpload
                label="Recommendation Letter"
                onFileSelect={(file) => handleFileSelect('recommendation_letter', file)}
                value={formData.recommendation_letter}
                accept=".pdf,.doc,.docx"
                hint="PDF, DOCX up to 10MB. Ideally from a senior pastor or ministry leader."
              />
            </div>
          )}

          {/* Step 3: Professional Experience */}
          {currentStep === 3 && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-gray-100 pb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-teal-500 flex items-center justify-center text-white shadow-lg shadow-primary/25">
                    {Icons.briefcase}
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Professional Experience</h2>
                    <p className="text-gray-400 text-sm">Step 3 of 4</p>
                  </div>
                </div>
                <p className="text-gray-500 mt-3">
                  Tell us about your expertise and professional background.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Primary Area of Expertise</label>
                <select
                  name="area_of_expertise"
                  value={formData.area_of_expertise}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                >
                  <option value="">Select your main field</option>
                  {expertiseOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Current Occupation</label>
                <input
                  name="current_occupation"
                  value={formData.current_occupation}
                  onChange={handleChange}
                  placeholder="e.g. Senior Product Designer at TechCorp"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">LinkedIn Profile URL</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    {Icons.linkedin}
                  </div>
                  <input
                    name="linkedin_url"
                    value={formData.linkedin_url}
                    onChange={handleChange}
                    placeholder="https://www.linkedin.com/in/username"
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Mentorship Interests</label>
                  <p className="text-gray-400 text-sm">Select all topics you are comfortable mentoring in.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {interestOptions.map((option) => {
                    const isSelected = formData.mentorship_interests.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleInterestToggle(option.value)}
                        className={`
                          group flex items-center gap-3 p-4 rounded-xl border-2 text-left
                          transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg
                          ${isSelected
                            ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                            : 'border-gray-200 bg-white hover:border-primary/50 hover:bg-gray-50'
                          }
                        `}
                      >
                        <span className="text-2xl">{option.icon}</span>
                        <div className="flex-1">
                          <span className={`text-sm font-semibold ${isSelected ? 'text-primary' : 'text-gray-700'}`}>
                            {option.label}
                          </span>
                        </div>
                        <div className={`
                          w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300
                          ${isSelected
                            ? 'bg-primary border-primary'
                            : 'border-gray-300 group-hover:border-primary/50'
                          }
                        `}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Consent & Submission */}
          {currentStep === 4 && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-gray-100 pb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-teal-500 flex items-center justify-center text-white shadow-lg shadow-primary/25">
                    {Icons.shield}
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Consent & Submission</h2>
                    <p className="text-gray-400 text-sm">Step 4 of 4 - Final Review</p>
                  </div>
                </div>
                <p className="text-gray-500 mt-3">
                  Review and agree to our terms to complete your application.
                </p>
              </div>

              {/* Background Check Disclosure */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
                    {Icons.warning}
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-800 mb-1">Background Check Disclosure</h3>
                    <p className="text-amber-700 text-sm leading-relaxed">
                      By submitting this application, you authorize Eagles & Eaglets to conduct a comprehensive
                      background check to ensure the safety and security of our community. This check may include
                      criminal history, sex offender registry checks, and identity verification. All information gathered
                      will be treated with strict confidentiality.
                    </p>
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="background_check_consent"
                    checked={formData.background_check_consent}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`
                    w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300
                    ${formData.background_check_consent
                      ? 'bg-primary border-primary'
                      : 'border-gray-300 group-hover:border-primary'
                    }
                  `}>
                    {formData.background_check_consent && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-gray-700 text-sm font-medium">I consent to the background check as described above.</span>
                </label>
              </div>

              {/* Code of Conduct */}
              <label className="flex items-start gap-3 cursor-pointer group p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300">
                <input
                  type="checkbox"
                  name="code_of_conduct_agreed"
                  checked={formData.code_of_conduct_agreed}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className={`
                  w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0 mt-0.5
                  ${formData.code_of_conduct_agreed
                    ? 'bg-primary border-primary'
                    : 'border-gray-300 group-hover:border-primary'
                  }
                `}>
                  {formData.code_of_conduct_agreed && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div>
                  <span className="text-gray-800 font-semibold block">I agree to the Mentor Code of Conduct and Ethics</span>
                  <span className="text-gray-500 text-sm">Required for application processing.</span>
                </div>
              </label>

              {/* Statement of Faith */}
              <label className="flex items-start gap-3 cursor-pointer group p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300">
                <input
                  type="checkbox"
                  name="statement_of_faith_agreed"
                  checked={formData.statement_of_faith_agreed}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className={`
                  w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0 mt-0.5
                  ${formData.statement_of_faith_agreed
                    ? 'bg-primary border-primary'
                    : 'border-gray-300 group-hover:border-primary'
                  }
                `}>
                  {formData.statement_of_faith_agreed && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div>
                  <span className="text-gray-800 font-semibold block">I affirm my agreement with the Statement of Faith</span>
                  <span className="text-gray-500 text-sm">This confirms your alignment with our core values.</span>
                </div>
              </label>

              {/* Digital Signature */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">Digital Signature</label>
                <input
                  name="digital_signature"
                  value={formData.digital_signature}
                  onChange={handleChange}
                  placeholder="Type your full legal name as signature"
                  className="w-full px-4 py-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 font-serif italic text-lg"
                />
                <div className="flex items-center gap-2 text-gray-400 text-xs">
                  {Icons.lock}
                  <span>Your application is encrypted and securely stored.</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4">
          {currentStep > 1 ? (
            <button
              onClick={handleBack}
              disabled={isSaving}
              className="group flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 disabled:opacity-50 shadow-sm hover:shadow-md"
            >
              {Icons.arrowLeft}
              <span className="font-semibold">Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              disabled={isSaving}
              className="group relative flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary to-teal-500 text-white font-bold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 overflow-hidden"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent" />

              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  {Icons.arrowRight}
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={
                isSaving ||
                !formData.background_check_consent ||
                !formData.code_of_conduct_agreed ||
                !formData.statement_of_faith_agreed ||
                !formData.digital_signature
              }
              className="group relative flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary to-teal-500 text-white font-bold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed overflow-hidden"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent" />

              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>Submit Application</span>
                  {Icons.arrowRight}
                </>
              )}
            </button>
          )}
        </div>

        {/* Help Text */}
        <p className="text-center text-gray-400 text-sm mt-8">
          Need help? Contact our support team at{' '}
          <a href="mailto:support@eaglesneaglets.com" className="text-primary hover:underline font-medium">
            support@eaglesneaglets.com
          </a>
        </p>
      </main>

      {/* Animation Styles */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }

        /* Floating blobs */
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.5;
          animation: float 20s ease-in-out infinite;
        }
        .blob-1 {
          width: 400px;
          height: 400px;
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(20, 184, 166, 0.1));
          top: -100px;
          left: -100px;
          animation-delay: 0s;
        }
        .blob-2 {
          width: 350px;
          height: 350px;
          background: linear-gradient(135deg, rgba(20, 184, 166, 0.12), rgba(34, 197, 94, 0.08));
          bottom: -50px;
          right: -100px;
          animation-delay: -5s;
        }
        .blob-3 {
          width: 300px;
          height: 300px;
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(59, 130, 246, 0.08));
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: -10s;
        }
        .blob-4 {
          width: 250px;
          height: 250px;
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.08), rgba(34, 197, 94, 0.1));
          top: 30%;
          right: 10%;
          animation-delay: -15s;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -30px) scale(1.05); }
          50% { transform: translate(-20px, 20px) scale(0.95); }
          75% { transform: translate(20px, 30px) scale(1.02); }
        }

        /* Floating shapes */
        .floating-shape {
          position: absolute;
          border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
          animation: morph 15s ease-in-out infinite, drift 25s ease-in-out infinite;
        }
        .shape-1 {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), transparent);
          border: 1px solid rgba(34, 197, 94, 0.1);
          top: 20%;
          left: 10%;
          animation-delay: 0s;
        }
        .shape-2 {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, rgba(20, 184, 166, 0.08), transparent);
          border: 1px solid rgba(20, 184, 166, 0.1);
          top: 60%;
          right: 15%;
          animation-delay: -5s;
        }
        .shape-3 {
          width: 100px;
          height: 100px;
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.06), transparent);
          border: 1px solid rgba(34, 197, 94, 0.08);
          bottom: 20%;
          left: 20%;
          animation-delay: -10s;
        }

        @keyframes morph {
          0%, 100% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
          25% { border-radius: 58% 42% 75% 25% / 76% 46% 54% 24%; }
          50% { border-radius: 50% 50% 33% 67% / 55% 27% 73% 45%; }
          75% { border-radius: 33% 67% 58% 42% / 63% 68% 32% 37%; }
        }

        @keyframes drift {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(50px, -30px) rotate(90deg); }
          50% { transform: translate(-30px, 50px) rotate(180deg); }
          75% { transform: translate(40px, 30px) rotate(270deg); }
        }
      `}</style>
    </div>
  );
};

export default KYCWizardPage;
