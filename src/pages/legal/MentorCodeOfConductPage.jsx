import { Link } from 'react-router-dom';
import LegalPageLayout from '@shared/components/legal/LegalPageLayout';
import ReviewFlag from '@shared/components/legal/ReviewFlag';
import { LEGAL_DOCUMENT_VERSION, LEGAL_LAST_UPDATED } from '@shared/components/legal/legalDocumentMeta';

export const MENTOR_CONDUCT_VERSION = LEGAL_DOCUMENT_VERSION;

/**
 * Concise plain-text snapshot of the Mentor Code of Conduct, sent to the backend
 * at KYC sign time so the agreed copy is stored immutably (independent of future
 * edits to this page). Keep in sync with the rendered sections below.
 */
export const MENTOR_CONDUCT_PLAINTEXT = [
  'Mentor Code of Conduct (v2026-05-28)',
  '1. Safeguarding & Mandatory Reporting: Mentors must prioritise mentee safety, especially minors, and report any safeguarding concern immediately.',
  '2. Professional Boundaries: No romantic, sexual, financial, or exploitative relationship with a mentee. Keep mentorship professional.',
  '3. Confidentiality: Keep mentee information private; do not disclose without consent except where required by law or safety.',
  '4. Anti-Harassment & Non-Discrimination: No harassment, abuse, or discrimination of any kind.',
  '5. Honesty about Qualifications: Represent experience and credentials truthfully.',
  '6. Approved Communication Channels: Conduct mentorship through platform-approved channels.',
  '7. Conflict of Interest: Disclose conflicts; do not exploit the mentor role for personal gain.',
  '8. Consequences: Violations may lead to suspension or removal and may be reported to authorities.',
  '9. Acknowledgment: By agreeing, the mentor accepts these obligations.',
].join('\n');

/**
 * MentorCodeOfConductPage — stricter conduct standard for Eagles (mentors).
 * This is the document mentors agree to during KYC step 4; the agreed version +
 * a plain-text snapshot are recorded immutably on the MentorKYC record.
 */
const MentorCodeOfConductPage = () => (
  <LegalPageLayout title="Mentor Code of Conduct" version={MENTOR_CONDUCT_VERSION} lastUpdated={LEGAL_LAST_UPDATED}>
    <section>
      <h2>1. Scope</h2>
      <p>
        This Mentor Code of Conduct applies to every Eagle (mentor) on the Eagles &amp; Eaglets
        platform, in addition to the general <Link to="/code-of-conduct">Community Code of Conduct</Link>,
        the <Link to="/terms">Terms of Service</Link>, and the <Link to="/privacy">Privacy Policy</Link>.
        Mentors agree to it during verification (KYC).
      </p>
    </section>

    <section>
      <h2>2. Safeguarding &amp; Mandatory Reporting</h2>
      <p>
        Mentors must prioritise the safety and wellbeing of mentees, especially minors, and report any
        safeguarding concern immediately through platform channels and, where applicable, to the
        relevant authorities.<ReviewFlag />
      </p>
    </section>

    <section>
      <h2>3. Professional Boundaries</h2>
      <ul>
        <li>No romantic, sexual, financial, or otherwise exploitative relationship with a mentee.</li>
        <li>Maintain a professional mentor–mentee relationship at all times.</li>
        <li>Do not solicit personal favors, loans, or gifts from mentees.</li>
      </ul>
    </section>

    <section>
      <h2>4. Confidentiality</h2>
      <p>
        Keep mentee information confidential. Do not disclose it without consent, except where required
        by law or to protect someone&rsquo;s safety.<ReviewFlag />
      </p>
    </section>

    <section>
      <h2>5. Anti-Harassment &amp; Non-Discrimination</h2>
      <p>
        No harassment, abuse, intimidation, or discrimination of any kind toward mentees or other members.
      </p>
    </section>

    <section>
      <h2>6. Honesty About Qualifications</h2>
      <p>
        Represent your experience, expertise, and credentials truthfully. Do not overstate
        qualifications relevant to mentorship.
      </p>
    </section>

    <section>
      <h2>7. Approved Communication Channels</h2>
      <p>
        Conduct mentorship through platform-approved channels. Moving communication off-platform may
        reduce safeguarding protections and is discouraged.
      </p>
    </section>

    <section>
      <h2>8. Conflict of Interest</h2>
      <p>
        Disclose any conflict of interest. Do not exploit the mentor role for personal, commercial, or
        political gain.
      </p>
    </section>

    <section>
      <h2>9. Consequences</h2>
      <p>
        Breaches may result in suspension or permanent removal of mentor status, and may be reported to
        authorities where a law may have been broken.<ReviewFlag />
      </p>
    </section>

    <section>
      <h2>10. Acknowledgment</h2>
      <p>
        By agreeing during verification, you accept these obligations. The version you agreed to and a
        snapshot of this document are recorded with your verification record.
      </p>
    </section>
  </LegalPageLayout>
);

export default MentorCodeOfConductPage;
