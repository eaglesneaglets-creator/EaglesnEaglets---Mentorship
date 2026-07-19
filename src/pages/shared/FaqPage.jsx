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
      {
        q: 'I signed up with Google — how do I log in?',
        a: (
          <>
            <p>
              If you created your account with <strong>&ldquo;Continue with Google&rdquo;</strong>,
              keep using that same button on the login page — there&apos;s no separate password to
              remember.
            </p>
            <p className="mt-2">
              Want to also sign in with your email and a password (for example, if you&apos;re on a
              device without your Google account)? Go to{' '}
              <strong>Settings → Account → Set a password</strong>. Once set, you can log in either
              with Google <em>or</em> with your email and that password.
            </p>
          </>
        ),
      },
      {
        q: 'Do I need to verify my email before logging in?',
        a: (
          <p>
            Yes. After signing up with an email address, we send a verification link — you must
            confirm it before your first login. Signed up with Google? Your email is already
            verified, so you can skip this step. Didn&apos;t get the link? Check spam, or use the
            resend option on the login page.
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
    category: 'Account & Security',
    items: [
      {
        q: 'What are the password requirements?',
        a: (
          <p>
            Passwords must be at least <strong>10 characters</strong> and include an uppercase
            letter, a lowercase letter, a number, and a special character (such as{' '}
            <code className="text-xs">! @ # $ % ^ &amp; *</code>). This keeps your account and the
            wider community secure.
          </p>
        ),
      },
      {
        q: 'Why was I logged out automatically?',
        a: (
          <p>
            For your security, we sign you out after <strong>15 minutes of inactivity</strong>.
            You&apos;ll see a short warning before it happens so you can stay signed in. Just log
            back in to pick up where you left off.
          </p>
        ),
      },
      {
        q: 'I forgot my password — what do I do?',
        a: (
          <p>
            Use the <Link to="/forgot-password">Forgot password</Link> link on the login page.
            We&apos;ll email you a secure reset link. If you originally signed up with Google and
            never set a password, use <strong>&ldquo;Continue with Google&rdquo;</strong> instead.
          </p>
        ),
      },
      {
        q: 'How do I delete my account?',
        a: (
          <p>
            Go to <strong>Settings → Account → Delete account</strong>. Deletion is{' '}
            <strong>permanent</strong>: it signs you out, anonymizes your profile, and prevents
            future logins with that email. This can&apos;t be undone, so please be sure before
            confirming.
          </p>
        ),
      },
      {
        q: 'How is my personal data protected?',
        a: (
          <p>
            Sensitive identity details (like your national ID) are <strong>encrypted at rest</strong>{' '}
            and never shown to other members. We use HTTPS everywhere, and payment card details are
            never stored on our servers. See our <Link to="/privacy">Privacy Policy</Link> for the
            full picture.
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
      {
        q: 'What is the daily check-in and streak?',
        a: (
          <p>
            Checking in each day earns you points and builds a <strong>streak</strong>. Keep it
            going to unlock streak badges — from <em>Morning Wing</em> (3 days) and{' '}
            <em>Thermal Rider</em> (7 days) all the way to <em>Eternal Soarer</em> (60 days) and the
            rare <em>Iron Wing</em> (90 days). Miss a day and the streak resets, so consistency
            pays off.
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
      {
        q: 'What currency are prices in?',
        a: (
          <p>
            All store prices and donations are in <strong>Ghana Cedis (GHS)</strong>. Payments go
            through Paystack, which supports cards and mobile money.
          </p>
        ),
      },
      {
        q: 'Can I get a refund on a store order?',
        a: (
          <p>
            If something went wrong with an order — wrong item, payment charged but order not
            confirmed, or a delivery issue — email{' '}
            <a className="text-primary font-semibold" href={`mailto:${SUPPORT_EMAIL}`}>support</a>{' '}
            with your order reference. We&apos;ll review it and process an eligible refund back to
            your original payment method.
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
    <LegalPageLayout title="Frequently Asked Questions" draft={false}>
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
