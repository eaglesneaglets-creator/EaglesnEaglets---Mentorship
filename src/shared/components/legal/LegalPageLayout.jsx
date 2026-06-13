import PropTypes from 'prop-types';
import PublicNavbar from '@shared/components/layout/PublicNavbar';
import PublicFooter from '@shared/components/layout/PublicFooter';

/**
 * LegalPageLayout — shared chrome for public legal documents (Terms, Privacy,
 * Code of Conduct). Wraps content in the public navbar/footer + a readable prose
 * column, and renders a standing "first draft" banner so no one mistakes these
 * drafts for counsel-reviewed terms.
 *
 * Reused by 21-02 (Privacy) and 21-03 (Code of Conduct).
 */
const LegalPageLayout = ({ title, version, lastUpdated, draft = true, children }) => (
  <div className="min-h-screen bg-background flex flex-col">
    <PublicNavbar />

    <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-10 sm:pb-14">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black text-text-primary">{title}</h1>
        <p className="mt-2 text-sm text-text-secondary">
          {version && <>Version {version}</>}
          {version && lastUpdated && <span className="mx-2">·</span>}
          {lastUpdated && <>Last updated {lastUpdated}</>}
        </p>
      </header>

      {draft && (
        <div
          role="note"
          className="mb-10 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:p-5"
        >
          <p className="text-sm font-semibold text-amber-800">First draft — not legal advice</p>
          <p className="mt-1 text-sm text-amber-700">
            This document is an initial draft and is <strong>not</strong> a substitute for
            review by licensed legal counsel. Clauses marked
            {' '}<span className="font-medium">&ldquo;→ legal review required&rdquo;</span>{' '}
            need jurisdiction-specific review before this page is relied upon.
          </p>
        </div>
      )}

      <article className="space-y-8 text-text-secondary leading-relaxed [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-text-primary [&_h2]:mb-2 [&_h2]:mt-2 [&_h3]:font-semibold [&_h3]:text-text-primary [&_h3]:mt-4 [&_p]:mt-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mt-2 [&_ul]:space-y-1 [&_a]:text-primary [&_a]:hover:underline [&_table]:w-full [&_table]:my-4 [&_table]:border [&_table]:border-slate-200 [&_table]:rounded-lg [&_table]:overflow-hidden [&_th]:bg-slate-50 [&_th]:text-left [&_th]:font-semibold [&_th]:text-text-primary [&_th]:p-3 [&_th]:border-b [&_th]:border-slate-200 [&_td]:p-3 [&_td]:align-top [&_td]:border-b [&_td]:border-slate-100 [&_tr:last-child_th]:border-b-0 [&_tr:last-child_td]:border-b-0">
        {children}
      </article>
    </main>

    <PublicFooter />
  </div>
);

LegalPageLayout.propTypes = {
  title: PropTypes.string.isRequired,
  version: PropTypes.string,
  lastUpdated: PropTypes.string,
  draft: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

export default LegalPageLayout;
