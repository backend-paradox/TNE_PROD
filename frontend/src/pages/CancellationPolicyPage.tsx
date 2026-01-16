import { useEffect } from 'react';
import { Mail, AlertCircle, Plane, Building2, Ticket, Shield, Car } from 'lucide-react';
import './CancellationPolicyPage.css';

export default function CancellationPolicyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="cancellation-page">
      <div className="cancellation-container">
        {/* Header */}
        <div className="cancellation-header">
          <h1 className="cancellation-title">Cancellation Policy</h1>
          <p className="cancellation-subtitle">Trip and Event</p>
        </div>

        {/* General Section */}
        <section className="cancellation-section">
          <div className="section-header">
            <AlertCircle className="section-icon" />
            <h2>General</h2>
          </div>
          <div className="section-content">
            <p>
              The cancellation policy is applicable to all vacations crafted by Trip And Event from
              <strong> 09 January 2025</strong> onwards.
            </p>
            <ul>
              <li>
                Customers eligible for refunds will receive the refund amount within <strong>90 working days</strong> from
                the date of cancellation or from the date when the supplier(s) processes the refund, whichever is later.
              </li>
              <li>
                For refunds related to on-trip cancellations, customers will receive the refund amount within
                <strong> 90 working days</strong> from the date of their return or from the date when the supplier(s)
                processes the refund, whichever is later.
              </li>
              <li>
                For any queries or clarifications, customers may reach out to{' '}
                <a href="mailto:support@tripandevent.com">support@tripandevent.com</a>.
              </li>
              <li>
                The refund amount depicted is subject to change based on international exchange rates, refunds received
                from suppliers, and payments received from customers till date. Any change in the refund amount will be
                communicated to customers by their respective account managers.
              </li>
            </ul>
          </div>
        </section>

        {/* Flights Section */}
        <section className="cancellation-section">
          <div className="section-header">
            <Plane className="section-icon" />
            <h2>Flights</h2>
          </div>
          <div className="section-content">
            <ul>
              <li>
                On cancelling flights marked as <strong>"Non-Refundable"</strong> on the final travel vouchers,
                customers will be eligible for <strong>zero refund</strong>.
              </li>
              <li>
                For flights marked as <strong>"Refundable"</strong>, customers will receive a refund as per the details
                mentioned under the Cancellation Policy section of the product and in the final itinerary shared via email.
              </li>
              <li>
                Total refunds for flights may include components that vary based on international exchange rates.
              </li>
              <li>
                Trip And Event will not be responsible for grounded, cancelled, or delayed flights. Any cancellation
                requests must be placed directly with the respective airline.
              </li>
              <li>
                Customers must ensure their passport has a minimum validity of <strong>1 year</strong>. Trip And Event
                is not liable for denied boarding due to invalid or damaged passports.
              </li>
            </ul>
          </div>
        </section>

        {/* Hotels Section */}
        <section className="cancellation-section">
          <div className="section-header">
            <Building2 className="section-icon" />
            <h2>Hotels</h2>
          </div>
          <div className="section-content">
            <ul>
              <li>
                On cancelling hotels marked as <strong>Non-Refundable</strong>, customers will be eligible for
                <strong> zero refund</strong>.
              </li>
              <li>
                For <strong>Refundable</strong> hotels, refunds and timelines apply as per the final itinerary.
              </li>
            </ul>
          </div>
        </section>

        {/* Activities Section */}
        <section className="cancellation-section">
          <div className="section-header">
            <Ticket className="section-icon" />
            <h2>Activities</h2>
          </div>
          <div className="section-content">
            <ul>
              <li>
                <strong>Non-Refundable</strong> activities are not eligible for refunds.
              </li>
              <li>
                <strong>Refundable</strong> activities will be processed as per the itinerary and supplier policy.
              </li>
            </ul>
          </div>
        </section>

        {/* Visa & Insurance Section */}
        <section className="cancellation-section">
          <div className="section-header">
            <Shield className="section-icon" />
            <h2>Visa & Insurance</h2>
          </div>
          <div className="section-content">
            <ul>
              <li>
                Trip And Event acts only as a facilitator for visa processing. <strong>Visa fees are non-refundable</strong> in
                case of rejection.
              </li>
              <li>
                Insurance once applied is <strong>non-refundable</strong> and subject to <strong>100% cancellation charges</strong>.
              </li>
            </ul>
          </div>
        </section>

        {/* Transfers Section */}
        <section className="cancellation-section">
          <div className="section-header">
            <Car className="section-icon" />
            <h2>Transfers</h2>
          </div>
          <div className="section-content">
            <ul>
              <li>
                Refunds for transfers will be processed as per supplier cancellation policies and itinerary details.
              </li>
            </ul>
          </div>
        </section>

        {/* Contact Section */}
        <section className="cancellation-contact">
          <div className="contact-card">
            <Mail className="contact-icon" />
            <div className="contact-content">
              <h3>Need Help?</h3>
              <p>For any queries regarding cancellations or refunds, please contact us:</p>
              <a href="mailto:support@tripandevent.com" className="contact-email">
                support@tripandevent.com
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="cancellation-footer">
          <p>Last updated: January 2025</p>
        </div>
      </div>
    </div>
  );
}
