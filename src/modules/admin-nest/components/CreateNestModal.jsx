import { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from '@shared/components/ui/Modal';
import { Input, Textarea, Button } from '@components/ui';
import { useCreateNest, useAssignableMentors } from '../hooks/useAdminNests';
import { CATEGORY_OPTIONS } from './nestMeta';

const selectClass =
  'w-full rounded-lg border border-border bg-white text-text-primary py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors';

/**
 * CreateNestModal — admin creates a nest on behalf of a mentor.
 * The mentor picker lists approved-KYC eagles (server also enforces this).
 */
const CreateNestModal = ({ isOpen, onClose }) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'other',
    privacy: 'public',
    max_members: 50,
    eagle_id: '',
  });
  const [mentorSearch, setMentorSearch] = useState('');
  const [error, setError] = useState('');

  const { data: mentors = [], isLoading: mentorsLoading } = useAssignableMentors(mentorSearch);
  const createMutation = useCreateNest();

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const reset = () => {
    setForm({ name: '', description: '', category: 'other', privacy: 'public', max_members: 50, eagle_id: '' });
    setMentorSearch('');
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('Name is required.');
    if (!form.eagle_id) return setError('Please assign a mentor.');
    createMutation.mutate(
      { ...form, max_members: Number(form.max_members) },
      {
        onSuccess: () => { reset(); onClose(); },
        onError: (err) => setError(err?.message || 'Failed to create nest.'),
      },
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Header onClose={onClose}>Create New Nest</Modal.Header>
      <form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
            )}

            <Input
              label="Nest Name"
              name="name"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Faith & Profession"
              required
            />

            <Textarea
              label="Description"
              name="description"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="What is this nest about?"
              rows={3}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={(e) => set('category', e.target.value)}
                  className={selectClass}
                >
                  {CATEGORY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">Privacy</label>
                <select
                  name="privacy"
                  value={form.privacy}
                  onChange={(e) => set('privacy', e.target.value)}
                  className={selectClass}
                >
                  <option value="public">Public</option>
                  <option value="invitation_only">Invitation Only</option>
                </select>
              </div>
            </div>

            <Input
              label="Max Members"
              name="max_members"
              type="number"
              min={1}
              value={form.max_members}
              onChange={(e) => set('max_members', e.target.value)}
            />

            {/* Mentor picker */}
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Assign Mentor <span className="text-error">*</span>
              </label>
              <Input
                name="mentor_search"
                value={mentorSearch}
                onChange={(e) => setMentorSearch(e.target.value)}
                placeholder="Search mentors by name…"
                className="mb-2"
              />
              <div className="max-h-44 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
                {mentorsLoading ? (
                  <p className="p-3 text-sm text-slate-400">Loading mentors…</p>
                ) : mentors.length === 0 ? (
                  <p className="p-3 text-sm text-slate-400">No approved mentors found.</p>
                ) : (
                  mentors.map((m) => {
                    const name = m.full_name || `${m.first_name || ''} ${m.last_name || ''}`.trim();
                    const selected = form.eagle_id === m.id;
                    return (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => set('eagle_id', m.id)}
                        className={`w-full flex items-center gap-3 p-2.5 text-left transition-colors ${selected ? 'bg-primary/10' : 'hover:bg-slate-50'}`}
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                          {`${m.first_name?.[0] || ''}${m.last_name?.[0] || ''}`.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{name}</p>
                          <p className="text-[11px] text-slate-400 truncate">{m.email}</p>
                        </div>
                        {selected && <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <Button type="submit" variant="primary" loading={createMutation.isPending}>
            Create Nest
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

CreateNestModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CreateNestModal;
