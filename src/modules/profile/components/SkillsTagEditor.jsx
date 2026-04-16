import { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * SkillsTagEditor — tag-style input for skills/interests
 * Press Enter or comma to add a tag. Click ✕ to remove.
 * Props: value (string[]), onChange, placeholder, maxTags, label
 */
const SkillsTagEditor = ({
  value = [],
  onChange,
  placeholder = 'Type a skill and press Enter',
  maxTags = 20,
  label,
  className = '',
}) => {
  const [input, setInput] = useState('');
  const inputRef = useRef(null);

  const addTag = (raw) => {
    const tag = raw.trim().replace(/,$/, '').trim();
    if (!tag || value.includes(tag) || value.length >= maxTags) return;
    onChange([...value, tag]);
    setInput('');
  };

  const removeTag = (tag) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}

      <div
        className="flex flex-wrap gap-2 p-3 border border-slate-200 rounded-xl bg-white min-h-[48px] cursor-text focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-400 transition-all"
        onClick={() => inputRef.current?.focus()}
      >
        <AnimatePresence>
          {value.map((tag) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-sm font-medium"
            >
              {tag}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
                className="text-emerald-400 hover:text-emerald-700 transition-colors leading-none"
                aria-label={`Remove ${tag}`}
              >
                ✕
              </button>
            </motion.span>
          ))}
        </AnimatePresence>

        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => input && addTag(input)}
          placeholder={value.length === 0 ? placeholder : ''}
          disabled={value.length >= maxTags}
          className="flex-1 min-w-[140px] outline-none text-sm text-slate-700 placeholder:text-slate-400 bg-transparent"
        />
      </div>

      <p className="mt-1.5 text-xs text-slate-400">
        {value.length}/{maxTags} tags · Press Enter or comma to add
      </p>
    </div>
  );
};

SkillsTagEditor.propTypes = {
  value: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  maxTags: PropTypes.number,
  label: PropTypes.string,
  className: PropTypes.string,
};

export default SkillsTagEditor;
