import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@store';
import { profileService } from '../../modules/profile/services/profile-service';
import KycFlow from '../../modules/kyc/KycFlow';
import toast from 'react-hot-toast';

export default function MentorKycPage() {
    const { user } = useAuthStore();
    const navigate = useNavigate();

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
        };
        if (data.linkedin_url) payload.linkedin_url = data.linkedin_url;
        const res = await profileService.updateMentorProfile(payload);
        if (!res.success) throw new Error(res.error?.message || 'Submission failed');

        const submitRes = await profileService.submitProfile();
        if (!submitRes.success) throw new Error(submitRes.error?.message || 'Submit transition failed');

        toast.success('Application submitted! Review within 1-3 business days.');
    };

    return (
        <KycFlow
            role="mentor"
            onSubmit={handleSubmit}
            onComplete={() => navigate('/pending-approval')}
            defaultValues={{
                full_name: user?.full_name || '',
            }}
        />
    );
}
