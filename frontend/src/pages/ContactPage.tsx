import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Globe,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  CheckCircle,
  ArrowRight,
  Headphones,
  Building,
} from "lucide-react";
import "./ContactPage.css";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

const contactInfo = {
  phone: "+91 90070 00777",
  alternatePhone: "+91 90070 00777",
  email: "hello@tripandevent.com",
  supportEmail: "hello@tripandevent.com",
  address: "P. S. ABACUS, Room No: 708, NH 12, Action Area IIE, New Town, Kolkata - 700157 (West Bengal)",
  workingHours: "Mon - Sat: 9:00 AM - 8:00 PM",
  weekend: "Sunday: 10:00 AM - 6:00 PM",
};

const officeLocations = [
  {
    city: "Kolkata",
    address: "P. S. ABACUS, Room No: 708, NH 12, Action Area IIE, New Town, Kolkata - 700157 (West Bengal)",
    phone: "+91 90070 00777",
    email: "hello@tripandevent.com",
    isHeadquarter: true,
  },
  {
    city: "Kolkata - City Center",
    address: "Unit CCNTA0117, 1st Floor, City Center New Town, New Town, South Twenty Four Parganas, Kolkata - 700156 (West Bengal)",
    phone: "+91 90070 00777",
    email: "hello@tripandevent.com",
    isHeadquarter: false,
  },
  {
    city: "Dubai",
    address: "Horizon Building, Office - 601, 6th Floor, Dubai, UAE",
    phone: "",
    email: "",
    isHeadquarter: false,
  },
];

const faqs = [
  {
    question: "How do I book a trip package?",
    answer: "You can book a trip package by selecting your desired destination, choosing a package, and completing the booking form. Our team will contact you within 24 hours to confirm your booking.",
  },
  {
    question: "What is your cancellation policy?",
    answer: "We offer free cancellation up to 30 days before the trip date. Cancellations within 15-30 days incur a 25% fee, and within 7-15 days incur a 50% fee. No refunds for cancellations within 7 days.",
  },
  {
    question: "Do you offer customized travel packages?",
    answer: "Yes! We specialize in creating customized travel experiences. Contact our travel experts with your preferences, and we'll design a personalized itinerary just for you.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit/debit cards, net banking, UPI, and EMI options. For international bookings, we also accept PayPal and wire transfers.",
  },
  {
    question: "Is travel insurance included in packages?",
    answer: "Basic travel insurance is included in all our packages. For comprehensive coverage, we recommend upgrading to our premium insurance plan at an additional cost.",
  },
];

const socialLinks = [
  {
    icon: Facebook,
    href: "https://facebook.com/tripandevent",
    label: "Facebook",
    handle: "@tripandevent",
    bgColor: "#1877f2",
  },
  {
    icon: Instagram,
    href: "https://instagram.com/tripandevent",
    label: "Instagram",
    handle: "@tripandevent",
    bgColor: "#E4405F",
    gradient: "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)"
  },
  {
    icon: Twitter,
    href: "https://twitter.com/tripandevent",
    label: "Twitter",
    handle: "@tripandevent",
    bgColor: "#1da1f2",
  },
  {
    icon: Youtube,
    href: "https://www.youtube.com/@tripandevent",
    label: "YouTube",
    handle: "@tripandevent",
    bgColor: "#ff0000",
  },
];

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    inquiryType: "general",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <div className="contact-hero">
        <img
          src="/assets/images/hero/contact_page_hero.webp"
          alt="Contact Us"
          className="contact-hero-image"
        />
        <div className="contact-hero-overlay" />
        <div className="contact-hero-gradient" />

        {/* Animated Background Decorations */}
        <div className="contact-hero-decorations">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
            className="contact-hero-circle top-right"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
            className="contact-hero-circle bottom-left"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="contact-hero-glow"
          />
        </div>

        {/* Content */}
        <div className="contact-hero-content">
          <div className="contact-hero-inner">
            <div className="contact-hero-text">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="contact-hero-badge"
              >
                <MessageSquare />
                <span className="contact-hero-badge-text">We're Here to Help</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="contact-hero-title"
              >
                Get in <span className="contact-hero-title-highlight">Touch</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="contact-hero-subtitle"
              >
                Have questions? We'd love to hear from you. Our team is ready to help you plan your perfect journey.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.6 }}
                className="contact-hero-actions"
              >
                <a href={`tel:${contactInfo.phone}`} className="contact-hero-btn-primary">
                  <Phone />
                  <span>Call Now</span>
                </a>
                <a href="#contact-form" className="contact-hero-btn-secondary">
                  <Mail />
                  <span>Send Message</span>
                </a>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Contact Cards */}
      <div className="contact-cards-container">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="contact-cards-grid"
        >
          {/* Card 1: Call Us */}
          <motion.div variants={cardVariants} className="contact-card">
            <div className="contact-card-accent" />
            <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="contact-card-icon">
              <Phone />
            </motion.div>
            <h3 className="contact-card-title">Call Us</h3>
            <p className="contact-card-text">Speak directly with our travel experts</p>
            <a href={`tel:${contactInfo.phone}`} className="contact-card-link">
              {contactInfo.phone}
              <ArrowRight />
            </a>
            <p className="contact-card-secondary">{contactInfo.alternatePhone}</p>
            <div className="contact-card-decoration" />
          </motion.div>

          {/* Card 2: Email Us */}
          <motion.div variants={cardVariants} className="contact-card">
            <div className="contact-card-accent" />
            <motion.div whileHover={{ scale: 1.1, rotate: -5 }} className="contact-card-icon">
              <Mail />
            </motion.div>
            <h3 className="contact-card-title">Email Us</h3>
            <p className="contact-card-text">We'll respond within 24 hours</p>
            <a href={`mailto:${contactInfo.email}`} className="contact-card-link">
              {contactInfo.email}
              <ArrowRight />
            </a>
            <p className="contact-card-secondary">{contactInfo.supportEmail}</p>
            <div className="contact-card-decoration" />
          </motion.div>

          {/* Card 3: Working Hours */}
          <motion.div variants={cardVariants} className="contact-card">
            <div className="contact-card-accent" />
            <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="contact-card-icon">
              <Clock />
            </motion.div>
            <h3 className="contact-card-title">Working Hours</h3>
            <p className="contact-card-text">We're here to help</p>
            <p className="contact-card-link">{contactInfo.workingHours}</p>
            <p className="contact-card-secondary">{contactInfo.weekend}</p>
            <div className="contact-card-decoration" />
          </motion.div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="contact-main">
        <div className="contact-main-container">
          <div className="contact-main-grid">
            {/* Contact Form */}
            <div id="contact-form" className="contact-form-section">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                Send Us a <span>Message</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                Fill out the form below and our team will get back to you as soon as possible.
              </motion.p>

              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="contact-form-success"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="contact-form-success-icon"
                  >
                    <CheckCircle />
                  </motion.div>
                  <h3>Message Sent Successfully!</h3>
                  <p>Thank you for reaching out. Our team will contact you within 24 hours.</p>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({
                        name: "",
                        email: "",
                        phone: "",
                        subject: "",
                        message: "",
                        inquiryType: "general",
                      });
                    }}
                  >
                    <ArrowRight style={{ transform: 'rotate(180deg)' }} />
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="contact-form-card"
                >
                  <div className="contact-form-wrapper">
                    {/* Left Side */}
                    <div className="contact-form-left">
                      <div className="contact-form-left-bg">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                          transition={{ duration: 20, repeat: Infinity }}
                          className="contact-form-left-glow top"
                        />
                        <motion.div
                          animate={{ scale: [1.2, 1, 1.2], rotate: [0, -90, 0] }}
                          transition={{ duration: 15, repeat: Infinity }}
                          className="contact-form-left-glow bottom"
                        />
                      </div>

                      <div className="contact-form-left-content">
                        <motion.div
                          initial={{ opacity: 0, x: -30 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.2 }}
                        >
                          <div className="contact-form-left-icon">
                            <MessageSquare />
                          </div>
                          <h3>Let's Start a Conversation</h3>
                          <p>Share your travel dreams with us. Our expert team is ready to craft your perfect journey.</p>

                          <div className="contact-form-info-list">
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.3 }}
                              className="contact-form-info-item"
                            >
                              <div className="contact-form-info-icon">
                                <Phone />
                              </div>
                              <div className="contact-form-info-text">
                                <p>Quick Response</p>
                                <p>Within 24 Hours</p>
                              </div>
                            </motion.div>

                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.4 }}
                              className="contact-form-info-item"
                            >
                              <div className="contact-form-info-icon">
                                <Headphones />
                              </div>
                              <div className="contact-form-info-text">
                                <p>Expert Support</p>
                                <p>Travel Specialists</p>
                              </div>
                            </motion.div>

                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.5 }}
                              className="contact-form-info-item"
                            >
                              <div className="contact-form-info-icon">
                                <CheckCircle />
                              </div>
                              <div className="contact-form-info-text">
                                <p>Trusted Service</p>
                                <p>50,000+ Happy Travelers</p>
                              </div>
                            </motion.div>
                          </div>
                        </motion.div>
                      </div>
                    </div>

                    {/* Right Side - Form */}
                    <form onSubmit={handleSubmit} className="contact-form-right">
                      <div className="contact-form-fields">
                        <div className="contact-form-group">
                          <label>Full Name <span>*</span></label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            placeholder="John Doe"
                          />
                        </div>

                        <div className="contact-form-group">
                          <label>Email Address <span>*</span></label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            placeholder="john@example.com"
                          />
                        </div>

                        <div className="contact-form-group">
                          <label>Phone Number <span>*</span></label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            placeholder="+91 900 700 0777"
                          />
                        </div>

                        <div className="contact-form-group">
                          <label>Inquiry Type</label>
                          <select
                            name="inquiryType"
                            value={formData.inquiryType}
                            onChange={handleInputChange}
                          >
                            <option value="general">General Inquiry</option>
                            <option value="booking">Booking Query</option>
                            <option value="cinematrip">CinemaTrip Services</option>
                            <option value="corporate">Corporate Travel</option>
                            <option value="feedback">Feedback</option>
                            <option value="partnership">Partnership</option>
                          </select>
                        </div>

                        <div className="contact-form-group">
                          <label>Subject <span>*</span></label>
                          <input
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={handleInputChange}
                            required
                            placeholder="How can we help you?"
                          />
                        </div>

                        <div className="contact-form-group">
                          <label>Message <span>*</span></label>
                          <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            required
                            rows={4}
                            placeholder="Tell us about your travel plans or questions..."
                          />
                        </div>

                        <motion.button
                          type="submit"
                          disabled={isSubmitting}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="contact-form-submit"
                        >
                          <div className="contact-form-submit-shimmer" />
                          {isSubmitting ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="contact-form-spinner"
                              />
                              <span>Sending...</span>
                            </>
                          ) : (
                            <>
                              <Send />
                              <span>Send Message</span>
                            </>
                          )}
                        </motion.button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Office Locations */}
            <div className="contact-offices">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="contact-offices-header"
              >
                <h2>Our <span>Offices</span></h2>
                <p>Visit us at any of our locations</p>
              </motion.div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="contact-offices-list"
              >
                {officeLocations.map((office, index) => (
                  <motion.div
                    key={index}
                    variants={cardVariants}
                    className={`contact-office-card ${office.isHeadquarter ? 'headquarter' : ''}`}
                  >
                    <div className="contact-office-card-accent" />
                    <div className="contact-office-card-header">
                      <div className="contact-office-card-title">
                        <motion.div whileHover={{ scale: 1.1 }} className="contact-office-card-icon">
                          <MapPin />
                        </motion.div>
                        <h4>{office.city}</h4>
                      </div>
                      {office.isHeadquarter && (
                        <span className="contact-office-card-badge">Headquarters</span>
                      )}
                    </div>
                    <p className="contact-office-card-address">{office.address}</p>
                    {(office.phone || office.email) && (
                      <div className="contact-office-card-links">
                        {office.phone && (
                          <a href={`tel:${office.phone}`} className="contact-office-card-link">
                            <Phone />
                            {office.phone}
                          </a>
                        )}
                        {office.email && (
                          <a href={`mailto:${office.email}`} className="contact-office-card-link">
                            <Mail />
                            {office.email}
                          </a>
                        )}
                      </div>
                    )}
                    <div className="contact-office-card-decoration" />
                  </motion.div>
                ))}
              </motion.div>

              {/* Social Media */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="contact-social"
              >
                <div className="contact-social-card">
                  <div className="contact-social-bg top-right" />
                  <div className="contact-social-bg bottom-left" />

                  <div className="contact-social-content">
                    <div className="contact-social-header">
                      <div className="contact-social-icon">
                        <Globe />
                      </div>
                      <h3>Connect With Us</h3>
                    </div>
                    <p>Follow us for travel inspiration & exclusive deals</p>

                    <div className="contact-social-grid">
                      {socialLinks.map((social, index) => {
                        const Icon = social.icon;
                        return (
                          <motion.a
                            key={index}
                            href={social.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="contact-social-link"
                          >
                            <div
                              className="contact-social-link-icon"
                              style={{ background: social.gradient || social.bgColor }}
                            >
                              <Icon />
                            </div>
                            <div className="contact-social-link-text">
                              <p>{social.label}</p>
                              <p>{social.handle}</p>
                            </div>
                            <ArrowRight className="contact-social-link-arrow" />
                          </motion.a>
                        );
                      })}
                    </div>

                    <div className="contact-social-footer">
                      <p>Join our community of 50,000+ travelers</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="contact-divider">
        <hr />
      </div>

      {/* FAQs Section */}
      <div className="contact-faq">
        <div className="contact-faq-bg">
          <div className="contact-faq-bg-glow top-left" />
          <div className="contact-faq-bg-glow bottom-right" />
        </div>

        <div className="contact-faq-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="contact-faq-header"
          >
            <h2>Frequently Asked <span>Questions</span></h2>
            <p>Find quick answers to common questions about our services and travel packages.</p>
          </motion.div>

          <div className="contact-faq-list">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`contact-faq-item ${expandedFaq === index ? 'expanded' : ''}`}
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="contact-faq-question"
                >
                  <div className="contact-faq-question-content">
                    <div className="contact-faq-number">
                      <span>{String(index + 1).padStart(2, '0')}</span>
                    </div>
                    <span className="contact-faq-question-text">{faq.question}</span>
                  </div>
                  <motion.div
                    animate={{ rotate: expandedFaq === index ? 90 : 0 }}
                    transition={{
                      duration: 0.4,
                      ease: [0.25, 0.1, 0.25, 1]
                    }}
                    className="contact-faq-toggle"
                  >
                    <ArrowRight />
                  </motion.div>
                </button>

                <div className="contact-faq-answer">
                  <div className="contact-faq-answer-inner">
                    <div className="contact-faq-answer-content">
                      <p>{faq.answer}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="contact-divider">
        <hr />
      </div>

      {/* Map Section */}
      <div className="contact-map">
        <div className="contact-map-bg">
          <div className="contact-map-bg-glow top-right" />
          <div className="contact-map-bg-glow bottom-left" />
        </div>

        <div className="contact-map-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="contact-map-header"
          >
            <h2>Find Us <span>Here</span></h2>
            <p>Visit our headquarters in New Town, Kolkata</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="contact-map-wrapper"
          >
            <div className="contact-map-frame-border" />
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3683.9!2d88.4611489!3d22.6189545!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f89f7338f5c68d%3A0x6f7edcc17b96fef0!2sP%20S%20ABACUS!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Office Location"
              className="contact-map-frame"
            />

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="contact-map-card"
            >
              <div className="contact-map-card-content">
                <div className="contact-map-card-icon">
                  <Building />
                </div>
                <div>
                  <h4>Headquarters</h4>
                  <p>{contactInfo.address}</p>
                  <a
                    href="https://maps.app.goo.gl/pzDyzQL3kNtCh2Ur8"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Get Directions
                    <ArrowRight />
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="contact-cta">
        <div className="contact-cta-bg" />
        <div className="contact-cta-overlay" />

        <div className="contact-cta-decorations">
          <motion.div
            animate={{ x: [0, 100, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 20, repeat: Infinity }}
            className="contact-cta-glow top-left"
          />
          <motion.div
            animate={{ x: [0, -80, 0], y: [0, 60, 0], scale: [1.2, 1, 1.2] }}
            transition={{ duration: 25, repeat: Infinity }}
            className="contact-cta-glow bottom-right"
          />
        </div>

        <div className="contact-cta-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="contact-cta-content"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", delay: 0.2 }}
              className="contact-cta-icon"
            >
              <Headphones />
            </motion.div>

            <h2>Need Immediate Assistance?</h2>
            <p>Our travel experts are standing by to help you plan your perfect trip. Call us now for personalized assistance.</p>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="contact-cta-buttons"
            >
              <motion.a
                variants={cardVariants}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.98 }}
                href={`tel:${contactInfo.phone}`}
                className="contact-cta-btn primary"
              >
                <Phone />
                <span>Call Now</span>
              </motion.a>

              <motion.a
                variants={cardVariants}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.98 }}
                href="https://wa.me/919007000777"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-cta-btn whatsapp"
              >
                <MessageSquare />
                <span>WhatsApp Us</span>
              </motion.a>

              <motion.a
                variants={cardVariants}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.98 }}
                href={`mailto:${contactInfo.email}`}
                className="contact-cta-btn secondary"
              >
                <Mail />
                <span>Email Us</span>
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
