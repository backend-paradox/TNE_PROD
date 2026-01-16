import { useEffect } from 'react';
import { FileText, CreditCard, Calendar, Shield, AlertCircle, Scale, HelpCircle, Globe } from 'lucide-react';
import './TermsAndConditionsPage.css';

export default function TermsAndConditionsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="terms-page">
      <div className="terms-container">
        <header className="terms-header">
          <h1 className="terms-title">Terms and Conditions</h1>
          <p className="terms-subtitle">Trip and Event - Hotel Booking Terms</p>
          <p className="terms-compliance">(Compliant with Indian Consumer Protection & E-Commerce Laws)</p>
          <p className="terms-effective">Effective Date: 9th January 2026</p>
        </header>

        <div className="terms-intro-box">
          <p>
            These Hotel Booking Terms and Conditions ("Terms") govern the booking of hotel accommodations made through Trip and Event ("Company", "we", "us", "our") via{' '}
            <a href="https://www.tripandevent.com/" target="_blank" rel="noreferrer">https://www.tripandevent.com/</a>{' '}
            or through authorized representatives. By using our platform, you agree to these Terms.
          </p>
        </div>

        {/* Section 1 */}
        <section className="terms-section">
          <div className="section-header">
            <Scale className="section-icon" />
            <h2>1. Legal Status of Trip and Event</h2>
          </div>
          <div className="section-content">
            <p>
              In accordance with the Consumer Protection (E-Commerce) Rules, 2020, Trip and Event operates as an online marketplace and facilitator and does not own, operate, or control hotels listed on the platform. The actual contract for accommodation is between the customer and the hotel.
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section className="terms-section">
          <div className="section-header">
            <FileText className="section-icon" />
            <h2>2. Transparency of Information</h2>
          </div>
          <div className="section-content">
            <ul>
              <li>All material information including hotel name, address, amenities, total price (inclusive of applicable taxes), cancellation policy, and check-in/check-out times will be disclosed prior to booking.</li>
              <li>Prices shown are final prices unless otherwise stated, in compliance with Indian consumer transparency requirements.</li>
              <li>Any errors in pricing or availability will be promptly communicated to the customer.</li>
            </ul>
          </div>
        </section>

        {/* Section 3 */}
        <section className="terms-section">
          <div className="section-header">
            <Calendar className="section-icon" />
            <h2>3. Booking & Confirmation</h2>
          </div>
          <div className="section-content">
            <ul>
              <li>A booking is confirmed only after payment is received and a confirmation voucher/email is issued.</li>
              <li>Booking confirmation is subject to hotel acceptance and availability.</li>
              <li>Special requests are forwarded to hotels but cannot be guaranteed unless confirmed in writing.</li>
            </ul>
          </div>
        </section>

        {/* Section 4 */}
        <section className="terms-section">
          <div className="section-header">
            <CreditCard className="section-icon" />
            <h2>4. Payments & GST</h2>
          </div>
          <div className="section-content">
            <ul>
              <li>Payments shall be processed through secure and compliant payment gateways as per the Information Technology Act, 2000.</li>
              <li>GST and other statutory taxes shall be charged as applicable and clearly mentioned on the invoice.</li>
              <li>Tax invoices shall be issued as per GST regulations.</li>
            </ul>
          </div>
        </section>

        {/* Section 5 */}
        <section className="terms-section">
          <div className="section-header">
            <Shield className="section-icon" />
            <h2>5. Check-in, Check-out & Guest Obligations</h2>
          </div>
          <div className="section-content">
            <ul>
              <li>Guests must carry valid government-issued photo identification (Aadhaar, Passport, PAN, Driving License, etc.) as required by Indian law and hotel policy.</li>
              <li>Hotels reserve the right to deny check-in if valid identification is not produced.</li>
              <li>Guests must adhere to hotel rules, local laws, and public order requirements.</li>
            </ul>
          </div>
        </section>

        {/* Section 6 */}
        <section className="terms-section">
          <div className="section-header">
            <AlertCircle className="section-icon" />
            <h2>6. Cancellation, Refunds & No-Show Policy</h2>
          </div>
          <div className="section-content">
            <ul>
              <li>Cancellation and refund policies shall be clearly disclosed before booking, as mandated under the Consumer Protection Act, 2019.</li>
              <li>Refunds, if applicable, shall be processed within a reasonable period, not exceeding 7-10 working days, subject to bank/payment gateway timelines.</li>
              <li>No refunds shall be provided for no-shows or early check-outs unless explicitly stated.</li>
            </ul>
          </div>
        </section>

        {/* Section 7 */}
        <section className="terms-section">
          <div className="section-header">
            <FileText className="section-icon" />
            <h2>7. Amendments & Modifications</h2>
          </div>
          <div className="section-content">
            <ul>
              <li>Any change requests after confirmation are subject to hotel approval and availability.</li>
              <li>Additional charges or fare differences shall be communicated transparently and require customer consent.</li>
            </ul>
          </div>
        </section>

        {/* Section 8 */}
        <section className="terms-section">
          <div className="section-header">
            <HelpCircle className="section-icon" />
            <h2>8. Deficiency of Service & Consumer Rights</h2>
          </div>
          <div className="section-content">
            <ul>
              <li>If there is a deficiency of service, customers may raise a complaint with Trip and Event.</li>
              <li>We will facilitate resolution with the hotel in a fair and timely manner, as required under the Consumer Protection Act, 2019.</li>
              <li>Nothing in these Terms limits or waives consumer rights available under Indian law.</li>
            </ul>
          </div>
        </section>

        {/* Section 9 */}
        <section className="terms-section">
          <div className="section-header">
            <Scale className="section-icon" />
            <h2>9. Limitation of Liability (As Permitted by Law)</h2>
          </div>
          <div className="section-content">
            <ul>
              <li>Trip and Event shall not be liable for acts, omissions, or deficiencies of hotels, except to the extent required by applicable law.</li>
              <li>Our liability, where applicable, shall be limited to the amount paid for the booking, unless otherwise mandated by law.</li>
              <li>We are not responsible for indirect or consequential losses unless required under statutory consumer protections.</li>
            </ul>
          </div>
        </section>

        {/* Section 10 */}
        <section className="terms-section">
          <div className="section-header">
            <AlertCircle className="section-icon" />
            <h2>10. Force Majeure</h2>
          </div>
          <div className="section-content">
            <p>
              Trip and Event shall not be liable for failure or delay caused by events beyond reasonable control, including natural disasters, pandemics, government restrictions, or acts of God.
            </p>
          </div>
        </section>

        {/* Section 11 */}
        <section className="terms-section">
          <div className="section-header">
            <Shield className="section-icon" />
            <h2>11. Data Protection & Privacy</h2>
          </div>
          <div className="section-content">
            <p>Customer data shall be collected, stored, and processed in accordance with:</p>
            <ul>
              <li>Information Technology Act, 2000</li>
              <li>IT (Reasonable Security Practices and Procedures) Rules</li>
              <li>Trip and Event's Privacy Policy</li>
            </ul>
            <p>Personal data shall not be shared except as required to fulfill bookings or by law.</p>
          </div>
        </section>

        {/* Section 12 */}
        <section className="terms-section grievance-section">
          <div className="section-header">
            <HelpCircle className="section-icon" />
            <h2>12. Grievance Redressal (Mandatory Under Indian Law)</h2>
          </div>
          <div className="section-content">
            <p>In compliance with Consumer Protection (E-Commerce) Rules, 2020, we provide the following grievance mechanism:</p>
            <div className="grievance-box">
              <p><strong>Email:</strong> <a href="mailto:support@tripandevent.com">support@tripandevent.com</a></p>
              <p><strong>Response Time:</strong> Within 48 hours, resolution within 30 days</p>
            </div>
            <p>Consumers may also approach appropriate Consumer Dispute Redressal Commissions if grievances remain unresolved.</p>
          </div>
        </section>

        {/* Section 13 */}
        <section className="terms-section">
          <div className="section-header">
            <Globe className="section-icon" />
            <h2>13. Governing Law & Jurisdiction</h2>
          </div>
          <div className="section-content">
            <p>These Terms shall be governed by the laws of India.</p>
            <p>Courts in India shall have exclusive jurisdiction.</p>
          </div>
        </section>

        {/* Section 14 */}
        <section className="terms-section">
          <div className="section-header">
            <FileText className="section-icon" />
            <h2>14. Updates to Terms</h2>
          </div>
          <div className="section-content">
            <p>
              Trip and Event reserves the right to update these Terms from time to time. Any material changes will be published on{' '}
              <a href="https://www.tripandevent.com/" target="_blank" rel="noreferrer">https://www.tripandevent.com/</a>
            </p>
          </div>
        </section>

        <footer className="terms-footer">
          <p>Last updated: January 2026</p>
        </footer>
      </div>
    </div>
  );
}
