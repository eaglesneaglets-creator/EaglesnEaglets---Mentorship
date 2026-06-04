import { Link } from 'react-router-dom';
import LegalPageLayout from '@shared/components/legal/LegalPageLayout';
import ReviewFlag from '@shared/components/legal/ReviewFlag';
import { LEGAL_DOCUMENT_VERSION, LEGAL_LAST_UPDATED } from '@shared/components/legal/legalDocumentMeta';

/**
 * PrivacyPage — first-draft Privacy Policy for Eagles & Eaglets, rendered through
 * the shared LegalPageLayout (same chrome as Terms). Content authored as JSX (no
 * markdown dependency). Jurisdiction-specific clauses carry a review marker.
 */
const PrivacyPage = () => (
  <LegalPageLayout title="Privacy Policy" version={LEGAL_DOCUMENT_VERSION} lastUpdated={LEGAL_LAST_UPDATED}>
    <section>
      <h2>1. Introduction &amp; Scope</h2>
      <p>
        This Privacy Policy explains how Eagles &amp; Eaglets (&ldquo;we&rdquo;, &ldquo;us&rdquo;,
        the &ldquo;Company&rdquo; — legal entity name and registered address to be confirmed
        <ReviewFlag />) collects, uses, shares, and protects personal data when you use the
        Eagles &amp; Eaglets mentorship platform (the &ldquo;Platform&rdquo;). It should be read
        alongside our <Link to="/terms">Terms of Service</Link>.
      </p>
    </section>

    <section>
      <h2>2. Data We Collect</h2>
      <ul>
        <li><strong>Account &amp; profile data:</strong> name, email, phone number, role (Eagle/Eaglet/Admin), and profile details you provide.</li>
        <li><strong>Mentor verification (KYC):</strong> identity documents, background-check consent, and related verification data submitted by Eagles.</li>
        <li><strong>Payment data:</strong> processed by our payment provider (Paystack); we do not store full card details.</li>
        <li><strong>Uploaded media:</strong> images and files stored via our media provider (Cloudinary).</li>
        <li><strong>Communications:</strong> chat messages and support correspondence.</li>
        <li><strong>Activity data:</strong> points, levels, enrollments, and progress.</li>
        <li><strong>Device &amp; usage data:</strong> log data, approximate location from IP, and cookies / similar technologies.</li>
      </ul>
    </section>

    <section>
      <h2>3. How We Use Your Data</h2>
      <ul>
        <li>operate and maintain the Platform and your account;</li>
        <li>verify mentors and protect the safety of mentees;</li>
        <li>process store purchases and donations;</li>
        <li>send transactional and (where permitted) notification emails/SMS;</li>
        <li>detect, prevent, and respond to abuse, fraud, and security incidents;</li>
        <li>comply with legal obligations.</li>
      </ul>
    </section>

    <section>
      <h2>4. Legal Bases for Processing</h2>
      <p>
        Where the GDPR applies, we rely on one or more of: your consent; performance of a contract;
        our legitimate interests (e.g. platform safety and improvement); and compliance with legal
        obligations. You may withdraw consent where processing is consent-based.<ReviewFlag />
      </p>
    </section>

    <section>
      <h2>5. Cookies &amp; Similar Technologies</h2>
      <p>
        We use essential cookies required to run the Platform (e.g. authentication/session). Where
        we use any optional/analytics cookies in future, we will request consent and update this
        policy accordingly. You can control cookies through your browser settings.<ReviewFlag />
      </p>
    </section>

    <section>
      <h2>6. Third-Party Processors</h2>
      <p>We share data with service providers who process it on our behalf, including:</p>
      <ul>
        <li><strong>Paystack</strong> — payment processing;</li>
        <li><strong>Cloudinary</strong> — media storage and delivery;</li>
        <li><strong>Email / SMS providers</strong> — notifications and verification.</li>
      </ul>
      <p>These providers are bound to use the data only as needed to provide their services.<ReviewFlag /></p>
    </section>

    <section>
      <h2>7. Data Sharing &amp; Disclosure</h2>
      <p>
        We do not sell your personal data. We may disclose data to comply with law, enforce our
        <Link to="/terms"> Terms</Link>, protect rights and safety, or in connection with a
        corporate transaction, subject to appropriate safeguards.
      </p>
    </section>

    <section>
      <h2>8. International Transfers</h2>
      <p>
        Your data may be processed in countries other than your own. Where required, we will put in
        place appropriate safeguards for cross-border transfers.<ReviewFlag />
      </p>
    </section>

    <section>
      <h2>9. Data Retention</h2>
      <p>
        We retain personal data for as long as your account is active and as needed to provide the
        Platform, then for any period required by law or for legitimate business purposes (e.g.
        financial records, dispute resolution).<ReviewFlag />
      </p>
    </section>

    <section>
      <h2>10. Security</h2>
      <p>
        We use technical and organizational measures to protect personal data, including encrypted
        transport and access controls. No method of transmission or storage is completely secure.
      </p>
    </section>

    <section>
      <h2>11. Your Rights</h2>
      <p>
        Depending on your location, you may have rights to access, correct, delete, port, or
        restrict/object to processing of your personal data, and to lodge a complaint with a
        supervisory authority:
      </p>
      <ul>
        <li><strong>EU/UK (GDPR):</strong> access, rectification, erasure, portability, restriction, objection.<ReviewFlag /></li>
        <li><strong>California (CCPA):</strong> right to know, delete, and opt out of &ldquo;sale&rdquo;/&ldquo;sharing&rdquo; (we do not sell).<ReviewFlag /></li>
        <li><strong>Ghana (Data Protection Act, 2012 / Act 843):</strong> rights of access and correction, and to object to processing.<ReviewFlag /></li>
      </ul>
      <p>You can exercise these rights using the contact details below, and via account settings where available.</p>
    </section>

    <section>
      <h2>12. Children&rsquo;s Privacy</h2>
      <p>
        Where an Eaglet is a minor, a parent or legal guardian must consent to the processing of the
        minor&rsquo;s data. We do not knowingly collect data from children below the applicable age
        threshold without verifiable parental consent (e.g. COPPA in the United States).<ReviewFlag />
      </p>
    </section>

    <section>
      <h2>13. Changes to This Policy</h2>
      <p>
        We may update this Policy from time to time. Material changes will be reflected by updating
        the version and &ldquo;last updated&rdquo; date above and, where appropriate, by notice
        through the Platform.
      </p>
    </section>

    <section>
      <h2>14. Contact &amp; Data Protection Officer</h2>
      <p>
        For privacy questions or to exercise your rights, contact us at the details published on the
        Platform. A Data Protection Officer / privacy contact will be designated where required.
        <ReviewFlag />
      </p>
    </section>
  </LegalPageLayout>
);

export default PrivacyPage;
