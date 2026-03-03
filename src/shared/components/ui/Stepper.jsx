import PropTypes from 'prop-types';

/**
 * Stepper Component
 * Progress stepper for multi-step forms
 */
const Stepper = ({
  steps,
  currentStep,
  completedSteps = [],
  onStepClick,
  className = '',
}) => {
  const isCompleted = (stepNumber) => completedSteps.includes(stepNumber);
  const isActive = (stepNumber) => stepNumber === currentStep;
  const isClickable = (stepNumber) => onStepClick && (isCompleted(stepNumber) || stepNumber <= currentStep);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const completed = isCompleted(stepNumber);
          const active = isActive(stepNumber);
          const clickable = isClickable(stepNumber);

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center relative z-10">
                <button
                  onClick={() => clickable && onStepClick(stepNumber)}
                  disabled={!clickable}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    font-bold text-sm transition-all duration-200
                    ${clickable ? 'cursor-pointer' : 'cursor-default'}
                    ${completed
                      ? 'bg-primary text-white shadow-md'
                      : active
                        ? 'bg-primary text-white ring-4 ring-primary/20 shadow-lg scale-110'
                        : 'bg-gray-200 text-text-muted'
                    }
                  `}
                >
                  {completed ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </button>
                {/* Step Label */}
                <span
                  className={`
                    mt-2 text-xs font-medium text-center whitespace-nowrap
                    ${active
                      ? 'text-primary font-bold'
                      : completed
                        ? 'text-primary'
                        : 'text-text-muted'
                    }
                  `}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 mt-[-20px]">
                  <div
                    className={`
                      h-full transition-colors duration-300
                      ${completed ? 'bg-primary' : 'bg-gray-200'}
                    `}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

Stepper.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  currentStep: PropTypes.number.isRequired,
  completedSteps: PropTypes.arrayOf(PropTypes.number),
  onStepClick: PropTypes.func,
  className: PropTypes.string,
};

export default Stepper;
