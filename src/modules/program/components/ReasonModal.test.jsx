import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ReasonModal from './ReasonModal';

const baseConfig = {
    title: 'Test',
    confirmLabel: 'Go',
    onConfirm: vi.fn(),
};

describe('ReasonModal', () => {
    it('returns null when config is null', () => {
        const { container } = render(<ReasonModal config={null} onClose={() => { }} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders title and confirm button', () => {
        render(<ReasonModal config={baseConfig} onClose={() => { }} />);
        expect(screen.getByText('Test')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument();
    });

    it('disables confirm when required and reason empty', () => {
        render(<ReasonModal config={{ ...baseConfig, required: true }} onClose={() => { }} />);
        expect(screen.getByRole('button', { name: 'Go' })).toBeDisabled();
    });

    it('enables confirm when required reason filled', () => {
        render(<ReasonModal config={{ ...baseConfig, required: true }} onClose={() => { }} />);
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'because' } });
        expect(screen.getByRole('button', { name: 'Go' })).not.toBeDisabled();
    });

    it('calls onConfirm with trimmed reason', () => {
        const onConfirm = vi.fn();
        const onClose = vi.fn();
        render(<ReasonModal config={{ ...baseConfig, onConfirm }} onClose={onClose} />);
        fireEvent.change(screen.getByRole('textbox'), { target: { value: '  hello  ' } });
        fireEvent.click(screen.getByRole('button', { name: 'Go' }));
        expect(onConfirm).toHaveBeenCalledWith('hello');
        expect(onClose).toHaveBeenCalled();
    });
});
