import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const PAGE_TITLE = 'Page not found — Eagles & Eaglets';
const PAGE_META = [
  {
    name: 'description',
    content:
      "The page you're looking for doesn't exist. Return to Eagles & Eaglets to find mentors, programs, and resources.",
  },
  { name: 'robots', content: 'noindex, follow' },
  { name: 'prerender-status-code', content: '404' },
];

/**
 * 404 page for unmatched routes.
 *
 * Replaces the prior `<Navigate to="/login">` catch-all that returned HTTP 200
 * for every typo — a soft-404 anti-pattern that diluted SEO authority.
 *
 * Status-code note: under pure CSR the response is still HTTP 200 from
 * Vercel's SPA rewrite. The `prerender-status-code` meta below is read by
 * prerender services (and by Vike once Plan 22-05 lands) to emit a real
 * status-404 HTML file for unmatched routes.
 */
export default function NotFoundPage() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = PAGE_TITLE;

    const touched = PAGE_META.map(({ name, content }) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      const created = !el;
      const previousContent = el?.getAttribute('content') ?? null;

      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);

      return { el, created, previousContent };
    });

    return () => {
      document.title = previousTitle;
      for (const { el, created, previousContent } of touched) {
        if (created) {
          el.remove();
        } else if (previousContent === null) {
          el.removeAttribute('content');
        } else {
          el.setAttribute('content', previousContent);
        }
      }
    };
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full text-center">
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-primary mb-3">
          Error 404
        </p>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-3 tracking-tight">
          Page not found
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed mb-8">
          The page you&apos;re looking for has moved or never existed.
          Try one of the links below.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-bold text-white bg-primary rounded-xl shadow-lg shadow-primary/25 hover:bg-primary-dark transition"
          >
            Go home
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
