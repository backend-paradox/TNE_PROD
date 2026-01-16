import { useEffect } from 'react';
import './TermsAndPolicyPage.css';

export default function TermsAndPolicyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="terms-page">
      <div className="terms-container">
        <h1 className="terms-main-title">Trip and Event – Privacy Policy & Terms of Service</h1>
        <p className="terms-intro">
          This page explains how we handle personal information and the terms governing use of our platform.
        </p>

        {/* Introduction */}
        <section className="terms-section">
          <h2>Introduction</h2>
          <p>
            Trip and Event (the "Company", "we", "us" or "our") is a tour and travel company incorporated in India.
            Our website <a href="https://www.tripandevent.com/" target="_blank" rel="noreferrer">https://www.tripandevent.com/</a> and
            associated mobile applications (collectively, the "Platform") allow customers to plan, book and manage travel
            services (such as flights, hotels, holiday packages and activities). This document explains (1) how we collect,
            use, share and protect your personal information (Privacy Policy) and (2) the terms and conditions that govern
            your use of our Platform and services (Terms of Service).
          </p>
          <p>
            By accessing or using our Platform, or by otherwise providing information to us in connection with a booking
            or enquiry, you acknowledge that you have read, understood and accepted this Privacy Policy and our Terms of Service.
            If you do not agree with any part of the following policies, please do not use our services.
          </p>
        </section>

        {/* Privacy Policy */}
        <section className="terms-section">
          <h2>1. Privacy Policy</h2>

          <h3>1.1 Information We Collect</h3>
          <p>
            When you use our website (<a href="https://www.tripandevent.com/" target="_blank" rel="noreferrer">https://www.tripandevent.com/</a>)
            or associated mobile applications, we may collect personal information as described below.
          </p>
          <p>
            We collect personal information to operate effectively and provide you with a great experience when using our Platform.
            Depending on how you interact with us, the information we collect may include:
          </p>
          <ul>
            <li><strong>Identity and Contact Information:</strong> name, job title, postal address, telephone number and email address.</li>
            <li><strong>Demographic and Travel Information:</strong> age, gender, date of birth, nationality, travel preferences, passport/visa details and other information relevant to customer surveys or offers.</li>
            <li><strong>Booking Details:</strong> itinerary information, travel dates, flight numbers, hotel and activity preferences, traveller names and other information required to fulfil your booking.</li>
            <li><strong>Payment and Financial Information:</strong> billing address, credit-card or debit-card details and transaction information. Card details are kept secure and encrypted in line with industry practices and RBI guidelines.</li>
            <li><strong>Technical and Usage Information:</strong> IP address, browser type, device information, pages viewed, referring/exit pages and cookies. We use cookies to analyse traffic and improve user experience.</li>
            <li><strong>Communications:</strong> records of correspondence with us (emails, chats or phone calls), marketing preferences and customer feedback.</li>
            <li><strong>Legal and Compliance Information:</strong> for international bookings we may require Permanent Account Number (PAN) details for compliance with the Reserve Bank of India's Liberalised Remittance Scheme (LRS), as required by Indian regulations.</li>
          </ul>

          <h3>1.2 How We Use Personal Information</h3>
          <p>
            This section describes how Trip and Event uses the personal information collected via <a href="https://www.tripandevent.com/" target="_blank" rel="noreferrer">https://www.tripandevent.com/</a>.
          </p>
          <p>We use the collected information for the following purposes:</p>
          <ul>
            <li><strong>Providing Services:</strong> to process bookings, manage itineraries, facilitate payments, confirm reservations and provide travel-related services.</li>
            <li><strong>Customer Service and Communications:</strong> to respond to enquiries, send booking confirmations, itineraries, payment receipts, cancellation or refund statuses and other transaction-related messages via SMS, WhatsApp, voice call or email.</li>
            <li><strong>Improving Our Services:</strong> internal record keeping, analysing traffic logs and usage patterns, customizing our Platform to your interests and enhancing our products and services.</li>
            <li><strong>Marketing and Promotional Activities:</strong> with your consent, we may send promotional emails, newsletters or messages about new products, special offers or other information which we think you may find interesting.</li>
            <li><strong>Security and Fraud Prevention:</strong> to verify identities, detect and prevent fraud, enforce our Terms of Service, protect our rights and comply with applicable laws.</li>
            <li><strong>Legal Compliance:</strong> to meet legal obligations, including responding to regulatory requests, complying with tax laws and the LRS requirements for international remittances.</li>
          </ul>

          <h3>1.3 Cookies and Tracking Technologies</h3>
          <p>
            When you visit <a href="https://www.tripandevent.com/" target="_blank" rel="noreferrer">https://www.tripandevent.com/</a>,
            our site may store cookies on your device. A cookie is a small file that is placed on your computer or mobile device
            when you visit our Platform. We use traffic-log cookies to identify which pages are being used.
          </p>

          <h3>1.4 Sharing of Personal Information</h3>
          <p>
            Trip and Event shares information collected via <a href="https://www.tripandevent.com/" target="_blank" rel="noreferrer">https://www.tripandevent.com/</a> as described below.
          </p>
          <p>
            We do not sell or rent your personal information to third parties for their marketing purposes without your explicit consent.
            However, we may share your information in the following circumstances:
          </p>
          <ul>
            <li><strong>Service Providers:</strong> with airlines, hotels, activity operators, insurance companies and other travel suppliers to fulfil your bookings.</li>
            <li><strong>Payment Processors and Banks:</strong> to process payments, refunds and fraud checks.</li>
            <li><strong>Third-Party Partners:</strong> with marketing and analytics partners in anonymised or aggregated form for improving services.</li>
            <li><strong>Legal and Regulatory Authorities:</strong> when required by law or to protect our rights, customers or others.</li>
            <li><strong>Business Transfers:</strong> in the event of a merger, acquisition or sale of assets, your data may be transferred as part of that transaction, subject to confidentiality agreements.</li>
          </ul>

          <h3>1.5 Your Choices and Rights</h3>
          <p>Your rights below apply to the personal data collected through our Platform and mobile applications.</p>
          <ul>
            <li><strong>Access and Correction:</strong> you may request access to the personal data we hold about you and ask us to correct or update inaccurate information.</li>
            <li><strong>Opt-out of Marketing:</strong> you can unsubscribe from marketing emails or messages at any time by using the opt-out links or by contacting us.</li>
            <li><strong>Withdraw Consent:</strong> if you previously consented to direct marketing, you may change your mind at any time by writing to us at <a href="mailto:hello@tripandevent.com">hello@tripandevent.com</a>.</li>
            <li><strong>Deactivate Account:</strong> you can request deletion of your account and personal information, subject to our legal and operational requirements.</li>
            <li><strong>Cookie Preferences:</strong> you can modify browser settings to control cookies.</li>
          </ul>

          <h3>1.6 Security Practices</h3>
          <p>
            We are committed to ensuring that your information is secure. We implement appropriate technical and organisational measures,
            including encryption, access controls and regular security reviews, to prevent unauthorised access or disclosure. However,
            we cannot guarantee that there will never be any security breach; any information downloaded or obtained from our website
            is at your own risk. You are responsible for keeping your password and account information confidential.
          </p>

          <h3>1.7 Retention of Information</h3>
          <p>
            We retain personal data only as long as necessary for the purposes for which it was collected, to comply with legal obligations,
            resolve disputes and enforce our agreements. When data is no longer required, we will securely delete or anonymise it.
          </p>

          <h3>1.8 Changes to This Privacy Policy</h3>
          <p>
            We may update this Privacy Policy from time to time to reflect changes in our practices, legal requirements or other factors.
            Any changes will be posted on our website with a revised "last updated" date.
          </p>

          <h3>1.9 Contact Us</h3>
          <p>If you have questions about this Privacy Policy or wish to exercise your rights, please contact:</p>
          <div className="contact-box">
            <p><strong>Trip and Event – Data Protection Officer</strong></p>
            <p>Email: <a href="mailto:hello@tripandevent.com">hello@tripandevent.com</a></p>
            <p>Address: Trip and Event, Kolkata, West Bengal, India</p>
            <p>Phone: +91-9007000777</p>
          </div>
        </section>

        {/* Terms of Service */}
        <section className="terms-section">
          <h2>2. Terms of Service (User Agreement)</h2>

          <h3>2.1 Applicability and Acceptance</h3>
          <p>
            By accessing <a href="https://www.tripandevent.com/" target="_blank" rel="noreferrer">https://www.tripandevent.com/</a> or using our services, you accept these terms.
          </p>
          <ul>
            <li><strong>Scope of the Agreement:</strong> This User Agreement along with the Terms of Service (collectively, the "Agreement") forms the terms and conditions for the use of services and products of Trip and Event. It applies to all transactions made through our website, mobile applications, call centres, branch offices, sales agents and other channels.</li>
            <li><strong>Parties:</strong> References to "you", "your", "User" or "Traveller" mean the person who enquiries about or purchases products or services via our Platform. "Trip and Event" refers to the Company. Both you and Trip and Event are individually referred to as "party" and collectively as the "parties".</li>
            <li><strong>Eligibility:</strong> You must be at least 18 years old and possess legal capacity to enter into contracts to use our Platform. Minors may use the Platform only through a parent or legal guardian. Trip and Event reserves the right to terminate any account if it is discovered that a user is underage or lacks capacity.</li>
            <li><strong>Acceptance:</strong> By using our Platform or services, you are deemed to have read, understood and expressly accepted this Agreement. If you do not agree with any part of the Agreement, you must not use our services.</li>
            <li><strong>Additional Terms:</strong> Some services (e.g., flights, hotels, holiday packages) are subject to additional terms and conditions specific to that service. In the event of a conflict between such service-specific terms and this Agreement, the service-specific terms will prevail.</li>
          </ul>

          <h3>2.2 Role of Trip and Event</h3>
          <p>The following section describes how Trip and Event operates when you book services on our Platform.</p>
          <ul>
            <li><strong>Facilitator:</strong> Unless explicitly stated otherwise, Trip and Event acts as a facilitator connecting Users with service providers such as airlines, hotels, transport operators and activity providers. The contract of service is ultimately between the User and the service provider, and our liability is limited to providing you with a confirmed booking.</li>
            <li><strong>Limited Liability:</strong> We do not control or guarantee the actions or omissions of service providers. We are not liable for delays, cancellations, overbooking, strikes, acts of God or other circumstances beyond our control (collectively, Force Majeure). In such events our liability is limited to offering a refund or alternative booking.</li>
            <li><strong>Independent Travel Agents:</strong> Travel agents, tour operators or aggregators must register with Trip and Event and obtain explicit permission before using our Platform for commercial purposes. Bookings made by unregistered agents may be cancelled, and the agent bears any resulting liability.</li>
          </ul>

          <h3>2.3 User Responsibilities</h3>
          <p>Your responsibilities apply when using our Platform.</p>
          <ul>
            <li><strong>Accurate Information:</strong> You must provide true, accurate, current and complete information while registering or making bookings. You agree to verify all booking details (names, travel dates, destinations) and ensure that they meet your requirements.</li>
            <li><strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your account password and for all activities under your account. Notify us immediately of any unauthorised use. Trip and Event is not liable for losses resulting from unauthorised access.</li>
            <li><strong>Compliance with Laws:</strong> You agree to comply with all applicable laws, regulations and orders issued by government authorities in relation to your use of our services.</li>
            <li><strong>Travel Documents and Visa:</strong> You are responsible for obtaining valid passports, visas, transit permits and other documents required for your travel. Failure to secure a visa or travel document does not entitle you to a refund.</li>
            <li><strong>Health and Insurance:</strong> Unless explicitly included, obtaining adequate travel insurance is your responsibility. Trip and Event merely facilitates the purchase of insurance; any claims must be made directly to the insurance company.</li>
            <li><strong>Payments and Fees:</strong> You agree to pay the total booking amount and any additional convenience or service fees. We reserve the right to adjust fees, taxes or charges due to changes in tax rates or technical errors. Booking is confirmed only after full payment is received; if payment fails or is incomplete, we may cancel the booking and refund any received amount.</li>
            <li><strong>Communication Consent:</strong> You consent to receive booking confirmations, itineraries, payment receipts, cancellation notices and other transaction-related communications via SMS, email, WhatsApp or phone call. Such messages are considered transactional and are not unsolicited commercial communication.</li>
          </ul>

          <h3>2.4 Bookings, Cancellations and Refunds</h3>
          <p>This section applies to bookings made through our Platform.</p>
          <ul>
            <li><strong>Booking Process:</strong> Your booking request is an offer to purchase a product or service. We reserve the right to accept or reject your offer. Once a booking is confirmed, we will issue a booking voucher or confirmation email.</li>
            <li><strong>Cancellation by User:</strong> Cancellation policies vary by service provider and are displayed during booking. If you cancel a booking, the applicable supplier's cancellation policy will apply. In some cases, bookings may be non-refundable.</li>
            <li><strong>Cancellation by Service Provider or Force Majeure:</strong> In exceptional circumstances (e.g., natural disasters, pandemics, insolvency of airlines/hotels, operational or technical issues), the service provider may be unable to honour the booking. Trip and Event will make best efforts to provide a comparable alternative or refund the booking amount, subject to the supplier's refund policy and after deducting applicable service charges.</li>
            <li><strong>Refund Process:</strong> Refunds are processed back to the original payment method within a reasonable time after the service provider confirms the refund. We are not under any obligation to provide an alternate booking in lieu of or to compensate or replace the unconfirmed booking. Service charges, processing fees and bank charges may be non-refundable.</li>
            <li><strong>Chargebacks and Disputes:</strong> If there is any short-charging of the booking amount or fees due to technical errors, we may deduct or claim the balance amount from you. In the rare event of a chargeback or payment dispute, you must cooperate with us and your bank to resolve it.</li>
          </ul>

          <h3>2.5 Intellectual Property and Acceptable Use</h3>
          <p>The content ownership and acceptable use rules apply to our Platform and associated mobile applications.</p>
          <ul>
            <li><strong>Content Ownership:</strong> All content on our Platform (including text, graphics, logos, software and trademarks) is owned or licensed by Trip and Event. You may use the Platform only for personal, non-commercial purposes. Unauthorised use of our content or trademarks is prohibited.</li>
            <li><strong>Prohibited Activities:</strong> You must not disrupt or interfere with the operation of the Platform, modify or copy the content, or use it for commercial or public purposes. You agree not to upload or transmit any unlawful, defamatory, obscene or harmful material; if you discover any objectionable content, please report it.</li>
          </ul>

          <h3>2.6 Third-Party Websites and Advertisers</h3>
          <p>
            Our Platform may contain links to third-party websites or advertisements. We do not control such websites and are not responsible
            for their content. Accessing any third-party website is at your own risk. We do not endorse advertisers on our Platform; please
            review the terms and privacy policies of any third-party sites you visit.
          </p>

          <h3>2.7 Limitation of Liability</h3>
          <p>
            This limitation of liability applies to your use of our website and mobile applications and any services booked through them.
            To the fullest extent permitted by law, Trip and Event shall not be liable for any direct, indirect, incidental, special,
            consequential or punitive damages (including loss of profits, data or goodwill) arising out of or in connection with your use
            of the Platform or any booking. Our aggregate liability is limited to the amount paid by you for the booking in question.
            This limitation applies even if we have been advised of the possibility of such damages.
          </p>

          <h3>2.8 Indemnification</h3>
          <p>
            The following indemnity applies to your use of our Platform or any of our services. You agree to indemnify and hold harmless
            Trip and Event, its directors, officers, employees and agents from and against all losses, damages, claims and expenses
            (including legal fees) arising from:
          </p>
          <ul>
            <li>your use of the Platform in violation of this Agreement;</li>
            <li>your violation of any law or the rights of a third party;</li>
            <li>any incorrect or invalid information provided by you that results in communications issues or regulatory fines.</li>
          </ul>

          <h3>2.9 Termination and Suspension</h3>
          <p>
            Trip and Event may, at its sole discretion and without notice, suspend or terminate your access to our Platform and services
            if you breach this Agreement or engage in fraudulent, abusive or illegal activity. Upon termination, your right to use the
            Platform will immediately cease, and we may cancel any pending bookings.
          </p>

          <h3>2.10 Miscellaneous</h3>
          <ul>
            <li><strong>Governing Law and Jurisdiction:</strong> This Agreement shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or relating to this Agreement shall be subject to the exclusive jurisdiction of the courts in Kolkata, West Bengal, India.</li>
            <li><strong>Modification of Terms:</strong> We reserve the right to change the terms, conditions and notices under which our Platform is offered. Users are responsible for regularly reviewing the terms. Your continued use of the Platform after changes indicates your acceptance of the amended terms.</li>
            <li><strong>Severability:</strong> If any provision of this Agreement is determined to be invalid or unenforceable, the remaining provisions will continue in full force and effect.</li>
            <li><strong>No Partnership:</strong> Nothing in this Agreement shall be construed as creating a partnership, joint venture or employment relationship between you and Trip and Event.</li>
            <li><strong>Contact Information:</strong> For any questions about these Terms of Service, please contact us at <a href="mailto:hello@tripandevent.com">hello@tripandevent.com</a> or by mail at Trip and Event, Kolkata, West Bengal, India.</li>
          </ul>
        </section>

        <div className="terms-footer">
          <p>Last updated: December 2025</p>
        </div>
      </div>
    </div>
  );
}
