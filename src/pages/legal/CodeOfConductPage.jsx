import { Link } from 'react-router-dom';
import LegalPageLayout from '@shared/components/legal/LegalPageLayout';
import ReviewFlag from '@shared/components/legal/ReviewFlag';
import { LEGAL_DOCUMENT_VERSION, LEGAL_LAST_UPDATED } from '@shared/components/legal/legalDocumentMeta';

/**
 * CodeOfConductPage — GENERAL/community Code of Conduct for ALL users
 * (mentees + everyone). Mentors are additionally bound by the stricter
 * Mentor Code of Conduct (/mentor-code-of-conduct).
 */
const CodeOfConductPage = () => (
  <LegalPageLayout title="Community Code of Conduct" version={LEGAL_DOCUMENT_VERSION} lastUpdated={LEGAL_LAST_UPDATED}>
    <section>
      <h2>1. Purpose</h2>
      <p>
        This Community Code of Conduct sets the standards of behavior expected of everyone using the
        Eagles &amp; Eaglets platform. It works alongside our <Link to="/terms">Terms of Service</Link>
        {' '}and <Link to="/privacy">Privacy Policy</Link>. Mentors (&ldquo;Eagles&rdquo;) are
        additionally bound by the <Link to="/mentor-code-of-conduct">Mentor Code of Conduct</Link>.
      </p>
    </section>

    <section>
      <h2>2. Be Respectful</h2>
      <ul>
        <li>Treat every member with courtesy and dignity.</li>
        <li>No harassment, bullying, hate speech, or threats.</li>
        <li>No discrimination based on race, gender, religion, disability, or any protected characteristic.<ReviewFlag /></li>
      </ul>
    </section>

    <section>
      <h2>3. Be Honest</h2>
      <ul>
        <li>Represent yourself, your role, and your achievements truthfully.</li>
        <li>Do not impersonate others or misuse another member&rsquo;s account.</li>
      </ul>
    </section>

    <section>
      <h2>4. Keep the Platform Safe</h2>
      <ul>
        <li>No spam, scams, or unsolicited promotion.</li>
        <li>No unlawful, infringing, or harmful content.</li>
        <li>Do not attempt to breach security, scrape data, or disrupt the service.</li>
      </ul>
    </section>

    <section>
      <h2>5. Protect Minors</h2>
      <p>
        Where mentees are minors, all members must act in their best interest and report any concern
        about a minor&rsquo;s safety immediately. Conduct that endangers a minor results in removal and
        may be reported to authorities.<ReviewFlag />
      </p>
    </section>

    <section>
      <h2>6. Reporting Violations</h2>
      <p>
        Report violations through the platform&rsquo;s contact channels. Reports are handled
        confidentially so far as is practicable.
      </p>
    </section>

    <section>
      <h2>7. Consequences</h2>
      <p>
        Violations may result in content removal, warnings, suspension, or termination of access, at
        our discretion and consistent with the <Link to="/terms">Terms of Service</Link>.
      </p>
    </section>

    <section>
      <h2>8. Changes</h2>
      <p>
        We may update this Code from time to time; the version and date above will reflect material
        changes.
      </p>
    </section>
  </LegalPageLayout>
);

export default CodeOfConductPage;
