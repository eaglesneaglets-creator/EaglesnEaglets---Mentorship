import { useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

/**
 * PortfolioSection — displays mentor portfolio/credentials from MentorKYC
 * editMode: allow inline editing
 * data: { cv, linkedin_url, display_picture, mentorship_types, area_of_expertise }
 * onSave: (field, value) => void
 */
const PortfolioSection = ({
  data = {},
  editMode = false,
  onSave,
  className = '',
}) => {
  const [editing, setEditing] = useState(null); // field name being edited
  const [draft, setDraft] = useState('');

  const startEdit = (field, currentValue) => {
    if (!editMode) return;
    setEditing(field);
    setDraft(currentValue ?? '');
  };

  const saveEdit = () => {
    if (editing) onSave?.(editing, draft);
    setEditing(null);
    setDraft('');
  };

  const cancelEdit = () => {
    setEditing(null);
    setDraft('');
  };

  const mentorshipTypes = Array.isArray(data.mentorship_types)
    ? data.mentorship_types
    : typeof data.mentorship_types === 'string'
    ? JSON.parse(data.mentorship_types || '[]')
    : [];

  const expertise = Array.isArray(data.area_of_expertise)
    ? data.area_of_expertise
    : typeof data.area_of_expertise === 'string'
    ? data.area_of_expertise.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className={`space-y-5 ${className}`}>
      {/* Display picture */}
      {data.display_picture && (
        <div className="flex items-center gap-4">
          <img
            src={data.display_picture}
            alt="Profile"
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-100 shadow-sm"
            loading="lazy"
          />
          <div>
            <p className="text-sm font-semibold text-slate-700">Profile Photo</p>
            <p className="text-xs text-slate-400">Visible to eaglets in your nests</p>
          </div>
        </div>
      )}

      {/* LinkedIn */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">LinkedIn</p>
            {editing === 'linkedin_url' ? (
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                className="text-sm border border-emerald-300 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-emerald-500 w-full"
                placeholder="https://linkedin.com/in/..."
              />
            ) : data.linkedin_url ? (
              <a
                href={data.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline truncate block"
              >
                {data.linkedin_url.replace('https://www.', '').replace('https://', '')}
              </a>
            ) : (
              <p className="text-sm text-slate-400 italic">Not provided</p>
            )}
          </div>
        </div>
        {editMode && editing !== 'linkedin_url' && (
          <button
            type="button"
            onClick={() => startEdit('linkedin_url', data.linkedin_url)}
            className="text-xs text-slate-400 hover:text-emerald-600 transition-colors flex-shrink-0"
          >
            Edit
          </button>
        )}
        {editing === 'linkedin_url' && (
          <div className="flex gap-2 flex-shrink-0">
            <button type="button" onClick={saveEdit} className="text-xs text-emerald-600 font-semibold hover:text-emerald-700">Save</button>
            <button type="button" onClick={cancelEdit} className="text-xs text-slate-400 hover:text-slate-600">Cancel</button>
          </div>
        )}
      </div>

      {/* CV / Resume */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">CV / Resume</p>
            {data.cv ? (
              <a href={data.cv} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-600 hover:underline">
                View document
              </a>
            ) : (
              <p className="text-sm text-slate-400 italic">Not uploaded</p>
            )}
          </div>
        </div>
      </div>

      {/* Mentorship types */}
      {mentorshipTypes.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Mentorship Types</p>
          <div className="flex flex-wrap gap-2">
            {mentorshipTypes.map((type) => (
              <span
                key={type}
                className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-medium"
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Area of expertise */}
      {expertise.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Areas of Expertise</p>
          <div className="flex flex-wrap gap-2">
            {expertise.map((item, i) => (
              <motion.span
                key={item}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium"
              >
                {item}
              </motion.span>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!data.cv && !data.linkedin_url && mentorshipTypes.length === 0 && expertise.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-2xl">
          <span className="material-symbols-outlined text-3xl text-slate-300 block mb-2">work</span>
          <p className="text-sm text-slate-400">No portfolio info yet</p>
          {editMode && (
            <p className="text-xs text-slate-300 mt-1">Complete your KYC to add credentials</p>
          )}
        </div>
      )}
    </div>
  );
};

PortfolioSection.propTypes = {
  data: PropTypes.shape({
    cv: PropTypes.string,
    linkedin_url: PropTypes.string,
    display_picture: PropTypes.string,
    mentorship_types: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
    area_of_expertise: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  }),
  editMode: PropTypes.bool,
  onSave: PropTypes.func,
  className: PropTypes.string,
};

export default PortfolioSection;
