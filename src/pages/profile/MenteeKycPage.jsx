import { useNavigate, Navigate } from 'react-router-dom';
import { useAuthStore } from '@store';
import { profileService } from '../../modules/profile/services/profile-service';
import KycFlow from '../../modules/kyc/KycFlow';
import { useKycRouteGuard } from '../../modules/kyc/hooks/useKycRouteGuard';
import toast from 'react-hot-toast';

export default function MenteeKycPage() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const { isLoading, redirectTo } = useKycRouteGuard('mentee');

    const handleSubmit = async (data, files) => {
        if (files.picture) {
            const res = await profileService.uploadPicture(files.picture);
            if (!res.success) throw new Error(res.error?.message || 'Picture upload failed');
        }
        const payload = {
            national_id_number: data.national_id_number,
            marital_status: data.marital_status,
            country: data.country,
            city: data.city,
            phone_number: data.phone_number,
            employment_status: data.employment_status,
            bio: data.bio,
            mentorship_types: data.mentorship_types,
        };
        if (data.linkedin_url) payload.linkedin_url = data.linkedin_url;
        if (data.location) payload.location = data.location;
        const res = await profileService.updateMenteeProfile(payload);
        if (!res.success) throw new Error(res.error?.message || 'Submission failed');

        const submitRes = await profileService.submitProfile();
        if (!submitRes.success) throw new Error(submitRes.error?.message || 'Submit transition failed');

        toast.success('Profile submitted! Review within 1-3 business days.');
    };

    // Submitted/approved profiles can't re-open the wizard (back-button fix).
    if (isLoading) return null;
    if (redirectTo) return <Navigate to={redirectTo} replace />;

    return (
        <KycFlow
            role="mentee"
            onSubmit={handleSubmit}
            onComplete={() => navigate('/pending-approval', { replace: true })}
            defaultValues={{
                full_name: user?.full_name || '',
            }}
        />
    );
}
