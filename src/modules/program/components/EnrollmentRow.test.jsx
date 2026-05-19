import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EnrollmentRow from './EnrollmentRow';

const baseEnrollment = {
    id: 1,
    mentee_name: 'Jane Doe',
    requested_at: '2026-04-01T00:00:00Z',
    objectives_completed: 0,
    objectives_count: 3,
};

describe('EnrollmentRow', () => {
    it('pending variant: shows Approve and Reject', () => {
        render(<EnrollmentRow enrollment={baseEnrollment} variant="pending" />);
        expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Reject' })).toBeInTheDocument();
    });

    it('pending: Approve fires onApprove(id)', () => {
        const onApprove = vi.fn();
        render(<EnrollmentRow enrollment={baseEnrollment} variant="pending" onApprove={onApprove} />);
        fireEvent.click(screen.getByRole('button', { name: 'Approve' }));
        expect(onApprove).toHaveBeenCalledWith(1);
    });

    it('active: Complete is disabled when objectives incomplete', () => {
        render(<EnrollmentRow enrollment={baseEnrollment} variant="active" />);
        expect(screen.getByRole('button', { name: 'Complete' })).toBeDisabled();
    });

    it('active: Complete enabled when all objectives done', () => {
        const done = { ...baseEnrollment, objectives_completed: 3, objectives_count: 3 };
        render(<EnrollmentRow enrollment={done} variant="active" />);
        expect(screen.getByRole('button', { name: 'Complete' })).not.toBeDisabled();
    });

    it('completed variant: no action buttons', () => {
        render(<EnrollmentRow enrollment={baseEnrollment} variant="completed" />);
        expect(screen.queryByRole('button')).toBeNull();
    });

    it('exit variant: shows Approve Exit and Deny', () => {
        render(<EnrollmentRow enrollment={baseEnrollment} variant="exit" />);
        expect(screen.getByRole('button', { name: 'Approve Exit' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Deny' })).toBeInTheDocument();
    });

    it('isPending disables all actions', () => {
        render(<EnrollmentRow enrollment={baseEnrollment} variant="pending" isPending />);
        expect(screen.getByRole('button', { name: 'Approve' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Reject' })).toBeDisabled();
    });
});
