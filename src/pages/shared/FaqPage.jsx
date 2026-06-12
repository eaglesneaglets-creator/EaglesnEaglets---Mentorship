import { Link } from 'react-router-dom';
import LegalPageLayout from '@shared/components/legal/LegalPageLayout';

const SUPPORT_EMAIL = 'support.eaglesandeaglets@gmail.com';

/**
 * FaqPage — public FAQ, reachable from the dashboard help (?) icon and the
 * public footer. Native <details>/<summary> accordions: keyboard-accessible,
 * responsive, no state needed.
 */

const FAQS = [
  {
    category: 'Getting Started',
    items: [
      {
        q: 'What is Eagles & Eaglets?',
        a: (
          <p>
            Eagles &amp; Eaglets is a digital mentorship and capacity-building community where
            mentors (&ldquo;Eagles&rdquo;) guide young people (&ldquo;Eaglets&rdquo;) through
            structured programs, learning content, and real conversations — anytime, anywhere.
          </p>
        ),
      },
      {
        q: 'How do I join?',
        a: (
          <p>
            Create an account from the <Link to="/register">sign-up page</Link>, choose whether
            you&apos;re joining as a mentor or mentee, complete your profile verification (KYC),
            and you&apos;ll be matched into the community once approved.
          </p>
        ),
      },
    ],
  },
  {
    category: 'KYC & Verification',
    items: [
      {
        q: 'What is KYC and why do you need it?',
        a: (
          <p>
            KYC (&ldquo;Know Your Customer&rdquo;) is our identity verification step. Because
            mentors work closely with young people, we verify every member&apos;s identity to keep
            the community safe. Your ID number is encrypted at rest and never shown to other
            members.
          </p>
        ),
      },
      {
        q: 'How long does KYC approval take?',
        a: (
          <p>
            Our team reviews applications within <strong>1–3 business days</strong>. You&apos;ll
            receive an email once a decision is made. While waiting, you can check your status on
            the pending-approval page.
          </p>
        ),
      },
      {
        q: 'Can I update my details after approval?',
        a: (
          <p>
            Yes — go to <strong>Settings → Profile</strong> to update contact and preference
            details (phone, location, bio, mentorship areas). Identity details such as your
            national ID are locked after verification; to change those, email{' '}
            <a className="text-primary font-semibold" href={`mailto:${SUPPORT_EMAIL}`}>support</a>.
          </p>
        ),
      },
      {
        q: 'What documents do mentors need?',
        a: (
          <p>
            Mentors provide a government-issued ID, a CV, and agree to the{' '}
            <Link to="/mentor-code-of-conduct">Mentor Code of Conduct</Link>. A recommendation
            letter speeds up review but is optional.
          </p>
        ),
      },
    ],
  },
  {
    category: 'Mentorship & Programs',
    items: [
      {
        q: 'How do I join a mentorship program?',
        a: (
          <p>
            From your dashboard, open <strong>My Nest → Discover</strong>, browse mentors, and
            apply to a program. The mentor reviews your application and you&apos;ll be notified of
            the outcome.
          </p>
        ),
      },
      {
        q: 'How can a mentee become a mentor?',
        a: (
          <p>
            Reach Level 5 by completing programs and earning points — then an &ldquo;Apply to
            mentor&rdquo; option appears on your dashboard. Approval includes mentor KYC and an
            admin review.
          </p>
        ),
      },
    ],
  },
  {
    category: 'Points & Badges',
    items: [
      {
        q: 'How do I earn points?',
        a: (
          <p>
            Points come from completing assignments, engaging with program content, and mentor
            awards. Points unlock levels and badges — see your progress on the{' '}
            leaderboard and badges pages in your dashboard.
          </p>
        ),
      },
    ],
  },
  {
    category: 'Store & Donations',
    items: [
      {
        q: 'How do payments work?',
        a: (
          <p>
            Store purchases are processed securely through Paystack; donations support our
            programs and are processed via mobile money. We never store your card details.
          </p>
        ),
      },
    ],
  },
  {
    category: 'Support',
    items: [
      {
        q: 'How do I contact the admins?',
        a: (
          <p>
            Email{' '}
            <a className="text-primary font-semibold" href={`mailto:${SUPPORT_EMAIL}`}>
              support
            </a>{' '}
            and the team will get back to you. For account-specific issues, write from the email
            address you registered with so we can verify it&apos;s you.
          </p>
        ),
      },
      {
        q: 'How do I report inappropriate behaviour?',
        a: (
          <p>
            Report it to{' '}
            <a className="text-primary font-semibold" href={`mailto:${SUPPORT_EMAIL}`}>support</a>{' '}
            with as much detail as possible. All members are bound by the{' '}
            <Link to="/code-of-conduct">Community Code of Conduct</Link>; reports are handled
            confidentially.
          </p>
        ),
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <LegalPageLayout title="Frequently Asked Questions">
      <div className="space-y-8 not-prose">
        {FAQS.map((group) => (
          <section key={group.category}>
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400 mb-3">
              {group.category}
            </h2>
            <div className="space-y-2">
              {group.items.map((item) => (
                <details
                  key={item.q}
                  className="group bg-white rounded-xl border border-slate-200 open:border-primary/40 open:shadow-sm transition"
                >
                  <summary className="flex items-center justify-between gap-3 cursor-pointer list-none px-4 sm:px-5 py-3.5 text-sm font-semibold text-slate-800 [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <span className="material-symbols-outlined text-slate-400 text-lg transition-transform group-open:rotate-180 flex-shrink-0">
                      expand_more
                    </span>
                  </summary>
                  <div className="px-4 sm:px-5 pb-4 text-sm text-slate-600 leading-relaxed">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
    </LegalPageLayout>
  );
}
