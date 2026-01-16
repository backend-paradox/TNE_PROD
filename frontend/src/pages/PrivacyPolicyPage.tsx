import { useEffect } from 'react';
import { Shield, Mail, Phone, MapPin, Database, Lock, Eye, Users, FileText, Scale, AlertCircle, Globe, CreditCard, Cookie, Bell, Trash2, RefreshCw } from 'lucide-react';
import './PrivacyPolicyPage.css';

export default function PrivacyPolicyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="privacy-page">
      <div className="privacy-container">
        <header className="privacy-header">
          <div className="privacy-icon-wrapper">
            <Shield className="privacy-main-icon" />
          </div>
          <h1 className="privacy-title">Privacy Policy & Terms of Service</h1>
          <p className="privacy-subtitle">Trip and Event</p>
          <p className="privacy-effective-date">Effective Date: 9th January 2026</p>
        </header>

        {/* Introduction */}
        <section className="privacy-section">
          <div className="section-header">
            <Globe className="section-icon" />
            <h2>Introduction</h2>
          </div>
          <div className="section-content">
            <p>
              Trip and Event (the "Company", "we", "us" or "our") is a tour and travel company incorporated in India.
              Our website <a href="https://www.tripandevent.com/" target="_blank" rel="noopener noreferrer">https://www.tripandevent.com/</a> and
              associated mobile applications (collectively, the "Platform") allow customers to plan, book and manage travel services
              (such as flights, hotels, holiday packages and activities).
            </p>
            <p>
              This document explains (1) how we collect, use, share and protect your personal information (Privacy Policy) and
              (2) the terms and conditions that govern your use of our Platform and services (Terms of Service).
            </p>
            <div className="info-box">
              <AlertCircle className="info-icon" />
              <p>
                By accessing or using our Platform, or by otherwise providing information to us in connection with a booking or enquiry,
                you acknowledge that you have read, understood and accepted this Privacy Policy and our Terms of Service.
                If you do not agree with any part of the following policies, please do not use our services.
              </p>
            </div>
          </div>
        </section>

        {/* Privacy Policy Header */}
        <div className="policy-divider">
          <h2 className="policy-main-title">1. Privacy Policy</h2>
        </div>

        {/* 1.1 Information We Collect */}
        <section className="privacy-section">
          <div className="section-header">
            <Database className="section-icon" />
            <h2>1.1 Information We Collect</h2>
          </div>
          <div className="section-content">
            <p>
              When you use our website or associated mobile applications, we may collect personal information as described below.
              We collect personal information to operate effectively and provide you with a great experience when using our Platform.
            </p>

            <div className="info-category">
              <h4><Users className="inline-icon" /> Identity and Contact Information</h4>
              <p>Name, job title, postal address, telephone number and email address.</p>
            </div>

            <div className="info-category">
              <h4><Globe className="inline-icon" /> Demographic and Travel Information</h4>
              <p>Age, gender, date of birth, nationality, travel preferences, passport/visa details and other information relevant to customer surveys or offers.</p>
            </div>

            <div className="info-category">
              <h4><FileText className="inline-icon" /> Booking Details</h4>
              <p>Itinerary information, travel dates, flight numbers, hotel and activity preferences, traveller names and other information required to fulfil your booking.</p>
            </div>

            <div className="info-category">
              <h4><CreditCard className="inline-icon" /> Payment and Financial Information</h4>
              <p>Billing address, credit-card or debit-card details and transaction information. Card details are kept secure and encrypted in line with industry practices and RBI guidelines.</p>
            </div>

            <div className="info-category">
              <h4><Eye className="inline-icon" /> Technical and Usage Information</h4>
              <p>IP address, browser type, device information, pages viewed, referring/exit pages and cookies. We use cookies to analyse traffic and improve user experience.</p>
            </div>

            <div className="info-category">
              <h4><Mail className="inline-icon" /> Communications</h4>
              <p>Records of correspondence with us (emails, chats or phone calls), marketing preferences and customer feedback.</p>
            </div>

            <div className="info-category">
              <h4><Scale className="inline-icon" /> Legal and Compliance Information</h4>
              <p>For international bookings we may require Permanent Account Number (PAN) details for compliance with the Reserve Bank of India's Liberalised Remittance Scheme (LRS), as required by Indian regulations.</p>
            </div>
          </div>
        </section>

        {/* 1.2 How We Use Personal Information */}
        <section className="privacy-section">
          <div className="section-header">
            <FileText className="section-icon" />
            <h2>1.2 How We Use Personal Information</h2>
          </div>
          <div className="section-content">
            <p>We use the collected information for the following purposes:</p>

            <ul className="usage-list">
              <li>
                <strong>Providing Services:</strong> To process bookings, manage itineraries, facilitate payments, confirm reservations and provide travel-related services. We act as a facilitator connecting you with airlines, hotels and other service providers.
              </li>
              <li>
                <strong>Customer Service and Communications:</strong> To respond to enquiries, send booking confirmations, itineraries, payment receipts, cancellation or refund statuses and other transaction-related messages via SMS, WhatsApp, voice call or email.
              </li>
              <li>
                <strong>Improving Our Services:</strong> Internal record keeping, analysing traffic logs and usage patterns, customizing our Platform to your interests and enhancing our products and services.
              </li>
              <li>
                <strong>Marketing and Promotional Activities:</strong> With your consent, we may send promotional emails, newsletters or messages about new products, special offers or other information which we think you may find interesting.
              </li>
              <li>
                <strong>Security and Fraud Prevention:</strong> To verify identities, detect and prevent fraud, enforce our Terms of Service, protect our rights and comply with applicable laws.
              </li>
              <li>
                <strong>Legal Compliance:</strong> To meet legal obligations, including responding to regulatory requests, complying with tax laws and the LRS requirements for international remittances.
              </li>
            </ul>
          </div>
        </section>

        {/* 1.3 Cookies and Tracking */}
        <section className="privacy-section">
          <div className="section-header">
            <Cookie className="section-icon" />
            <h2>1.3 Cookies and Tracking Technologies</h2>
          </div>
          <div className="section-content">
            <p>
              A cookie is a small file that is placed on your computer or mobile device when you visit our Platform.
              We use traffic-log cookies to identify which pages are being used. This helps us analyse data about web page traffic
              and improve our website in order to tailor it to customer needs.
            </p>
          </div>
        </section>

        {/* 1.4 Sharing of Personal Information */}
        <section className="privacy-section">
          <div className="section-header">
            <Users className="section-icon" />
            <h2>1.4 Sharing of Personal Information</h2>
          </div>
          <div className="section-content">
            <p>
              We do not sell or rent your personal information to third parties for their marketing purposes without your explicit consent.
              However, we may share your information in the following circumstances:
            </p>

            <ul className="sharing-list">
              <li>
                <strong>Service Providers:</strong> With airlines, hotels, activity operators, insurance companies and other travel suppliers to fulfil your bookings.
              </li>
              <li>
                <strong>Payment Processors and Banks:</strong> To process payments, refunds and fraud checks.
              </li>
              <li>
                <strong>Third-Party Partners:</strong> With marketing and analytics partners in anonymised or aggregated form for improving services.
              </li>
              <li>
                <strong>Legal and Regulatory Authorities:</strong> When required by law or to protect our rights, customers or others.
              </li>
              <li>
                <strong>Business Transfers:</strong> In the event of a merger, acquisition or sale of assets, your data may be transferred as part of that transaction.
              </li>
            </ul>
          </div>
        </section>

        {/* 1.5 Your Choices and Rights */}
        <section className="privacy-section">
          <div className="section-header">
            <Bell className="section-icon" />
            <h2>1.5 Your Choices and Rights</h2>
          </div>
          <div className="section-content">
            <div className="rights-grid">
              <div className="right-card">
                <Eye className="right-icon" />
                <h4>Access and Correction</h4>
                <p>You may request access to the personal data we hold about you and ask us to correct or update inaccurate information.</p>
              </div>
              <div className="right-card">
                <Bell className="right-icon" />
                <h4>Opt-out of Marketing</h4>
                <p>You can unsubscribe from marketing emails or messages at any time by using the opt-out links or by contacting us.</p>
              </div>
              <div className="right-card">
                <RefreshCw className="right-icon" />
                <h4>Withdraw Consent</h4>
                <p>If you previously consented to direct marketing, you may change your mind at any time by writing to us at hello@tripandevent.com.</p>
              </div>
              <div className="right-card">
                <Trash2 className="right-icon" />
                <h4>Deactivate Account</h4>
                <p>You can request deletion of your account and personal information, subject to our legal and operational requirements.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 1.6 Security Practices */}
        <section className="privacy-section">
          <div className="section-header">
            <Lock className="section-icon" />
            <h2>1.6 Security Practices</h2>
          </div>
          <div className="section-content">
            <p>
              We are committed to ensuring that your information is secure. We implement appropriate technical and organisational measures,
              including encryption, access controls and regular security reviews, to prevent unauthorised access or disclosure.
            </p>
            <div className="warning-box">
              <AlertCircle className="warning-icon" />
              <p>
                However, we cannot guarantee that there will never be any security breach; any information downloaded or obtained from our website
                is at your own risk. You are responsible for keeping your password and account information confidential.
              </p>
            </div>
          </div>
        </section>

        {/* 1.7 Retention */}
        <section className="privacy-section">
          <div className="section-header">
            <Database className="section-icon" />
            <h2>1.7 Retention of Information</h2>
          </div>
          <div className="section-content">
            <p>
              We retain personal data only as long as necessary for the purposes for which it was collected, to comply with legal obligations,
              resolve disputes and enforce our agreements. When data is no longer required, we will securely delete or anonymise it.
            </p>
          </div>
        </section>

        {/* 1.8 Changes */}
        <section className="privacy-section">
          <div className="section-header">
            <RefreshCw className="section-icon" />
            <h2>1.8 Changes to This Privacy Policy</h2>
          </div>
          <div className="section-content">
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices, legal requirements or other factors.
              Any changes will be posted on our website with a revised "last updated" date.
            </p>
          </div>
        </section>

        {/* 1.9 Contact */}
        <section className="privacy-section">
          <div className="section-header">
            <Mail className="section-icon" />
            <h2>1.9 Contact Us</h2>
          </div>
          <div className="section-content">
            <p>If you have questions about this Privacy Policy or wish to exercise your rights, please contact:</p>
            <div className="contact-details">
              <div className="contact-item">
                <strong>Trip and Event – Data Protection Officer</strong>
              </div>
              <div className="contact-item">
                <Mail className="contact-inline-icon" />
                <a href="mailto:hello@tripandevent.com">hello@tripandevent.com</a>
              </div>
              <div className="contact-item">
                <MapPin className="contact-inline-icon" />
                <span>Trip and Event, Kolkata, West Bengal, India</span>
              </div>
              <div className="contact-item">
                <Phone className="contact-inline-icon" />
                <a href="tel:+919007000777">+91-9007000777</a>
              </div>
            </div>
          </div>
        </section>

        {/* Terms of Service Header */}
        <div className="policy-divider">
          <h2 className="policy-main-title">2. Terms of Service (User Agreement)</h2>
        </div>

        {/* 2.1 Applicability */}
        <section className="privacy-section">
          <div className="section-header">
            <FileText className="section-icon" />
            <h2>2.1 Applicability and Acceptance</h2>
          </div>
          <div className="section-content">
            <div className="terms-item">
              <h4>Scope of the Agreement</h4>
              <p>
                This User Agreement along with the Terms of Service (collectively, the "Agreement") forms the terms and conditions
                for the use of services and products of Trip and Event. It applies to all transactions made through our website,
                mobile applications, call centres, branch offices, sales agents and other channels.
              </p>
            </div>

            <div className="terms-item">
              <h4>Parties</h4>
              <p>
                References to "you", "your", "User" or "Traveller" mean the person who enquiries about or purchases products or services via our Platform.
                "Trip and Event" refers to the Company.
              </p>
            </div>

            <div className="terms-item">
              <h4>Eligibility</h4>
              <p>
                You must be at least 18 years old and possess legal capacity to enter into contracts to use our Platform.
                Minors may use the Platform only through a parent or legal guardian. Trip and Event reserves the right to terminate
                any account if it is discovered that a user is underage or lacks capacity.
              </p>
            </div>

            <div className="terms-item">
              <h4>Acceptance</h4>
              <p>
                By using our Platform or services, you are deemed to have read, understood and expressly accepted this Agreement.
                If you do not agree with any part of the Agreement, you must not use our services.
              </p>
            </div>

            <div className="terms-item">
              <h4>Additional Terms</h4>
              <p>
                Some services (e.g., flights, hotels, holiday packages) are subject to additional terms and conditions specific to that service.
                In the event of a conflict between such service-specific terms and this Agreement, the service-specific terms will prevail.
              </p>
            </div>
          </div>
        </section>

        {/* 2.2 Role of Trip and Event */}
        <section className="privacy-section">
          <div className="section-header">
            <Globe className="section-icon" />
            <h2>2.2 Role of Trip and Event</h2>
          </div>
          <div className="section-content">
            <div className="terms-item">
              <h4>Facilitator</h4>
              <p>
                Unless explicitly stated otherwise, Trip and Event acts as a facilitator connecting Users with service providers
                such as airlines, hotels, transport operators and activity providers. The contract of service is ultimately between
                the User and the service provider, and our liability is limited to providing you with a confirmed booking.
              </p>
            </div>

            <div className="terms-item">
              <h4>Limited Liability</h4>
              <p>
                We do not control or guarantee the actions or omissions of service providers. We are not liable for delays, cancellations,
                overbooking, strikes, acts of God or other circumstances beyond our control (collectively, Force Majeure).
                In such events our liability is limited to offering a refund or alternative booking.
              </p>
            </div>

            <div className="terms-item">
              <h4>Independent Travel Agents</h4>
              <p>
                Travel agents, tour operators or aggregators must register with Trip and Event and obtain explicit permission
                before using our Platform for commercial purposes. Bookings made by unregistered agents may be cancelled.
              </p>
            </div>
          </div>
        </section>

        {/* 2.3 User Responsibilities */}
        <section className="privacy-section">
          <div className="section-header">
            <Users className="section-icon" />
            <h2>2.3 User Responsibilities</h2>
          </div>
          <div className="section-content">
            <ul className="responsibilities-list">
              <li>
                <strong>Accurate Information:</strong> You must provide true, accurate, current and complete information while registering or making bookings. You agree to verify all booking details.
              </li>
              <li>
                <strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your account password and for all activities under your account.
              </li>
              <li>
                <strong>Compliance with Laws:</strong> You agree to comply with all applicable laws, regulations and orders issued by government authorities.
              </li>
              <li>
                <strong>Travel Documents and Visa:</strong> You are responsible for obtaining valid passports, visas, transit permits and other documents required for your travel.
              </li>
              <li>
                <strong>Health and Insurance:</strong> Unless explicitly included, obtaining adequate travel insurance is your responsibility.
              </li>
              <li>
                <strong>Payments and Fees:</strong> You agree to pay the total booking amount and any additional convenience or service fees. Booking is confirmed only after full payment is received.
              </li>
              <li>
                <strong>Communication Consent:</strong> You consent to receive booking confirmations, itineraries, payment receipts and other transaction-related communications via SMS, email, WhatsApp or phone call.
              </li>
            </ul>
          </div>
        </section>

        {/* 2.4 Bookings, Cancellations and Refunds */}
        <section className="privacy-section">
          <div className="section-header">
            <CreditCard className="section-icon" />
            <h2>2.4 Bookings, Cancellations and Refunds</h2>
          </div>
          <div className="section-content">
            <div className="terms-item">
              <h4>Booking Process</h4>
              <p>
                Your booking request is an offer to purchase a product or service. We reserve the right to accept or reject your offer.
                Once a booking is confirmed, we will issue a booking voucher or confirmation email.
              </p>
            </div>

            <div className="terms-item">
              <h4>Cancellation by User</h4>
              <p>
                Cancellation policies vary by service provider and are displayed during booking. If you cancel a booking,
                the applicable supplier's cancellation policy will apply. In some cases, bookings may be non-refundable.
              </p>
            </div>

            <div className="terms-item">
              <h4>Cancellation by Service Provider or Force Majeure</h4>
              <p>
                In exceptional circumstances (e.g., natural disasters, pandemics, insolvency of airlines/hotels),
                the service provider may be unable to honour the booking. Trip and Event will make best efforts to provide
                a comparable alternative or refund the booking amount, subject to the supplier's refund policy.
              </p>
            </div>

            <div className="terms-item">
              <h4>Refund Process</h4>
              <p>
                Refunds are processed back to the original payment method within a reasonable time after the service provider confirms the refund.
                Service charges, processing fees and bank charges may be non-refundable.
              </p>
            </div>
          </div>
        </section>

        {/* 2.5 Intellectual Property */}
        <section className="privacy-section">
          <div className="section-header">
            <Shield className="section-icon" />
            <h2>2.5 Intellectual Property and Acceptable Use</h2>
          </div>
          <div className="section-content">
            <div className="terms-item">
              <h4>Content Ownership</h4>
              <p>
                All content on our Platform (including text, graphics, logos, software and trademarks) is owned or licensed by Trip and Event.
                You may use the Platform only for personal, non-commercial purposes. Unauthorised use of our content or trademarks is prohibited.
              </p>
            </div>

            <div className="terms-item">
              <h4>Prohibited Activities</h4>
              <p>
                You must not disrupt or interfere with the operation of the Platform, modify or copy the content, or use it for commercial or public purposes.
                You agree not to upload or transmit any unlawful, defamatory, obscene or harmful material.
              </p>
            </div>
          </div>
        </section>

        {/* 2.6 Third-Party Websites */}
        <section className="privacy-section">
          <div className="section-header">
            <Globe className="section-icon" />
            <h2>2.6 Third-Party Websites and Advertisers</h2>
          </div>
          <div className="section-content">
            <p>
              Our Platform may contain links to third-party websites or advertisements. We do not control such websites and are not responsible for their content.
              Accessing any third-party website is at your own risk. We do not endorse advertisers on our Platform; please review the terms and privacy policies
              of any third-party sites you visit.
            </p>
          </div>
        </section>

        {/* 2.7 Limitation of Liability */}
        <section className="privacy-section">
          <div className="section-header">
            <Scale className="section-icon" />
            <h2>2.7 Limitation of Liability</h2>
          </div>
          <div className="section-content">
            <div className="legal-box">
              <p>
                To the fullest extent permitted by law, Trip and Event shall not be liable for any direct, indirect, incidental, special,
                consequential or punitive damages (including loss of profits, data or goodwill) arising out of or in connection with your use of the Platform or any booking.
              </p>
              <p>
                Our aggregate liability is limited to the amount paid by you for the booking in question.
                This limitation applies even if we have been advised of the possibility of such damages.
              </p>
            </div>
          </div>
        </section>

        {/* 2.8 Indemnification */}
        <section className="privacy-section">
          <div className="section-header">
            <Shield className="section-icon" />
            <h2>2.8 Indemnification</h2>
          </div>
          <div className="section-content">
            <p>You agree to indemnify and hold harmless Trip and Event, its directors, officers, employees and agents from and against all losses, damages, claims and expenses (including legal fees) arising from:</p>
            <ul className="indemnity-list">
              <li>Your use of the Platform in violation of this Agreement</li>
              <li>Your violation of any law or the rights of a third party</li>
              <li>Any incorrect or invalid information provided by you that results in communications issues or regulatory fines</li>
            </ul>
          </div>
        </section>

        {/* 2.9 Termination */}
        <section className="privacy-section">
          <div className="section-header">
            <AlertCircle className="section-icon" />
            <h2>2.9 Termination and Suspension</h2>
          </div>
          <div className="section-content">
            <p>
              Trip and Event may, at its sole discretion and without notice, suspend or terminate your access to our Platform and services
              if you breach this Agreement or engage in fraudulent, abusive or illegal activity. Upon termination, your right to use the Platform
              will immediately cease, and we may cancel any pending bookings.
            </p>
          </div>
        </section>

        {/* 2.10 Miscellaneous */}
        <section className="privacy-section">
          <div className="section-header">
            <FileText className="section-icon" />
            <h2>2.10 Miscellaneous</h2>
          </div>
          <div className="section-content">
            <div className="terms-item">
              <h4>Governing Law and Jurisdiction</h4>
              <p>
                This Agreement shall be governed by and construed in accordance with the laws of India.
                Any disputes arising out of or relating to this Agreement shall be subject to the exclusive jurisdiction of the courts in Kolkata, West Bengal, India.
              </p>
            </div>

            <div className="terms-item">
              <h4>Modification of Terms</h4>
              <p>
                We reserve the right to change the terms, conditions and notices under which our Platform is offered.
                Users are responsible for regularly reviewing the terms. Your continued use of the Platform after changes indicates your acceptance of the amended terms.
              </p>
            </div>

            <div className="terms-item">
              <h4>Severability</h4>
              <p>
                If any provision of this Agreement is determined to be invalid or unenforceable, the remaining provisions will continue in full force and effect.
              </p>
            </div>

            <div className="terms-item">
              <h4>No Partnership</h4>
              <p>
                Nothing in this Agreement shall be construed as creating a partnership, joint venture or employment relationship between you and Trip and Event.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <div className="privacy-contact">
          <div className="contact-card">
            <Mail className="contact-icon" />
            <div className="contact-content">
              <h3>Questions About This Policy?</h3>
              <p>If you have any questions about our Privacy Policy or Terms of Service, please contact us.</p>
              <div className="contact-links">
                <a href="mailto:hello@tripandevent.com" className="contact-email">
                  hello@tripandevent.com
                </a>
                <a href="tel:+919007000777" className="contact-phone">
                  +91-9007000777
                </a>
              </div>
              <p className="contact-address">Trip and Event, Kolkata, West Bengal, India</p>
            </div>
          </div>
        </div>

        <footer className="privacy-footer">
          <p>Last updated: 9th January 2026</p>
        </footer>
      </div>
    </div>
  );
}
