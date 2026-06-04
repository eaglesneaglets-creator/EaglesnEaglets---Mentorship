import PropTypes from 'prop-types';
import { Alert } from '@components/ui';

const AuthFormIntro = ({ icon, title, description, error, onErrorDismiss, iconSize = 'md' }) => {
  const iconWrapClass = iconSize === 'lg' ? 'w-16 h-16' : 'w-14 h-14';

  return (
    <>
      <div className={`${iconWrapClass} bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6`}>
        {icon}
      </div>

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-text-primary mb-2">{title}</h2>
        {description && <p className="text-text-secondary">{description}</p>}
      </div>

      {error && (
        <Alert
          variant="error"
          className="mb-4 animate-fade-in"
          onClose={onErrorDismiss}
        >
          {error}
        </Alert>
      )}
    </>
  );
};

AuthFormIntro.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.node,
  error: PropTypes.string,
  onErrorDismiss: PropTypes.func,
  iconSize: PropTypes.oneOf(['md', 'lg']),
};

export default AuthFormIntro;
