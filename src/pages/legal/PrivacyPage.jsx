import { Link } from 'react-router-dom';
import LegalPageLayout from '@shared/components/legal/LegalPageLayout';

/**
 * PrivacyPage — finalized Eagles & Eaglets Privacy Policy.
 *
 * Content is the counsel-reviewed final version (v26061.0, last updated
 * 11 June 2026). The shared LegalPageLayout's "first draft" banner is
 * suppressed via draft={false} since this document is no longer a draft.
 *
 * Page-local version constants override the shared legalDocumentMeta so
 * that Terms / Code of Conduct (still drafts) keep their own version line.
 */
const PRIVACY_VERSION = '26061.0';
const PRIVACY_LAST_UPDATED = '11 June 2026';

const PrivacyPage = () => (
  <LegalPageLayout
    title="Privacy Policy"
    version={PRIVACY_VERSION}
    lastUpdated={PRIVACY_LAST_UPDATED}
    draft={false}
  >
    <section>
      <h2>1. Introduction &amp; Scope</h2>
      <p>
        This Privacy Policy explains how Eagles &amp; Eaglets (&ldquo;we&rdquo;, &ldquo;us&rdquo;,
        or &ldquo;our&rdquo;) collects, uses, shares, and protects personal data when you use the
        Eagles &amp; Eaglets mentorship platform (the &ldquo;Platform&rdquo;), available at
        {' '}<a href="https://www.eaglesandeaglets.com">www.eaglesandeaglets.com</a>.
      </p>
      <p>
        This Policy applies to all users of the Platform, including Eagles (mentors), Eaglets
        (mentees), and administrators, regardless of whether you access the Platform from Ghana
        or any other country. It should be read alongside our
        {' '}<Link to="/terms">Terms of Service</Link>.
      </p>
      <p>
        Eagles &amp; Eaglets is registered in Ghana and is the data controller responsible for
        your personal data. Our contact details are set out in Section 14 of this Policy.
      </p>
    </section>

    <section>
      <h2>2. Data We Collect</h2>
      <p>We collect the following categories of personal data:</p>

      <h3>2.1 Account &amp; Profile Data</h3>
      <ul>
        <li>Name, email address, and phone number.</li>
        <li>Your role on the Platform (Eagle / Eaglet / Administrator).</li>
        <li>Profile details, biography, and interests you choose to provide.</li>
      </ul>

      <h3>2.2 Mentor Verification (KYC) Data</h3>
      <p>
        To verify the identity of Eagles (mentors), we collect identity documents such as
        national identity cards, passports, or driving licences, and proof of address. This data
        is processed internally by our team.
      </p>

      <h3>2.3 Payment Data</h3>
      <p>
        Payment transactions are processed by our payment provider, Paystack. We do not store
        full card details on our systems. We retain transaction IDs, amounts, and dates for
        financial and legal compliance purposes.
      </p>

      <h3>2.4 Uploaded Media</h3>
      <p>
        Images and files you upload to the Platform are stored via our media provider,
        Cloudinary.
      </p>

      <h3>2.5 Communications</h3>
      <ul>
        <li>
          Chat messages exchanged between Eagles and Eaglets on the Platform. These are stored
          indefinitely. Administrators can access message content, and will only do so for the
          purposes of safety moderation and dispute resolution.
        </li>
        <li>Support correspondence and enquiries submitted to us.</li>
      </ul>

      <h3>2.6 Activity Data</h3>
      <p>Points, levels, enrolments, learning progress, and achievements earned on the Platform.</p>

      <h3>2.7 Device &amp; Usage Data</h3>
      <ul>
        <li>
          Log data including IP address, browser type, operating system, referring URLs, and
          pages visited.
        </li>
        <li>
          Approximate location inferred from IP address. We do not collect precise GPS location.
        </li>
        <li>Cookies and similar technologies — see Section 5 for details.</li>
      </ul>
    </section>

    <section>
      <h2>3. How We Use Your Data</h2>
      <p>We use the personal data we collect for the following purposes:</p>
      <table>
        <thead>
          <tr>
            <th>Purpose</th>
            <th>Data Used</th>
            <th>Legal Basis (see §4)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Create and manage your account</td>
            <td>Account &amp; profile data</td>
            <td>Contract</td>
          </tr>
          <tr>
            <td>Verify mentors and protect the safety of all users</td>
            <td>KYC data, activity data</td>
            <td>Legitimate interests; Legal obligation</td>
          </tr>
          <tr>
            <td>Facilitate mentoring relationships and matching</td>
            <td>Profile data, activity data</td>
            <td>Contract; Legitimate interests</td>
          </tr>
          <tr>
            <td>Process store purchases and donations</td>
            <td>Payment data</td>
            <td>Contract</td>
          </tr>
          <tr>
            <td>Send transactional emails / SMS (e.g. verification, notifications)</td>
            <td>Account data</td>
            <td>Contract; Consent</td>
          </tr>
          <tr>
            <td>Store and deliver uploaded media</td>
            <td>Uploaded media</td>
            <td>Contract</td>
          </tr>
          <tr>
            <td>Detect, prevent, and respond to abuse, fraud, and security incidents</td>
            <td>All data types</td>
            <td>Legitimate interests; Legal obligation</td>
          </tr>
          <tr>
            <td>Improve and develop the Platform (analytics)</td>
            <td>—</td>
            <td>Legitimate interests</td>
          </tr>
          <tr>
            <td>Comply with legal obligations</td>
            <td>As required by law</td>
            <td>Legal obligation</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section>
      <h2>4. Legal Bases for Processing</h2>

      <h3>4.1 Ghana (Data Protection Act, 2012 — Act 843)</h3>
      <p>
        We process personal data in accordance with Act 843. Our processing is based on one or
        more of the following:
      </p>
      <ul>
        <li>Your consent, which may be withdrawn at any time.</li>
        <li>Performance of a contract with you (e.g. providing Platform services).</li>
        <li>Compliance with a legal obligation.</li>
        <li>
          Our legitimate interests, provided they are not overridden by your rights and freedoms.
        </li>
      </ul>

      <h3>4.2 European Union / United Kingdom (GDPR / UK GDPR)</h3>
      <p>
        Where the GDPR or UK GDPR applies to users in the EU or UK, we rely on one or more of
        the following legal bases, as described in the table in Section 3:
      </p>
      <ul>
        <li><strong>Article 6(1)(a) — Consent:</strong> e.g. optional marketing communications.</li>
        <li>
          <strong>Article 6(1)(b) — Performance of a contract:</strong> e.g. providing the
          mentoring service.
        </li>
        <li>
          <strong>Article 6(1)(c) — Legal obligation:</strong> responding to law enforcement.
        </li>
        <li>
          <strong>Article 6(1)(f) — Legitimate interests:</strong> our legitimate interests
          include platform safety, fraud prevention, product improvement, and mentorship quality.
          Where we rely on this basis, we have carried out a Legitimate Interests Assessment
          (LIA). You may request a copy by contacting us at{' '}
          <a href="mailto:info.eaglesandeaglets@gmail.com">info.eaglesandeaglets@gmail.com</a>.
        </li>
      </ul>
      <p>
        Where processing is based on consent, you may withdraw your consent at any time using
        the contact details in Section 14 or via your account settings. Withdrawal does not
        affect the lawfulness of processing carried out before withdrawal.
      </p>
    </section>

    <section>
      <h2>5. Cookies &amp; Similar Technologies</h2>
      <p>
        We currently use only essential cookies necessary to operate the Platform, including
        authentication and session management cookies. These cookies cannot be disabled without
        affecting Platform functionality.
      </p>
      <p>
        Where we introduce optional or analytics cookies in the future (e.g. Google Analytics,
        Meta Pixel, Hotjar), we will request your consent via a cookie notice and update this
        Policy accordingly.
      </p>
      <p>
        You can control and manage cookies through your browser settings. Note that disabling
        essential cookies will affect your ability to use the Platform.
      </p>
    </section>

    <section>
      <h2>6. Third-Party Processors</h2>
      <p>
        We share personal data with the following service providers who process it on our
        behalf. These providers are contractually bound to use the data only as directed by us
        and for no other purpose.
      </p>
      <table>
        <thead>
          <tr>
            <th>Provider</th>
            <th>Purpose</th>
            <th>Country(ies) of Processing</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Paystack</td>
            <td>Payment processing</td>
            <td>Nigeria / International</td>
          </tr>
          <tr>
            <td>Cloudinary</td>
            <td>Media storage and delivery</td>
            <td>USA / International</td>
          </tr>
          <tr>
            <td>Mailchimp, SendGrid, Twilio</td>
            <td>Transactional emails and SMS notifications</td>
            <td>USA / International</td>
          </tr>
          <tr>
            <td>Railway, AWS, Vercel, Render, Google Cloud</td>
            <td>Platform hosting and infrastructure</td>
            <td>USA / International</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section>
      <h2>7. Data Sharing &amp; Disclosure</h2>
      <p>We do not sell your personal data to third parties.</p>
      <p>
        Beyond the service providers listed in Section 6, we may disclose your personal data in
        the following limited circumstances:
      </p>
      <ul>
        <li>
          <strong>Law enforcement and legal obligations:</strong> where required to comply with
          applicable law, court order, or lawful governmental request.
        </li>
        <li>
          <strong>Protection of rights and safety:</strong> where necessary to enforce our
          {' '}<Link to="/terms">Terms of Service</Link>, protect our rights or property, or
          protect the safety of our users or the public.
        </li>
        <li>
          <strong>Business transfers:</strong> in connection with a merger, acquisition,
          restructuring, or sale of all or part of our business or assets, your data may be
          transferred to the relevant third party. In such an event, we will notify affected
          users via the Platform or by email at least 30 days in advance, and any transferee
          will be required to honour this Policy or provide equivalent protections.
        </li>
      </ul>
    </section>

    <section>
      <h2>8. International Transfers</h2>
      <p>
        Eagles &amp; Eaglets is based in Ghana. As our service providers (including Paystack,
        Cloudinary, and others listed in Section 6) operate internationally, your personal data
        may be transferred to and processed in countries other than Ghana or your country of
        residence, including countries that may not have data protection laws equivalent to
        those in your country.
      </p>
      <p>Where such transfers occur, we ensure that appropriate safeguards are in place, including:</p>
      <ul>
        <li>
          Entering into data processing agreements with our service providers incorporating
          standard contractual clauses (SCCs) or equivalent protections; and/or
        </li>
        <li>Relying on applicable adequacy decisions where recognised by Ghanaian or EU law.</li>
      </ul>
      <p>
        A list of the countries in which our processors operate is available on request. Please
        contact us at{' '}
        <a href="mailto:info.eaglesandeaglets@gmail.com">info.eaglesandeaglets@gmail.com</a>.
      </p>
    </section>

    <section>
      <h2>9. Data Retention</h2>
      <p>
        We retain personal data for as long as your account is active and for as long as needed
        to provide the Platform services. When you close your account or your account is
        terminated, we will delete or anonymise your personal data subject to the retention
        periods set out below.
      </p>
      <table>
        <thead>
          <tr>
            <th>Data Category</th>
            <th>Retention Period</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Account &amp; profile data</td>
            <td>Duration of account + 6 years after account closure</td>
          </tr>
          <tr>
            <td>KYC / identity documents</td>
            <td>6 years</td>
          </tr>
          <tr>
            <td>Payment / transaction records</td>
            <td>6 years for financial / tax records under Ghanaian law</td>
          </tr>
          <tr>
            <td>Chat messages</td>
            <td>6 years after the end of the mentoring relationship, then deleted or anonymised</td>
          </tr>
          <tr>
            <td>Log / device data</td>
            <td>6 months</td>
          </tr>
          <tr>
            <td>Support correspondence</td>
            <td>6 years after resolution of the relevant enquiry</td>
          </tr>
        </tbody>
      </table>
      <p>
        Where specific retention periods are required by applicable law (e.g. financial records,
        tax obligations), we will comply with those periods even if they exceed the periods
        above. You may request information about our retention practices using the contact
        details in Section 14.
      </p>
    </section>

    <section>
      <h2>10. Security</h2>
      <p>
        We implement appropriate technical and organisational measures to protect your personal
        data against unauthorised access, disclosure, alteration, or destruction. These measures
        include:
      </p>
      <ul>
        <li>Encrypted data transmission using TLS / HTTPS.</li>
        <li>Access controls limiting data access to authorised personnel only.</li>
      </ul>
      <p>
        No method of transmission over the internet or method of electronic storage is
        completely secure. While we strive to use commercially acceptable means to protect your
        personal data, we cannot guarantee its absolute security.
      </p>
      <p>
        In the event of a personal data breach that is likely to result in a risk to your rights
        and freedoms, we will notify you and relevant supervisory authorities as required by
        applicable law (including the 72-hour notification requirement under GDPR and
        notification obligations under Act 843).
      </p>
    </section>

    <section>
      <h2>11. Your Rights</h2>
      <p>
        Depending on your location, you have the following rights in relation to your personal
        data. To exercise any of these rights, please contact us using the details in Section 14
        or, where available, via your account settings.
      </p>

      <h3>11.1 Rights Under Ghana Data Protection Act, 2012 (Act 843)</h3>
      <ul>
        <li>The right to be informed whether we hold personal data about you.</li>
        <li>The right to access your personal data held by us.</li>
        <li>The right to correct inaccurate or incomplete personal data.</li>
        <li>The right to object to the processing of your personal data.</li>
        <li>The right to withdraw consent where processing is consent-based.</li>
        <li>
          The right to lodge a complaint with the{' '}
          <strong>Data Protection Commission of Ghana (DPC)</strong>:{' '}
          <a href="https://www.dataprotection.org.gh" target="_blank" rel="noopener noreferrer">www.dataprotection.org.gh</a>.
        </li>
      </ul>

      <h3>11.2 Rights Under GDPR / UK GDPR (EU &amp; UK Users)</h3>
      <ul>
        <li><strong>Right of access</strong> (Article 15) — to obtain a copy of your personal data.</li>
        <li><strong>Right to rectification</strong> (Article 16) — to correct inaccurate data.</li>
        <li>
          <strong>Right to erasure</strong> (Article 17) — to request deletion of your data in
          certain circumstances.
        </li>
        <li><strong>Right to restriction of processing</strong> (Article 18).</li>
        <li>
          <strong>Right to data portability</strong> (Article 20) — to receive your data in a
          structured, machine-readable format.
        </li>
        <li>
          <strong>Right to object</strong> (Article 21) — to object to processing based on
          legitimate interests.
        </li>
        <li>
          <strong>Right to withdraw consent</strong> at any time (where processing is based on
          consent).
        </li>
        <li>
          Right to lodge a complaint with your national data protection supervisory authority
          (e.g. the ICO in the UK:{' '}
          <a href="https://www.ico.org.uk" target="_blank" rel="noopener noreferrer">www.ico.org.uk</a>,
          or your local EU supervisory authority).
        </li>
      </ul>
    </section>

    <section>
      <h2>12. Children&apos;s Privacy</h2>
      <p>
        The Platform may be used by minors (persons under the age of 18, or the applicable age
        of majority in their jurisdiction) in their capacity as Eaglets (mentees). We take the
        protection of children&apos;s data very seriously.
      </p>

      <h3>12.1 Parental / Guardian Consent</h3>
      <p>
        Where an Eaglet is a minor, we require verifiable consent from a parent or legal
        guardian prior to account creation and the processing of the minor&apos;s personal
        data. We obtain this consent through mechanisms such as email confirmation sent to the
        parent&apos;s verified email address; signed consent form submitted at registration;
        guardian approval via a separate guardian account; or another specific process.
      </p>

      <h3>12.2 Discovery of Underage Registration Without Consent</h3>
      <p>
        If we become aware that a minor has registered on the Platform or that their personal
        data has been collected without proper parental or guardian consent, we will promptly:
        (a) suspend access to the relevant account; (b) contact the user and/or their parent or
        guardian to obtain consent or delete the data; and (c) delete the minor&apos;s personal
        data where consent cannot be obtained within 7 days.
      </p>

      <h3>12.3 Parental / Guardian Rights</h3>
      <p>
        Parents or guardians may review, correct, or request the deletion of their child&apos;s
        personal data at any time by contacting us at{' '}
        <a href="mailto:info.eaglesandeaglets@gmail.com">info.eaglesandeaglets@gmail.com</a>.
        We will respond within 14 business days.
      </p>
    </section>

    <section>
      <h2>13. Changes to This Policy</h2>
      <p>
        We may update this Policy from time to time to reflect changes in our practices,
        technology, or applicable law. Material changes will be indicated by updating the
        version number and &ldquo;Last Updated&rdquo; date at the top of this Policy. Where
        changes are material, we will provide at least 14 days&apos; notice before the changes
        take effect, by posting a notice on the Platform and/or sending you an email to the
        address registered to your account.
      </p>
      <p>
        Your continued use of the Platform after the effective date of any changes constitutes
        acceptance of the updated Policy. If you do not agree with a material change, you may
        close your account before the changes take effect.
      </p>
    </section>

    <section>
      <h2>14. Contact Us</h2>
      <p>Eagles &amp; Eaglets is the data controller responsible for your personal data.</p>
      <p>
        If you have any questions, concerns, or requests regarding this Privacy Policy or the
        processing of your personal data, please contact us:
      </p>
      <table>
        <tbody>
          <tr>
            <th>Data Controller</th>
            <td>Eagles &amp; Eaglets</td>
          </tr>
          <tr>
            <th>Registered Address</th>
            <td>AC 16, Sraha Community 8, Tema</td>
          </tr>
          <tr>
            <th>Privacy Email</th>
            <td>
              <a href="mailto:info.eaglesandeaglets@gmail.com">info.eaglesandeaglets@gmail.com</a>
            </td>
          </tr>
          <tr>
            <th>Website</th>
            <td>
              <a href="https://www.eaglesandeaglets.com" target="_blank" rel="noopener noreferrer">www.eaglesandeaglets.com</a>
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        We will respond to all requests within 30 days, or within the timeframe required by
        applicable law.
      </p>
    </section>

    <p className="text-center text-sm text-text-muted">— End of Privacy Policy —</p>
  </LegalPageLayout>
);

export default PrivacyPage;
