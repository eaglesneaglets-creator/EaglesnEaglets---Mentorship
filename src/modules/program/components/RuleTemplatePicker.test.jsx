import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RuleTemplatePicker from './RuleTemplatePicker';
import { RULE_TEMPLATES } from '../constants/ruleTemplates';

describe('RuleTemplatePicker', () => {
    it('renders trigger button', () => {
        render(<RuleTemplatePicker onSelect={() => { }} />);
        expect(screen.getByRole('button', { name: /add rule/i })).toBeInTheDocument();
    });

    it('reveals all 5 templates on click', () => {
        render(<RuleTemplatePicker onSelect={() => { }} />);
        fireEvent.click(screen.getByRole('button', { name: /add rule/i }));
        RULE_TEMPLATES.forEach((tpl) => {
            expect(screen.getByText(tpl.label)).toBeInTheDocument();
        });
    });

    it('fires onSelect with template payload', () => {
        const onSelect = vi.fn();
        render(<RuleTemplatePicker onSelect={onSelect} />);
        fireEvent.click(screen.getByRole('button', { name: /add rule/i }));
        fireEvent.click(screen.getByText(RULE_TEMPLATES[0].label));
        expect(onSelect).toHaveBeenCalledWith(
            expect.objectContaining({ type: RULE_TEMPLATES[0].type }),
        );
    });
});
