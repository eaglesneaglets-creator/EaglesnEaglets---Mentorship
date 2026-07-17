import PropTypes from 'prop-types';

/**
 * RoleStep — role-first picker. Renders full selection cards when no role is
 * chosen, and a compact "Registering as …" badge with a Change action once
 * a role is selected. Pure presentational; parent owns state.
 */
const EagleIcon = (props) => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const EagletIcon = (props) => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const RoleCard = ({ role, onSelect, title, blurb, tags, Icon, overlay }) => (
  <button
    type="button"
    onClick={() => onSelect(role)}
    className="group relative flex flex-col items-start p-4 sm:p-5 lg:p-6 rounded-lg sm:rounded-xl border-2 text-left border-border bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
  >
    <div className={`absolute inset-0 ${overlay} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
    <div className="relative w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
      <Icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-primary" />
    </div>
    <h3 className="relative font-bold text-text-primary text-base sm:text-lg lg:text-xl mb-1 sm:mb-2 group-hover:text-primary transition-colors duration-300">
      {title}
    </h3>
    <p className="relative text-xs sm:text-sm text-text-secondary mb-3 sm:mb-4">{blurb}</p>
    <span className="relative inline-flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-primary font-medium px-2 py-1 sm:px-3 sm:py-1.5 bg-primary/10 rounded-full">
      {tags}
    </span>
    <div className="hidden sm:flex absolute bottom-4 right-4 w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-primary/10 items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
      <svg className="w-3 h-3 lg:w-4 lg:h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  </button>
);

const RoleStep = ({ selectedRole, onSelect, onChangeRole }) => {
  if (!selectedRole) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-border/50 p-4 sm:p-6 lg:p-8">
        <h2 className="text-base sm:text-lg font-semibold text-text-primary mb-4 sm:mb-6 text-center">
          Choose your path
          <span className="block text-xs sm:text-sm font-normal text-text-muted mt-1">Select the role that best describes you</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          <RoleCard
            role="eagle"
            onSelect={onSelect}
            Icon={EagleIcon}
            title="I am an Eagle"
            blurb="I have experience to share. I want to guide the next generation and help them soar."
            tags="Mentor • Leader • Guide"
            overlay="bg-gradient-to-br from-primary/5 to-primary/10"
          />
          <RoleCard
            role="eaglet"
            onSelect={onSelect}
            Icon={EagletIcon}
            title="I am an Eaglet"
            blurb="I am ready to learn. I'm looking for guidance to help me grow and navigate my path."
            tags="Mentee • Learner • Growing"
            overlay="bg-gradient-to-br from-blue-50 to-primary/5"
          />
        </div>
      </div>
    );
  }

  const isEagle = selectedRole === 'eagle';
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-primary/30 shadow-sm">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
          {isEagle ? <EagleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> : <EagletIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />}
        </div>
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-semibold text-text-primary truncate">
            Registering as {isEagle ? 'an Eagle (Mentor)' : 'an Eaglet (Mentee)'}
          </p>
          <p className="text-[10px] sm:text-xs text-text-secondary">
            {isEagle
              ? 'Identity verification required after registration'
              : 'Quick profile verification after registration'}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onChangeRole}
        className="self-end sm:self-auto text-xs sm:text-sm font-medium text-primary px-3 py-1.5 sm:px-4 rounded-full hover:bg-primary/10 transition-colors duration-200"
      >
        Change
      </button>
    </div>
  );
};

RoleStep.propTypes = {
  selectedRole: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onChangeRole: PropTypes.func.isRequired,
};

export default RoleStep;
