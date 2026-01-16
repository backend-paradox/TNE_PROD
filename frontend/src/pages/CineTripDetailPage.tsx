import { useState, useRef, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Film,
  Star,
  User,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Clock,
  Users,
  Phone,
  Mail,
  Play,
  Camera,
  Video,
  ArrowRight,
  Sparkles,
  MapPin,
  Loader2,
  MessageCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getMediaUrl } from '@/utils';
import { useCineTripPackage, useCineTripPackages } from '@/hooks/usePackages';
import { CineTripPackage, CineTripReview, ReviewStats, cineTripPackagesAPI } from '@/services/packageService';
import { useAppSelector } from '@/store/hooks';
import ReviewForm from '@/components/ReviewForm';
import ReviewList from '@/components/ReviewList';
import './CineTripDetailPage.css';

// Fallback image for when images fail to load
const FALLBACK_IMAGE = '/assets/images/fallback/fallback_travel_02.jpeg';

// Image error handler
const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  e.currentTarget.src = getMediaUrl(FALLBACK_IMAGE);
};

// Default detail data for CineTrip services (extends API data)
const defaultServiceDetails = {
  images: [
    'https://images.unsplash.com/photo-1727420517799-19be7ad1ed83?w=800&h=600&q=80&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&h=600&q=80&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=600&q=80&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&q=80&fit=crop&auto=format',
  ],
  videoUrl: '', // Service-specific video URL (to be added per service)
  rating: 4.8,
  reviewCount: 856,
  host: 'TripAndEvent Films',
  originalPrice: 55999,
  teamSize: '2-3 Professionals',
  deliverables: [
    '10-15 minute cinematic film',
    '50+ edited photographs',
    'Behind-the-scenes footage',
    'Social media reels (3-5)',
    'USB drive with all raw footage',
  ],
  equipment: [
    '4K Cinema Cameras',
    'Professional Drones',
    'Gimbal Stabilizers',
    'Premium Audio Equipment',
    'Lighting Kit',
    'Multiple Lens Options',
  ],
  process: [
    {
      step: 1,
      title: 'Consultation & Planning',
      activities: [
        'Initial video call to understand your vision',
        'Location scouting and shot planning',
        'Timeline and schedule coordination',
        'Equipment and team selection',
      ],
    },
    {
      step: 2,
      title: 'Pre-Production',
      activities: [
        'Finalize shooting schedule',
        'Prepare equipment and backup gear',
        'Coordinate with local contacts',
        'Weather and lighting assessment',
      ],
    },
    {
      step: 3,
      title: 'Production (Your Trip)',
      activities: [
        'Professional team accompanies you',
        'Capture candid and directed shots',
        'Drone footage at scenic locations',
        'Daily backup of all footage',
      ],
    },
    {
      step: 4,
      title: 'Post-Production',
      activities: [
        'Professional color grading',
        'Music selection and licensing',
        'Editing and transitions',
        'Review and revisions',
        'Final delivery (2-3 weeks)',
      ],
    },
  ],
  inclusions: [
    'Professional videographer and photographer team',
    'All professional equipment and gear',
    'Drone footage and aerial shots',
    'Professional editing and color grading',
    'Licensed background music',
    'Multiple revision rounds',
    'USB drive with final deliverables',
    'Social media optimized content',
  ],
  exclusions: [
    'Travel and accommodation for the team',
    'Special permits for restricted locations',
    'Extended shooting hours beyond schedule',
    'Additional copies of physical media',
    'Rush delivery (available at extra cost)',
    'Celebrity appearances or special guests',
  ],
  faqs: [
    {
      question: 'How far in advance should I book?',
      answer: 'We recommend booking at least 4-6 weeks in advance for domestic shoots and 8-10 weeks for international destinations. This allows adequate time for planning, permits, and coordination.',
    },
    {
      question: 'Can I choose the music for my film?',
      answer: 'Yes! We offer a selection of licensed tracks for you to choose from, or we can work with your song preferences. If you have a specific licensed track in mind, additional licensing fees may apply.',
    },
    {
      question: 'How long will it take to receive the final video?',
      answer: 'Standard delivery is 2-3 weeks after your trip. Rush delivery (additional charges apply) can reduce this to 7-10 days. You will receive preview clips within 48 hours of your shoot.',
    },
    {
      question: 'What if the weather is bad during our shoot?',
      answer: 'Our team is experienced in adapting to various conditions. We often capture stunning footage in challenging weather. If conditions are unsafe, we will reschedule affected portions at no extra cost.',
    },
    {
      question: 'Do you travel internationally?',
      answer: 'Yes, we cover destinations worldwide. International shoots require additional travel and accommodation costs for the team, which will be quoted separately based on the destination.',
    },
  ],
  reviews: [
    {
      id: '1',
      user: 'Ananya Krishnan',
      avatar: '/assets/images/avatars/avatar_female_01.png',
      rating: 5,
      comment: 'Absolutely magical! The team captured our Ladakh trip in a way that brings tears to my eyes every time I watch it. Worth every rupee!',
      date: '2024-02-15',
    },
    {
      id: '2',
      user: 'Vikram Mehta',
      avatar: '/assets/images/avatars/avatar_male_01.png',
      rating: 5,
      comment: 'Professional, creative, and incredibly talented. Our family trip to Kerala looks like a Netflix documentary. Highly recommend!',
      date: '2024-02-10',
    },
    {
      id: '3',
      user: 'Priya Reddy',
      avatar: '/assets/images/avatars/avatar_female_01.png',
      rating: 4,
      comment: 'Great experience overall. The drone shots were spectacular. Only wish we had more time in post-production for revisions.',
      date: '2024-02-05',
    },
  ],
  ratingBreakdown: {
    creativity: 4.9,
    professionalism: 4.8,
    quality: 4.9,
    valueForMoney: 4.6,
    communication: 4.8,
  },
  starDistribution: {
    5: 780,
    4: 76,
    3: 0,
    2: 0,
    1: 0,
  },
  totalRatings: 856,
};

// Map API CineTripPackage to service detail format
const mapCineTripToServiceDetail = (pkg: CineTripPackage) => ({
  id: pkg.id,
  packageId: pkg.packageId,
  slug: pkg.slug,
  title: pkg.name,
  description: pkg.longDescription || pkg.shortDescription,
  shortDescription: pkg.shortDescription,
  images: pkg.image ? [pkg.image, ...defaultServiceDetails.images.slice(1)] : defaultServiceDetails.images,
  videoUrl: defaultServiceDetails.videoUrl,
  category: pkg.category,
  rating: pkg.rating || 0,
  reviewCount: pkg.reviewCount || 0,
  host: defaultServiceDetails.host,
  price: Number(pkg.price),
  originalPrice: Math.round(Number(pkg.price) * 1.2), // 20% higher as original
  duration: pkg.duration,
  teamSize: defaultServiceDetails.teamSize,
  deliverables: pkg.features?.length > 0 ? pkg.features : defaultServiceDetails.deliverables,
  equipment: defaultServiceDetails.equipment,
  process: defaultServiceDetails.process,
  inclusions: defaultServiceDetails.inclusions,
  exclusions: defaultServiceDetails.exclusions,
  faqs: defaultServiceDetails.faqs,
  ratingBreakdown: defaultServiceDetails.ratingBreakdown,
});

// Map API CineTripPackage to related service card format
const mapCineTripToRelatedCard = (pkg: CineTripPackage) => ({
  id: pkg.id,
  name: pkg.name,
  slug: pkg.slug,
  image: pkg.image || 'https://images.unsplash.com/photo-1727420517799-19be7ad1ed83?w=400&h=300&q=80&fit=crop&auto=format',
  tagline: pkg.shortDescription,
  price: pkg.priceDisplay,
  category: pkg.category,
  popular: pkg.popular,
  tripTypes: pkg.features?.slice(0, 3) || ['Film', 'Cinematic', 'Professional'],
});

type TabType = 'overview' | 'process' | 'inclusions' | 'faqs';

export function CineTripDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewForm, setReviewForm] = useState({ name: '', email: '', review: '' });
  const contentRef = useRef<HTMLDivElement>(null);

  // Reviews state
  const [reviews, setReviews] = useState<CineTripReview[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats>({
    averageRating: 0,
    totalReviews: 0,
    starDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Fetch CineTrip package from API
  const { data: apiPackage, loading, error } = useCineTripPackage(slug || '');

  // Fetch related packages (excluding current one)
  const { data: allPackages } = useCineTripPackages();

  // Redux hooks for auth
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  // Contact phone number
  const contactPhone = '+919007000777';
  const contactPhoneDisplay = '+91 900 700 0777';

  // Handle Call button click
  const handleCallClick = () => {
    window.location.href = `tel:${contactPhone}`;
  };

  // Handle WhatsApp button click
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      `Hi! I'm interested in the ${serviceData?.title} service. I'd like to know more about pricing and availability.`
    );
    window.open(`https://wa.me/${contactPhone}?text=${message}`, '_blank');
  };

  // Map API data to service detail format
  const serviceData = useMemo(() => {
    if (apiPackage) {
      return mapCineTripToServiceDetail(apiPackage);
    }
    return null;
  }, [apiPackage]);

  // Get related services (exclude current package)
  const relatedServices = useMemo(() => {
    return allPackages
      .filter(pkg => pkg.slug !== slug)
      .slice(0, 4)
      .map(mapCineTripToRelatedCard);
  }, [allPackages, slug]);

  // Fetch reviews when slug changes
  const fetchReviews = async () => {
    if (!slug) return;

    try {
      setReviewsLoading(true);
      const { reviews: fetchedReviews, stats } = await cineTripPackagesAPI.getReviews(slug);
      setReviews(fetchedReviews);
      setReviewStats(stats);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      toast.error('Failed to load reviews');
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [slug]);

  // Handle review submission success
  const handleReviewSubmitted = () => {
    // Refetch reviews to show the new one
    fetchReviews();
    toast.success('Thank you for your review!');
  };

  // Handle marking review as helpful
  const handleMarkHelpful = async (reviewId: string) => {
    try {
      await cineTripPackagesAPI.markReviewHelpful(reviewId);
      // Update the local review state
      setReviews(prevReviews =>
        prevReviews.map(review =>
          review.id === reviewId
            ? { ...review, helpful: review.helpful + 1 }
            : review
        )
      );
      toast.success('Thank you for your feedback!');
    } catch (err) {
      console.error('Error marking review as helpful:', err);
      toast.error('Failed to mark review as helpful');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="cinetrip-detail-page">
        <div className="loading-container" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 className="loading-spinner" style={{ width: 48, height: 48, animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '1rem', color: '#64748b' }}>Loading service details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !serviceData) {
    return (
      <div className="cinetrip-detail-page">
        <div className="error-container" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
          <Film style={{ width: 64, height: 64, color: '#e2e8f0', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem' }}>Service Not Found</h2>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>The CineTrip service you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/cinetrip-experiences"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#14b8a6',
              color: 'white',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: 500
            }}
          >
            Browse All Services
            <ArrowRight style={{ width: 16, height: 16 }} />
          </Link>
        </div>
      </div>
    );
  }

  const tabs: { id: TabType; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'process', label: 'Our Process' },
    { id: 'inclusions', label: "What's Included" },
    { id: 'faqs', label: 'FAQs' },
  ];

  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId);
    setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === serviceData.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? serviceData.images.length - 1 : prev - 1
    );
  };

  return (
    <div className="cinetrip-detail-page">
      {/* Video Modal */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="cinetrip-video-modal"
            onClick={() => setIsVideoModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="cinetrip-video-container"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <iframe
                src={serviceData.videoUrl}
                title="Service Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="cinetrip-video-close"
              >
                <X />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-Width Hero Section */}
      <section className="cinetrip-hero">
        <div className="cinetrip-hero-image-wrapper">
          <motion.img
            key={currentImageIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            src={serviceData.images[currentImageIndex]}
            alt={serviceData.title}
            onError={handleImageError}
            className="cinetrip-hero-image"
          />

          {/* Gradient Overlay */}
          <div className="cinetrip-hero-overlay" />

          {/* Navigation Arrows */}
          <button
            onClick={prevImage}
            className="cinetrip-nav-btn prev"
            aria-label="Previous image"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={nextImage}
            className="cinetrip-nav-btn next"
            aria-label="Next image"
          >
            <ChevronRight />
          </button>

          {/* Thumbnail Strip */}
          <div className="cinetrip-thumbs">
            {serviceData.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`cinetrip-thumb ${idx === currentImageIndex ? 'active' : ''}`}
              >
                <img src={img} alt="" onError={handleImageError} />
              </button>
            ))}
          </div>

          {/* Dots Indicator */}
          <div className="cinetrip-dots">
            {serviceData.images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`cinetrip-dot ${idx === currentImageIndex ? 'active' : ''}`}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>

          {/* Video Play Button */}
          <button
            onClick={() => setIsVideoModalOpen(true)}
            className="cinetrip-video-play-btn"
            aria-label="Play video"
          >
            <Play fill="white" />
          </button>
        </div>
      </section>

      {/* Service Info Card */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="cinetrip-info-section"
      >
        <div className="cinetrip-info-card">
          {/* Top Row: Actions */}
          <div className="cinetrip-actions-row">
            <button className="cinetrip-share-btn">
              <Share2 />
              Share
            </button>
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={`cinetrip-wishlist-btn ${isWishlisted ? 'active' : ''}`}
            >
              <Heart fill={isWishlisted ? '#ef4444' : 'none'} />
            </button>
          </div>

          {/* Title Section */}
          <div className="cinetrip-title-section">
            <div className="cinetrip-category-badge">
              <Film />
              <span>{serviceData.category}</span>
            </div>
            <h1 className="cinetrip-title">{serviceData.title}</h1>
            <p className="cinetrip-short-desc">{serviceData.shortDescription}</p>
          </div>

          {/* Meta Info Row */}
          <div className="cinetrip-meta-row">
            <div className="cinetrip-meta-badge">
              <Star fill="#f59e0b" strokeWidth={0} />
              <span className="rating-value">{serviceData.rating}</span>
              <span className="rating-count">({serviceData.reviewCount.toLocaleString()} reviews)</span>
            </div>
            <div className="cinetrip-meta-badge">
              <Clock />
              <span>{serviceData.duration}</span>
            </div>
            <div className="cinetrip-meta-badge">
              <Users />
              <span>{serviceData.teamSize}</span>
            </div>
            <div className="cinetrip-meta-badge">
              <User />
              <span>{serviceData.host}</span>
            </div>
          </div>

          {/* CTA - Call & WhatsApp */}
          <div className="cinetrip-cta-section">
            <p className="cinetrip-price-note">
              * Pricing customized based on your requirements
            </p>
            <div className="cinetrip-cta-buttons-row">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="cinetrip-cta-btn primary"
                onClick={handleCallClick}
              >
                <Phone size={18} />
                Inquire
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="cinetrip-cta-btn secondary"
                onClick={handleWhatsAppClick}
              >
                <MessageCircle size={18} />
                WhatsApp
              </motion.button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Tabs Navigation */}
      <div className="cinetrip-tabs-nav">
        <div className="cinetrip-tabs-container">
          <div className="cinetrip-tabs-list scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`cinetrip-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div ref={contentRef} className="cinetrip-content-area">
        <div className="cinetrip-content-wrapper">
          <div className="cinetrip-main-content">
            <AnimatePresence mode="wait">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="cinetrip-tab-content"
                >
                  {/* Description Section */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="cinetrip-section large"
                  >
                    <div className="cinetrip-section-header">
                      <div className="cinetrip-section-header-inner">
                        <div className="cinetrip-section-accent" />
                        <h2 className="cinetrip-section-title">About This Service</h2>
                      </div>
                    </div>

                    <div className="cinetrip-description-box">
                      <p className="cinetrip-description-text">
                        {showFullDescription
                          ? serviceData.description
                          : serviceData.description.slice(0, 250) + '...'}
                      </p>

                      <motion.button
                        onClick={() => setShowFullDescription(!showFullDescription)}
                        whileHover={{ x: 4 }}
                        className="cinetrip-read-more-btn"
                      >
                        {showFullDescription ? 'Show Less' : 'Read More'}
                        <ArrowRight />
                      </motion.button>
                    </div>
                  </motion.section>

                  {/* Deliverables Section */}
                  <section className="cinetrip-section">
                    <h3 className="cinetrip-section-subtitle">What You'll Receive</h3>
                    <div className="cinetrip-highlights-grid">
                      {serviceData.deliverables.map((item, idx) => (
                        <div key={idx} className="cinetrip-highlight-item">
                          <div className="cinetrip-highlight-icon">
                            <Sparkles />
                          </div>
                          <span className="cinetrip-highlight-text">{item}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Equipment Section */}
                  <section className="cinetrip-section">
                    <h3 className="cinetrip-section-subtitle">Professional Equipment</h3>
                    <div className="cinetrip-equipment-grid">
                      {serviceData.equipment.map((item, idx) => (
                        <div key={idx} className="cinetrip-equipment-item">
                          <Camera />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                </motion.div>
              )}

              {/* Process Tab */}
              {activeTab === 'process' && (
                <motion.div
                  key="process"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="cinetrip-tab-content"
                >
                  <section className="cinetrip-section large">
                    <h2 className="cinetrip-process-title">How It Works</h2>
                    <p className="cinetrip-process-subtitle">Our streamlined process ensures a smooth experience from start to finish</p>

                    <div className="cinetrip-process-list">
                      {serviceData.process.map((step, idx) => (
                        <div key={idx} className="cinetrip-process-item">
                          <button
                            onClick={() => setExpandedStep(expandedStep === idx ? null : idx)}
                            className={`cinetrip-process-header ${expandedStep === idx ? 'expanded' : ''}`}
                          >
                            <div className="cinetrip-process-header-left">
                              <span className="cinetrip-step-number">{step.step}</span>
                              <span className="cinetrip-step-title">{step.title}</span>
                            </div>
                            {expandedStep === idx ? (
                              <ChevronUp className="cinetrip-process-icon" />
                            ) : (
                              <ChevronDown className="cinetrip-process-icon" />
                            )}
                          </button>
                          <AnimatePresence>
                            {expandedStep === idx && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="cinetrip-process-content-wrapper"
                              >
                                <div className="cinetrip-process-content">
                                  <ul className="cinetrip-activity-list">
                                    {step.activities.map((activity, aIdx) => (
                                      <li key={aIdx} className="cinetrip-activity-item">
                                        <span className="cinetrip-activity-dot" />
                                        {activity}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Contact Section */}
                  <section className="cinetrip-section">
                    <h3 className="cinetrip-section-subtitle">Ready to Start?</h3>
                    <div className="cinetrip-contact-list">
                      <div className="cinetrip-contact-item">
                        <div className="cinetrip-contact-icon-wrapper">
                          <Phone />
                        </div>
                        <div>
                          <p className="cinetrip-contact-label">Call us</p>
                          <p className="cinetrip-contact-value">+91 900 700 0777</p>
                        </div>
                      </div>
                      <div className="cinetrip-contact-item">
                        <div className="cinetrip-contact-icon-wrapper">
                          <Mail />
                        </div>
                        <div>
                          <p className="cinetrip-contact-label">Email us</p>
                          <p className="cinetrip-contact-value">cinetrip@tripandevent.com</p>
                        </div>
                      </div>
                    </div>
                  </section>
                </motion.div>
              )}

              {/* Inclusions Tab */}
              {activeTab === 'inclusions' && (
                <motion.div
                  key="inclusions"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="cinetrip-inclusions-grid">
                    {/* Inclusions */}
                    <section className="cinetrip-section">
                      <h3 className="cinetrip-inclusions-title included">
                        <div className="cinetrip-inclusions-icon-wrapper included">
                          <Check />
                        </div>
                        What's Included
                      </h3>
                      <ul className="cinetrip-inclusions-list">
                        {serviceData.inclusions.map((item, idx) => (
                          <li key={idx} className="cinetrip-inclusion-item included">
                            <Check className="cinetrip-inclusion-check included" />
                            <span className="cinetrip-inclusion-text">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </section>

                    {/* Exclusions */}
                    <section className="cinetrip-section">
                      <h3 className="cinetrip-inclusions-title excluded">
                        <div className="cinetrip-inclusions-icon-wrapper excluded">
                          <X />
                        </div>
                        What's Not Included
                      </h3>
                      <ul className="cinetrip-inclusions-list">
                        {serviceData.exclusions.map((item, idx) => (
                          <li key={idx} className="cinetrip-inclusion-item excluded">
                            <X className="cinetrip-inclusion-check excluded" />
                            <span className="cinetrip-inclusion-text">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  </div>
                </motion.div>
              )}

              {/* FAQs Tab */}
              {activeTab === 'faqs' && (
                <motion.div
                  key="faqs"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <section className="cinetrip-section large">
                    <h2 className="cinetrip-faq-title">Frequently Asked Questions</h2>
                    <div className="cinetrip-faq-list">
                      {serviceData.faqs.map((faq, idx) => (
                        <div key={idx} className="cinetrip-faq-item">
                          <button
                            onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                            className={`cinetrip-faq-header ${expandedFaq === idx ? 'expanded' : ''}`}
                          >
                            <span className="cinetrip-faq-question">{faq.question}</span>
                            {expandedFaq === idx ? (
                              <ChevronUp className="cinetrip-faq-icon" />
                            ) : (
                              <ChevronDown className="cinetrip-faq-icon" />
                            )}
                          </button>
                          <AnimatePresence initial={false}>
                            {expandedFaq === idx && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{
                                  height: 'auto',
                                  opacity: 1,
                                  transition: {
                                    height: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
                                    opacity: { duration: 0.3, delay: 0.1, ease: 'easeOut' }
                                  }
                                }}
                                exit={{
                                  height: 0,
                                  opacity: 0,
                                  transition: {
                                    height: { duration: 0.3, ease: [0.4, 0, 0.6, 1] },
                                    opacity: { duration: 0.2, ease: 'easeIn' }
                                  }
                                }}
                                style={{ overflow: 'hidden' }}
                                className="cinetrip-faq-content-wrapper"
                              >
                                <motion.div
                                  initial={{ y: -10 }}
                                  animate={{ y: 0 }}
                                  exit={{ y: -10 }}
                                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                                  className="cinetrip-faq-content"
                                >
                                  <p className="cinetrip-faq-answer">{faq.answer}</p>
                                </motion.div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </section>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="cinetrip-reviews-section">
        <div className="cinetrip-reviews-container">
          <div className="cinetrip-reviews-header">
            <h2 className="cinetrip-reviews-title">Reviews & Ratings</h2>
            <p className="cinetrip-reviews-subtitle">
              See what our clients are saying about this service
            </p>
          </div>

          {reviewsLoading ? (
            <div className="loading-container" style={{ padding: '4rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Loader2 className="loading-spinner" style={{ width: 32, height: 32, animation: 'spin 1s linear infinite' }} />
              <p style={{ marginTop: '1rem', color: '#64748b' }}>Loading reviews...</p>
            </div>
          ) : (
            <>
              {/* Review List */}
              <ReviewList
                reviews={reviews}
                stats={reviewStats}
                onMarkHelpful={handleMarkHelpful}
              />

              {/* Review Form */}
              <div style={{ marginTop: '2rem' }}>
                <ReviewForm
                  packageSlug={slug || ''}
                  onReviewSubmitted={handleReviewSubmitted}
                />
              </div>
            </>
          )}
        </div>
      </section>

      {/* Related Services Grid */}
      <section className="cinetrip-related-section">
        <div className="cinetrip-related-container">
          <div className="section-header">
            <div className="section-icon-box">
              <Film />
            </div>
            <h2 className="section-title section-title--italic">Related CineTrip Services</h2>
            <p className="section-subtitle">
              Explore more ways to capture your special moments
            </p>
            <Link to="/cinetrip-experiences" className="section-action-btn">
              <span>View All Services</span>
              <ArrowRight />
            </Link>
          </div>

          <div className="cinetrip-related-grid">
            {relatedServices.map((service, index) => (
              <Link
                to={`/cinetrip/${service.slug}`}
                key={service.id}
                className="cinetrip-related-card"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="cinetrip-related-card-image">
                  <img
                    src={service.image}
                    alt={service.name}
                    onError={handleImageError}
                  />
                  <div className="cinetrip-related-card-overlay"></div>

                  {service.popular && (
                    <div className="cinetrip-related-badge">
                      <Sparkles />
                      <span>Popular</span>
                    </div>
                  )}

                  <div className="cinetrip-related-category-badge">
                    {service.category}
                  </div>

                  <div className="cinetrip-related-card-content">
                    <h4 className="cinetrip-related-card-name">{service.name}</h4>
                    <p className="cinetrip-related-card-tagline">{service.tagline}</p>
                  </div>
                </div>

                <div className="cinetrip-related-card-body">
                  <div className="cinetrip-related-trip-types">
                    {service.tripTypes.map((type, idx) => (
                      <span key={idx} className="cinetrip-related-trip-type-tag">
                        {type}
                      </span>
                    ))}
                  </div>

                  <div className="cinetrip-related-card-footer">
                    <div>
                      <p className="cinetrip-related-price-label">Pricing</p>
                      <p className="cinetrip-related-price custom">Custom Quote</p>
                    </div>
                    <span className="cinetrip-related-explore-btn">
                      View Details
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
