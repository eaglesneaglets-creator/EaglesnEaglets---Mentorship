import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Logo from '../../../assets/EaglesnEagletsLogo.jpeg';

const AuthFormShell = ({ headerAction, children, cardClassName = '' }) => (
  <div className="min-h-screen bg-background">
    <header className="bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={Logo} alt="Eagles & Eaglets" className="h-10 w-auto" />
        </Link>
        {headerAction}
      </div>
    </header>

    <main className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
      <div className={`max-w-md w-full bg-white rounded-2xl shadow-lg border border-border p-8 ${cardClassName}`.trim()}>
        {children}
      </div>
    </main>
  </div>
);

AuthFormShell.propTypes = {
  headerAction: PropTypes.node,
  children: PropTypes.node.isRequired,
  cardClassName: PropTypes.string,
};

export default AuthFormShell;
