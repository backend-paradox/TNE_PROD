import { useEffect, useState } from 'react';
import {
  Briefcase,
  MapPin,
  Clock,
  Users,
  Heart,
  Coffee,
  TrendingUp,
  Send,
  ChevronRight,
  Sparkles,
  Award,
  CheckCircle,
  Globe,
  Building2,
} from 'lucide-react';
import './CareersPage.css';

interface JobListing {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  description: string;
  requirements: string[];
  isNew?: boolean;
  gender?: string;
  workMode: 'On-site' | 'Hybrid' | 'Remote';
}

const jobListings: JobListing[] = [
  {
    id: '1',
    title: 'Digital & Social Media Marketing',
    department: 'Marketing',
    location: 'Kolkata, India',
    type: 'Full-time',
    experience: '1-3 years',
    workMode: 'On-site',
    description: 'Join our marketing team to create engaging social media content and drive brand awareness across digital platforms.',
    requirements: [
      'Experience with Instagram, Facebook, YouTube & LinkedIn',
      'Content creation and copywriting skills',
      'Knowledge of social media analytics tools',
      'Creative mindset with attention to detail',
    ],
    isNew: true,
    gender: 'Female',
  },
];

const benefits = [
  {
    icon: TrendingUp,
    title: 'Growth Opportunities',
    description: 'Fast-track your career with continuous learning and development programs.',
  },
  {
    icon: Heart,
    title: 'Health Benefits',
    description: 'Comprehensive health insurance coverage for you and your family.',
  },
  {
    icon: Coffee,
    title: 'Work-Life Balance',
    description: 'Flexible working hours and a supportive work environment.',
  },
  {
    icon: Globe,
    title: 'Travel Perks',
    description: 'Exclusive travel discounts and opportunities to explore new destinations.',
  },
  {
    icon: Users,
    title: 'Great Team',
    description: 'Work with passionate professionals who share your love for travel.',
  },
  {
    icon: Award,
    title: 'Recognition',
    description: 'Your contributions are valued and rewarded with performance bonuses.',
  },
];

export default function CareersPage() {
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const openJobModal = (job: JobListing) => {
    setSelectedJob(job);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
    document.body.style.overflow = 'unset';
  };

  return (
    <div className="careers-page">
      {/* Hero Section */}
      <section className="careers-hero">
        <div className="careers-hero-video-wrapper">
          <iframe
            className={`careers-hero-video ${videoLoaded ? 'loaded' : ''}`}
            src="https://www.youtube.com/embed/AIoDdXsQqdI?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=AIoDdXsQqdI&modestbranding=1&playsinline=1&disablekb=1"
            allow="autoplay; encrypted-media"
            allowFullScreen
            title="Careers at Trip & Event"
            onLoad={() => setTimeout(() => setVideoLoaded(true), 1500)}
          />
          <div className="careers-hero-video-overlay" />
        </div>
        <div className="careers-hero-container">
          <div className="careers-hero-content">
            <span className="careers-hero-badge">
              <Sparkles className="careers-hero-badge-icon" />
              Join Our Team
            </span>
            <h1 className="careers-hero-title">
              We're <span className="careers-hero-highlight">Hiring!</span>
            </h1>
            <p className="careers-hero-description">
              Be part of the World's First CineMatrip Brand. Join Trip & Event and help us create
              unforgettable cinematic travel experiences for travelers worldwide.
            </p>
            <div className="careers-hero-stats">
              <div className="careers-hero-stat">
                <span className="careers-hero-stat-number">{jobListings.length}+</span>
                <span className="careers-hero-stat-label">Open Positions</span>
              </div>
              <div className="careers-hero-stat">
                <span className="careers-hero-stat-number">50+</span>
                <span className="careers-hero-stat-label">Team Members</span>
              </div>
              <div className="careers-hero-stat">
                <span className="careers-hero-stat-number">100%</span>
                <span className="careers-hero-stat-label">Passion</span>
              </div>
            </div>
            <a href="#openings" className="careers-hero-cta">
              View Open Positions
              <ChevronRight className="careers-hero-cta-icon" />
            </a>
          </div>
        </div>
      </section>

      {/* Why Join Us Section */}
      <section className="careers-benefits">
        <div className="careers-benefits-container">
          <div className="careers-benefits-header">
            <h2 className="careers-benefits-title">Why Join Trip & Event?</h2>
            <p className="careers-benefits-subtitle">
              We offer more than just a job — we offer a journey of growth, creativity, and adventure.
            </p>
          </div>
          <div className="careers-benefits-grid">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="careers-benefit-card">
                  <div className="careers-benefit-icon">
                    <Icon />
                  </div>
                  <h3 className="careers-benefit-title">{benefit.title}</h3>
                  <p className="careers-benefit-description">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Job Openings Section */}
      <section id="openings" className="careers-openings">
        <div className="careers-openings-container">
          <div className="careers-openings-header">
            <h2 className="careers-openings-title">Open Positions</h2>
            <p className="careers-openings-subtitle">
              Find your perfect role and start your journey with us today.
            </p>
          </div>
          <div className="careers-jobs-grid">
            {jobListings.map((job) => (
              <div key={job.id} className="careers-job-card">
                {job.isNew && <span className="careers-job-badge">New</span>}
                <div className="careers-job-header">
                  <div className="careers-job-icon">
                    <Briefcase />
                  </div>
                  <span className="careers-job-department">{job.department}</span>
                </div>
                <h3 className="careers-job-title">
                  {job.title}
                  {job.gender && <span className="careers-job-gender">({job.gender})</span>}
                </h3>
                <p className="careers-job-description">{job.description}</p>
                <div className="careers-job-meta">
                  <span className="careers-job-meta-item">
                    <MapPin className="careers-job-meta-icon" />
                    {job.location}
                  </span>
                  <span className="careers-job-meta-item">
                    <Clock className="careers-job-meta-icon" />
                    {job.type}
                  </span>
                  <span className="careers-job-meta-item">
                    <TrendingUp className="careers-job-meta-icon" />
                    {job.experience}
                  </span>
                  <span className={`careers-job-workmode careers-job-workmode-${job.workMode.toLowerCase().replace('-', '')}`}>
                    <Building2 className="careers-job-meta-icon" />
                    {job.workMode}
                  </span>
                </div>
                <button
                  className="careers-job-apply-btn"
                  onClick={() => openJobModal(job)}
                >
                  View Details
                  <ChevronRight className="careers-job-apply-icon" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="careers-cta">
        <div className="careers-cta-container">
          <div className="careers-cta-content">
            <h2 className="careers-cta-title">Don't See Your Role?</h2>
            <p className="careers-cta-description">
              We're always looking for talented individuals. Send us your resume and we'll keep you in mind for future opportunities.
            </p>
            <a href="mailto:careers@tripandevent.com" className="careers-cta-btn">
              <Send className="careers-cta-btn-icon" />
              Send Your Resume
            </a>
          </div>
        </div>
      </section>

      {/* Job Detail Modal */}
      {isModalOpen && selectedJob && (
        <div className="careers-modal-overlay" onClick={closeModal}>
          <div className="careers-modal" onClick={(e) => e.stopPropagation()}>
            <button className="careers-modal-close" onClick={closeModal}>
              &times;
            </button>
            <div className="careers-modal-header">
              {selectedJob.isNew && <span className="careers-job-badge">New Opening</span>}
              <h2 className="careers-modal-title">
                {selectedJob.title}
                {selectedJob.gender && <span className="careers-job-gender"> ({selectedJob.gender})</span>}
              </h2>
              <div className="careers-modal-meta">
                <span><MapPin /> {selectedJob.location}</span>
                <span><Clock /> {selectedJob.type}</span>
                <span><TrendingUp /> {selectedJob.experience}</span>
                <span className={`careers-modal-workmode careers-job-workmode-${selectedJob.workMode.toLowerCase().replace('-', '')}`}>
                  <Building2 /> {selectedJob.workMode}
                </span>
              </div>
            </div>
            <div className="careers-modal-body">
              <div className="careers-modal-section">
                <h3>About the Role</h3>
                <p>{selectedJob.description}</p>
              </div>
              <div className="careers-modal-section">
                <h3>Requirements</h3>
                <ul className="careers-modal-requirements">
                  {selectedJob.requirements.map((req, index) => (
                    <li key={index}>
                      <CheckCircle className="careers-modal-check" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="careers-modal-footer">
              <a
                href={`mailto:careers@tripandevent.com?subject=Application for ${selectedJob.title}`}
                className="careers-modal-apply-btn"
              >
                <Send />
                Apply Now
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
