import PropTypes from 'prop-types';

/**
 * PasswordStrengthMeter — pure-regex strength scoring, no external dep.
 *
 * Scores against the same rules register-schema enforces:
 * length >= 10, uppercase, lowercase, digit, special char. Each satisfied
 * rule is a point (0-5), mapped to 4 visual bands.
 */
const RULES = [
  (v) => v.length >= 10,
  (v) => /[A-Z]/.test(v),
  (v) => /[a-z]/.test(v),
  (v) => /\d/.test(v),
  (v) => /[!@#$%^&*(),.?":{}|<>]/.test(v),
];

const BANDS = [
  { label: '', bars: 0, color: '' },
  { label: 'Weak', bars: 1, color: 'bg-red-400' },
  { label: 'Fair', bars: 2, color: 'bg-amber-400' },
  { label: 'Good', bars: 3, color: 'bg-yellow-400' },
  { label: 'Strong', bars: 4, color: 'bg-emerald-500' },
];

const scoreToBand = (score) => {
  // 5 rules → 4 bands. 0=none,1-2=Weak,3=Fair,4=Good,5=Strong
  if (score <= 0) return 0;
  if (score <= 2) return 1;
  if (score === 3) return 2;
  if (score === 4) return 3;
  return 4;
};

const PasswordStrengthMeter = ({ password = '' }) => {
  if (!password) return null;

  const score = RULES.reduce((acc, rule) => acc + (rule(password) ? 1 : 0), 0);
  const bandIdx = scoreToBand(score);
  const band = BANDS[bandIdx];

  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              i < band.bars ? band.color : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
      {band.label && (
        <p className={`mt-1 text-xs font-medium ${
          bandIdx >= 4 ? 'text-emerald-600'
            : bandIdx === 3 ? 'text-yellow-600'
            : bandIdx === 2 ? 'text-amber-600'
            : 'text-red-500'
        }`}>
          Password strength: {band.label}
        </p>
      )}
    </div>
  );
};

PasswordStrengthMeter.propTypes = {
  password: PropTypes.string,
};

export default PasswordStrengthMeter;
