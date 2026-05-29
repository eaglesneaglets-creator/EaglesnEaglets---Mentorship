import { Link } from 'react-router-dom';
import LegalPageLayout from '@shared/components/legal/LegalPageLayout';

const TERMS_VERSION = '2026-05-28';
const LAST_UPDATED = 'May 28, 2026';

/** Inline marker for clauses that need licensed-counsel review per jurisdiction. */
const ReviewFlag = () => (
  <span className="inline-block ml-1 text-xs font-semibold text-amber-700 whitespace-nowrap">
    → legal review required
  </span>
);

/**
 * TermsPage — first-draft Terms of Service for Eagles & Eaglets, rendered
 * through the shared LegalPageLayout. Content is authored as JSX (no markdown
 * dependency). Jurisdiction-specific clauses carry an explicit review marker.
 */
const TermsPage = () => (
  <LegalPageLayout title="Terms of Service" version={TERMS_VERSION} lastUpdated={LAST_UPDATED}>
    <section>
      <h2>1. Acceptance of Terms</h2>
      <p>
        These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of the
        Eagles &amp; Eaglets mentorship platform (the &ldquo;Platform&rdquo;), operated by
        Eagles &amp; Eaglets (&ldquo;we&rdquo;, &ldquo;us&rdquo;, the &ldquo;Company&rdquo;
        — legal entity name and registered address to be confirmed<ReviewFlag />). By creating
        an account, accessing, or using the Platform you agree to be bound by these Terms and by
        our <Link to="/privacy">Privacy Policy</Link>. If you do not agree, do not use the Platform.
      </p>
    </section>

    <section>
      <h2>2. Eligibility &amp; Minors</h2>
      <p>
        You must be able to form a binding contract to use the Platform. Where a mentee
        (&ldquo;Eaglet&rdquo;) is a minor under applicable law, a parent or legal guardian must
        consent to and accept these Terms on the minor&rsquo;s behalf, and is responsible for the
        minor&rsquo;s use of the Platform.
      </p>
      <p>
        We do not knowingly collect personal data from children below the age threshold set by
        applicable law without verifiable parental consent (e.g. COPPA in the United States).
        <ReviewFlag />
      </p>
    </section>

    <section>
      <h2>3. Accounts &amp; Roles</h2>
      <p>The Platform supports distinct roles, each with different capabilities:</p>
      <ul>
        <li><strong>Eagle (Mentor):</strong> creates and manages programs, reviews enrollments, awards points, and uploads content.</li>
        <li><strong>Eaglet (Mentee):</strong> enrolls in programs, completes activities, and earns points, levels, and certificates.</li>
        <li><strong>Admin:</strong> administers the Platform, approves mentors, and configures settings.</li>
      </ul>
      <p>
        You are responsible for safeguarding your credentials and for all activity under your
        account. Notify us immediately of any unauthorized use.
      </p>
    </section>

    <section>
      <h2>4. Mentor Verification (KYC)</h2>
      <p>
        Eagles must complete identity verification (&ldquo;KYC&rdquo;), which may include a
        background-check consent and acceptance of the
        {' '}<Link to="/mentor-code-of-conduct">Mentor Code of Conduct</Link>, before mentoring. We may suspend
        or decline mentor access where verification is incomplete, inaccurate, or fails review.
        Verification data is handled as described in the <Link to="/privacy">Privacy Policy</Link>.
        <ReviewFlag />
      </p>
    </section>

    <section>
      <h2>5. Acceptable Use &amp; Conduct</h2>
      <p>You agree not to:</p>
      <ul>
        <li>harass, abuse, exploit, or endanger any user, especially minors;</li>
        <li>post unlawful, infringing, deceptive, or harmful content;</li>
        <li>attempt to breach Platform security, scrape data, or disrupt service;</li>
        <li>misrepresent your identity, role, or qualifications.</li>
      </ul>
      <p>
        Mentors are additionally bound by the <Link to="/mentor-code-of-conduct">Mentor Code of Conduct</Link>.
        We may remove content and suspend or terminate accounts that violate these Terms.
      </p>
    </section>

    <section>
      <h2>6. Points, Levels &amp; Certificates</h2>
      <p>
        The Platform awards points and levels, and may issue certificates, to reflect activity and
        progression. Points, levels, and certificates have no monetary value, are non-transferable,
        and may be adjusted or revoked in cases of error, abuse, or violation of these Terms.
        Certificates attest to participation as recorded by the Platform and are not accredited
        qualifications unless expressly stated.
      </p>
    </section>

    <section>
      <h2>7. Purchases &amp; Payments</h2>
      <p>
        Purchases in the storefront are processed by our third-party payment provider (Paystack).
        You authorize us and the provider to charge your selected payment method for the order
        total. Prices and availability may change. We do not store full card details. Refunds,
        where offered, are handled per our refund practices.<ReviewFlag />
      </p>
    </section>

    <section>
      <h2>8. Donations</h2>
      <p>
        Donations made through the Platform are voluntary and, unless expressly stated, are
        non-refundable. Tax treatment of donations depends on your jurisdiction and the
        Company&rsquo;s status.<ReviewFlag />
      </p>
    </section>

    <section>
      <h2>9. User Content &amp; Intellectual Property</h2>
      <p>
        You retain ownership of content you submit. You grant us a non-exclusive, worldwide,
        royalty-free license to host, display, and distribute that content as needed to operate
        the Platform. All Platform software, branding, and original content remain the property of
        the Company or its licensors.
      </p>
    </section>

    <section>
      <h2>10. Termination &amp; Account Deletion</h2>
      <p>
        You may request deletion of your account at any time. We may suspend or terminate access
        for breach of these Terms or to protect users or the Platform. Certain records may be
        retained as required by law or for legitimate business purposes, as described in the
        <Link to="/privacy"> Privacy Policy</Link>.
      </p>
    </section>

    <section>
      <h2>11. Disclaimers &amp; Limitation of Liability</h2>
      <p>
        The Platform is provided &ldquo;as is&rdquo; without warranties of any kind. We do not
        guarantee specific mentorship outcomes. To the maximum extent permitted by law, the Company
        is not liable for indirect, incidental, or consequential damages arising from your use of
        the Platform.<ReviewFlag />
      </p>
    </section>

    <section>
      <h2>12. Data Protection</h2>
      <p>
        Our handling of personal data is governed by the <Link to="/privacy">Privacy Policy</Link>.
        Depending on your location, you may have rights under Ghana&rsquo;s Data Protection Act,
        2012 (Act 843), the EU General Data Protection Regulation (GDPR), or the California Consumer
        Privacy Act (CCPA), among others.<ReviewFlag />
      </p>
    </section>

    <section>
      <h2>13. Governing Law &amp; Disputes</h2>
      <p>
        These Terms are intended to be governed by the laws of the Republic of Ghana, without
        regard to conflict-of-law rules, and disputes are intended to be resolved in the competent
        courts of Ghana. Cross-border users may have additional non-waivable rights under local
        law.<ReviewFlag />
      </p>
    </section>

    <section>
      <h2>14. Changes to These Terms</h2>
      <p>
        We may update these Terms from time to time. Material changes will be indicated by updating
        the version and &ldquo;last updated&rdquo; date above, and where appropriate, by notice
        through the Platform. Continued use after changes take effect constitutes acceptance.
      </p>
    </section>

    <section>
      <h2>15. Contact</h2>
      <p>
        Questions about these Terms can be directed to the Company at the contact details published
        on the Platform.<ReviewFlag />
      </p>
    </section>
  </LegalPageLayout>
);

export default TermsPage;
