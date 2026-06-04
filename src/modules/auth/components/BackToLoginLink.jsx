import { Link } from 'react-router-dom';

const BackToLoginLink = ({ className = 'mt-6' }) => (
  <Link
    to="/login"
    className={`flex items-center justify-center gap-2 text-sm text-text-secondary hover:text-text-primary ${className}`.trim()}
  >
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
    Back to login
  </Link>
);

export default BackToLoginLink;
