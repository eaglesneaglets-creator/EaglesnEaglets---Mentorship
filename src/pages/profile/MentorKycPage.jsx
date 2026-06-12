import { useNavigate, Navigate } from 'react-router-dom';
import { useAuthStore } from '@store';
import { profileService } from '../../modules/profile/services/profile-service';
import KycFlow from '../../modules/kyc/KycFlow';
import { useKycRouteGuard } from '../../modules/kyc/hooks/useKycRouteGuard';
import { MENTOR_CONDUCT_VERSION, MENTOR_CONDUCT_PLAINTEXT } from '../legal/MentorCodeOfConductPage';
import toast from 'react-hot-toast';

export default function MentorKycPage() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const { isLoading, redirectTo } = useKycRouteGuard('mentor');

    const handleSubmit = async (data, files) => {
        if (files.picture) {
            const res = await profileService.uploadPicture(files.picture);
            if (!res.success) throw new Error(res.error?.message || 'Picture upload failed');
        }
        if (files.cv) {
            const res = await profileService.uploadCV(files.cv);
            if (!res.success) throw new Error(res.error?.message || 'CV upload failed');
        }
        const payload = {
            location: data.location,
            national_id_number: data.national_id_number,
            marital_status: data.marital_status,
            employment_status: data.employment_status,
            phone_number: data.phone_number,
            profile_description: data.profile_description,
            mentorship_types: data.mentorship_types,
            // Record which Mentor Code of Conduct version was agreed + an immutable snapshot.
            code_of_conduct_version: MENTOR_CONDUCT_VERSION,
            code_of_conduct_text: MENTOR_CONDUCT_PLAINTEXT,
        };
        if (data.linkedin_url) payload.linkedin_url = data.linkedin_url;
        const res = await profileService.updateMentorProfile(payload);
        if (!res.success) throw new Error(res.error?.message || 'Submission failed');

        const submitRes = await profileService.submitProfile();
        if (!submitRes.success) throw new Error(submitRes.error?.message || 'Submit transition failed');

        toast.success('Application submitted! Review within 1-3 business days.');
    };

    // Submitted/approved profiles can't re-open the wizard (back-button fix).
    if (isLoading) return null;
    if (redirectTo) return <Navigate to={redirectTo} replace />;

    return (
        <KycFlow
            role="mentor"
            onSubmit={handleSubmit}
            onComplete={() => navigate('/pending-approval', { replace: true })}
            defaultValues={{
                full_name: user?.full_name || '',
            }}
        />
    );
}
