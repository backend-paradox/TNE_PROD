import { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
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
  Calendar,
  Users,
  Phone,
  Mail,
  Play,
  Bookmark,
  ArrowRight,
  TrendingUp,
  Loader2,
  ShoppingCart,
  MessageCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getMediaUrl } from '@/utils';
import { useTourPackage, useInternationalPackages } from '@/hooks/usePackages';
import { tourPackagesAPI, TourReview, ReviewStats } from '@/services/packageService';
import { useWishlist } from '@/hooks';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { addToCart, addToCartAsync } from '@/store/slices/cartSlice';
import { setTrip } from '@/store/slices/bookingSlice';
import './PackageDetailPage.css';

// Fallback image for when images fail to load
const FALLBACK_IMAGE = '/assets/images/fallback/fallback_travel_02.jpeg';

// Image error handler
const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  e.currentTarget.src = getMediaUrl(FALLBACK_IMAGE);
};

// Sample package data (API-ready structure)
const samplePackage = {
  id: '1',
  slug: 'kashmir-paradise-tour',
  title: 'Kashmir Paradise Tour',
  description: 'Overlooking the greenery of the surrounding mountains, this premium Kashmir tour package takes you through the most scenic destinations. Experience the beauty of Dal Lake, Gulmarg, Pahalgam, and Sonmarg with comfortable stays and guided tours. Our expert guides will take you through hidden gems and local favorites, ensuring an authentic Kashmir experience that you will cherish forever.',
  shortDescription: 'Experience the breathtaking beauty of Kashmir with our premium 7-day tour package featuring houseboats, Shikara rides, and mountain adventures.',
  images: [
    '/assets/images/destinations/domestic/north-india/kashmir/kashmir_valley_01.jpeg',
    '/assets/images/destinations/domestic/north-india/kashmir/kashmir_lake_02.jpeg',
    '/assets/images/destinations/domestic/north-india/kashmir/kashmir_mountains_03.jpeg',
    '/assets/images/fallback/fallback_nature_01.jpeg',
  ],
  videoUrl: '', // Package-specific video URL (to be added per package)
  location: 'Srinagar, Jammu & Kashmir',
  country: 'India',
  rating: 4.9,
  reviewCount: 1390,
  host: 'TripAndEvent Travels',
  price: 45999,
  originalPrice: 55999,
  duration: '7 Days / 6 Nights',
  maxGroupSize: 15,
  facilities: [
    { icon: 'headphones', label: 'Virtual Reality (VR)' },
    { icon: 'usercheck', label: 'Tour Guide' },
    { icon: 'wifi', label: 'Free Wifi' },
    { icon: 'clock', label: '06:00 - 18:00' },
    { icon: 'coffee', label: 'Lounge bar & cafe' },
    { icon: 'car', label: 'Wide parking' },
  ],
  highlights: [
    'Shikara ride on Dal Lake',
    'Gondola ride in Gulmarg',
    'Visit to Mughal Gardens',
    'Stay in premium houseboats',
    'Local cuisine experience',
    'Pahalgam valley excursion',
  ],
  inclusions: [
    'Accommodation in 4-star hotels and houseboats',
    'Daily breakfast and dinner',
    'All sightseeing as per itinerary',
    'Airport pickup and drop',
    'Shikara ride on Dal Lake',
    'Gondola ride in Gulmarg (Phase 1)',
    'All applicable taxes',
    'Professional tour guide',
  ],
  exclusions: [
    'Airfare to and from Srinagar',
    'Personal expenses and tips',
    'Travel insurance',
    'Any meals not mentioned',
    'Adventure activities not in itinerary',
    'Camera fees at monuments',
  ],
  itinerary: [
    {
      day: 1,
      title: 'Arrival in Srinagar',
      activities: [
        'Arrive at Srinagar Airport',
        'Transfer to houseboat on Dal Lake',
        'Evening Shikara ride',
        'Overnight stay on houseboat',
      ],
    },
    {
      day: 2,
      title: 'Srinagar Local Sightseeing',
      activities: [
        'Visit Mughal Gardens - Nishat Bagh, Shalimar Bagh',
        'Explore Shankaracharya Temple',
        'Shopping at local markets',
        'Return to hotel',
      ],
    },
    {
      day: 3,
      title: 'Srinagar to Gulmarg',
      activities: [
        'Drive to Gulmarg (56 km)',
        'Gondola ride to Kongdoori',
        'Snow activities (seasonal)',
        'Explore meadows',
        'Overnight in Gulmarg',
      ],
    },
    {
      day: 4,
      title: 'Gulmarg to Pahalgam',
      activities: [
        'Drive to Pahalgam via Srinagar',
        'En route visit Saffron fields',
        'Explore Betaab Valley',
        'Evening at leisure by Lidder River',
        'Overnight in Pahalgam',
      ],
    },
    {
      day: 5,
      title: 'Pahalgam Excursion',
      activities: [
        'Visit Aru Valley',
        'Explore Chandanwari',
        'Horse riding (optional)',
        'Local market visit',
        'Overnight in Pahalgam',
      ],
    },
    {
      day: 6,
      title: 'Pahalgam to Srinagar',
      activities: [
        'Return to Srinagar',
        'Visit local handicraft centers',
        'Shopping for souvenirs',
        'Farewell dinner',
        'Overnight in Srinagar',
      ],
    },
    {
      day: 7,
      title: 'Departure',
      activities: [
        'Breakfast at hotel',
        'Transfer to Srinagar Airport',
        'Departure with sweet memories',
      ],
    },
  ],
  faqs: [
    {
      question: 'What is the best time to visit Kashmir?',
      answer: 'The best time to visit Kashmir is from March to October. Spring (March-May) offers blooming gardens, summer (June-August) is perfect for sightseeing, and autumn (September-October) displays beautiful fall colors.',
    },
    {
      question: 'Is it safe to travel to Kashmir?',
      answer: 'Yes, Kashmir is safe for tourists. The tourist areas like Srinagar, Gulmarg, and Pahalgam are well-connected and have good security. We recommend following local guidelines and staying updated with travel advisories.',
    },
    {
      question: 'What should I pack for the trip?',
      answer: 'Pack warm clothing even in summer as temperatures drop at night. Include comfortable walking shoes, sunscreen, sunglasses, and any personal medications. In winter, heavy woolens and snow gear are essential.',
    },
    {
      question: 'Are meals included in the package?',
      answer: 'Yes, daily breakfast and dinner are included. We offer both vegetarian and non-vegetarian options. Special dietary requirements can be accommodated with prior notice.',
    },
    {
      question: 'Can I customize this package?',
      answer: 'Absolutely! We can customize the itinerary based on your preferences, add extra days, upgrade accommodations, or include specific activities. Contact us for a personalized quote.',
    },
  ],
  reviews: [
    {
      id: '1',
      user: 'Priya Sharma',
      avatar: '/assets/images/avatars/avatar_female_01.png',
      rating: 5,
      comment: 'Amazing experience! The houseboats were beautiful and the guides were very knowledgeable. Kashmir truly is paradise on Earth.',
      date: '2024-01-15',
    },
    {
      id: '2',
      user: 'Rahul Verma',
      avatar: '/assets/images/avatars/avatar_male_01.png',
      rating: 5,
      comment: 'Well organized tour with excellent accommodations. The Shikara ride and Gulmarg gondola were highlights of our trip.',
      date: '2024-01-10',
    },
    {
      id: '3',
      user: 'Sneha Patel',
      avatar: '/assets/images/avatars/avatar_female_01.png',
      rating: 4,
      comment: 'Great trip overall. Food was delicious and the scenery was breathtaking. Only wish we had more time in Pahalgam.',
      date: '2024-01-05',
    },
  ],
  ratingBreakdown: {
    comfortable: 4.7,
    cleanliness: 4.8,
    facilities: 4.5,
    valueForMoney: 4.6,
    location: 4.9,
  },
  starDistribution: {
    5: 1250,
    4: 140,
    3: 0,
    2: 0,
    1: 0,
  },
  totalRatings: 1390,
  coordinates: {
    lat: 34.0837,
    lng: 74.7973,
  },
};

type TabType = 'overview' | 'location' | 'inclusions' | 'faqs';

export function PackageDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  // const [isVideoModalOpen, setIsVideoModalOpen] = useState(false); // Disabled for now
  const [newReviewRating, setNewReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewForm, setReviewForm] = useState({ name: '', email: '', review: '' });
  const contentRef = useRef<HTMLDivElement>(null);

  // Reviews state
  const [reviews, setReviews] = useState<TourReview[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats>({
    averageRating: 0,
    totalReviews: 0,
    starDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Fetch package by slug from API
  const { data: apiPackage, loading, error } = useTourPackage(slug || '');

  // Fetch international packages for "Must Visit Destinations" section
  const { data: internationalPackages } = useInternationalPackages();

  // Wishlist hook for heart icon functionality
  const { isSaved, toggleSave } = useWishlist();

  // Fetch reviews when package slug changes
  useEffect(() => {
    const fetchReviews = async () => {
      if (!slug) return;

      try {
        setLoadingReviews(true);
        console.log(`🔄 Fetching reviews for tour package: ${slug}`);

        const { reviews: fetchedReviews, stats } = await tourPackagesAPI.getReviews(slug);

        console.log(`✅ Fetched ${fetchedReviews.length} reviews for ${slug}`);
        console.log('📊 Review stats:', stats);

        setReviews(fetchedReviews);
        setReviewStats(stats);
      } catch (error) {
        console.error('❌ Error fetching reviews:', error);
        // Set empty reviews on error
        setReviews([]);
        setReviewStats({
          averageRating: 0,
          totalReviews: 0,
          starDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        });
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [slug]);

  // Handler for Must Visit section wishlist
  const handleMustVisitWishlist = (e: React.MouseEvent, pkg: any) => {
    e.preventDefault();
    e.stopPropagation();

    const isInWishlist = isSaved(pkg.slug);
    toggleSave(pkg.slug, {
      type: 'tour',
      name: pkg.name,
      slug: pkg.slug,
      image: pkg.imageUrl,
      price: Number(pkg.startingPrice) || 0,
      duration: pkg.duration,
      destination: pkg.country,
    });

    if (isInWishlist) {
      toast.success(`${pkg.name} removed from wishlist`, { icon: '💔' });
    } else {
      toast.success(`${pkg.name} added to wishlist`, { icon: '❤️' });
    }
  };

  // Redux hooks for cart and auth
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const { items: cartItems, synced: isCartSynced } = useAppSelector((state) => state.cart);

  // Handle Book Now button click
  const handleBookNow = () => {
    if (!isAuthenticated) {
      toast.error('Please login to book this package', {
        icon: '🔒',
        duration: 3000,
      });
      navigate(`/auth?type=login&redirect=/package/${slug}`);
      return;
    }

    if (!packageData) {
      toast.error('Package information not available');
      return;
    }

    // Transform package data to Trip format expected by booking slice
    const tripData = {
      id: packageData.id,
      title: packageData.title,
      slug: packageData.slug,
      destination: packageData.location.split(',')[0],
      country: packageData.country,
      images: packageData.images,
      thumbnail: packageData.images[0] || FALLBACK_IMAGE,
      duration: {
        days: parseInt(packageData.duration.match(/(\d+) Day/)?.[1] || '7'),
        nights: parseInt(packageData.duration.match(/(\d+) Night/)?.[1] || '6'),
      },
      price: {
        adult: packageData.price,
        child: Math.round(packageData.price * 0.7),
        infant: Math.round(packageData.price * 0.3),
        originalPrice: packageData.originalPrice,
        discount: packageData.originalPrice - packageData.price,
      },
      rating: packageData.rating,
      reviewCount: packageData.reviewCount,
      category: 'tour' as const,
      tripType: ['cultural'] as const,
      highlights: packageData.highlights,
      description: packageData.description,
      shortDescription: packageData.shortDescription,
      overview: packageData.shortDescription,
      inclusions: packageData.inclusions,
      exclusions: packageData.exclusions,
      itinerary: packageData.itinerary,
      startDates: [],
    };

    // Dispatch trip to booking state and navigate with state
    dispatch(setTrip(tripData));
    toast.success('Proceeding to booking...', { icon: '✈️', duration: 2000 });
    navigate('/booking', { state: { tripData } });
  };

  // Handle Inquire Now button click
  const handleInquireNow = () => {
    if (!packageData) {
      toast.error('Package information not available');
      return;
    }

    // Scroll to contact section or navigate to contact page with package details
    toast.success('Redirecting to inquiry form...', { icon: '📧', duration: 2000 });
    // TODO: Implement contact form or navigate to contact page
    // For now, scroll to bottom where contact details might be
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  // Handle WhatsApp button click
  const handleWhatsAppInquiry = () => {
    if (!packageData) {
      toast.error('Package information not available');
      return;
    }

    // Construct WhatsApp message
    const message = `Hi! I'm interested in the *${packageData.title}* package.\n\n` +
      `📍 Destination: ${packageData.location}\n` +
      `⏱️ Duration: ${packageData.duration}\n` +
      `💰 Price: ₹${packageData.price.toLocaleString()}\n\n` +
      `Could you please provide more details?`;

    // WhatsApp business number
    const phoneNumber = '919007000777';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');
    toast.success('Opening WhatsApp...', { icon: '💬', duration: 2000 });
  };

  // Handle Add to Cart button click
  const handleAddToCart = () => {
    if (!packageData) return;

    // Require authentication to add to cart
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart', {
        icon: '🔒',
        duration: 3000,
      });
      navigate(`/auth?type=login&redirect=/package/${slug}`);
      return;
    }

    // Check for duplicates
    if (isInCart) {
      toast.success('Item is already in your cart!', {
        icon: '🛒',
        duration: 2000,
      });
      return;
    }

    const cartItem = {
      id: packageData.id,
      packageId: packageData.packageId,
      type: 'tour' as const,
      name: packageData.title,
      slug: packageData.slug,
      price: packageData.price,
      image: packageData.images[0] || '',
      duration: packageData.duration,
    };

    // Use async action since user is authenticated
    if (isCartSynced) {
      dispatch(addToCartAsync(cartItem) as any);
    } else {
      dispatch(addToCart(cartItem));
    }

    toast.success(`${packageData.title} added to cart!`, {
      icon: '🛒',
      duration: 3000,
    });
  };

  // Build map search query from destination
  const getMapSearchQuery = (destination: string, state: string, country: string) => {
    const parts = [destination, state, country].filter(Boolean);
    return encodeURIComponent(parts.join(', '));
  };

  // Map API data to component's expected format
  const packageData = apiPackage ? {
    id: apiPackage.id,
    packageId: apiPackage.packageId,
    slug: apiPackage.slug,
    title: apiPackage.name,
    description: apiPackage.longDescription || apiPackage.shortDescription,
    shortDescription: apiPackage.shortDescription,
    images: apiPackage.galleryImages?.length > 0
      ? apiPackage.galleryImages
      : [apiPackage.imageUrl || FALLBACK_IMAGE],
    videoUrl: apiPackage.videoUrl || '',
    location: `${apiPackage.destination}, ${apiPackage.state}`,
    country: apiPackage.country,
    rating: reviewStats.averageRating || Number(apiPackage.rating) || 4.5,
    reviewCount: reviewStats.totalReviews || apiPackage.reviewCount || 0,
    host: 'TripAndEvent Travels',
    price: Number(apiPackage.startingPrice),
    originalPrice: Math.round(Number(apiPackage.startingPrice) * 1.2),
    duration: apiPackage.duration,
    maxGroupSize: apiPackage.maxGroupSize || 15,
    facilities: [
      { icon: 'headphones', label: 'Virtual Reality (VR)' },
      { icon: 'usercheck', label: 'Tour Guide' },
      { icon: 'wifi', label: 'Free Wifi' },
      { icon: 'clock', label: '06:00 - 18:00' },
      { icon: 'coffee', label: 'Lounge bar & cafe' },
      { icon: 'car', label: 'Wide parking' },
    ],
    highlights: apiPackage.highlights || [],
    inclusions: apiPackage.inclusions || [],
    exclusions: apiPackage.exclusions || [],
    itinerary: apiPackage.itinerary || [],
    faqs: apiPackage.faqs || [],
    // Map database reviews to component format
    reviews: reviews.slice(0, 3).map(review => ({
      id: review.id,
      user: review.userName,
      avatar: undefined, // Component handles missing avatars
      rating: review.rating,
      comment: review.comment,
      date: new Date(review.createdAt).toISOString().split('T')[0],
    })),
    ratingBreakdown: samplePackage.ratingBreakdown, // Keep for now (can be removed later)
    starDistribution: reviewStats.starDistribution,
    totalRatings: reviewStats.totalReviews,
    mapQuery: getMapSearchQuery(apiPackage.destination, apiPackage.state, apiPackage.country),
  } : null;

  // Check if item is already in cart (only show as "in cart" when authenticated)
  const isInCart = isAuthenticated && packageData && cartItems.some(
    (item) => (item.packageId === packageData.packageId || item.slug === packageData.slug) && item.type === 'tour'
  );

  // Show loading state
  if (loading) {
    return (
      <div className="package-detail-page">
        <div className="loading-container">
          <Loader2 size={48} className="loading-spinner" />
          <p>Loading package details...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !packageData) {
    return (
      <div className="package-detail-page">
        <div className="error-container">
          <h2>Package Not Found</h2>
          <p style={{ marginBottom: '2rem', color: '#666' }}>The package you're looking for doesn't exist or has been removed.</p>
          <Link to="/destinations" className="package-cta-btn primary">
            Browse All Packages
          </Link>
        </div>
      </div>
    );
  }

  const tabs: { id: TabType; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'location', label: 'Location' },
    { id: 'inclusions', label: "What's Included" },
    { id: 'faqs', label: 'FAQs' },
  ];

  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId);
    // Smooth scroll to content section
    setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === packageData.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? packageData.images.length - 1 : prev - 1
    );
  };

  return (
    <div className="package-detail-page">
      {/* Video Modal - Disabled for now */}
      {/* <AnimatePresence>
        {isVideoModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="package-video-modal"
            onClick={() => setIsVideoModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="package-video-container"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <iframe
                src={packageData.videoUrl}
                title="Package Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="package-video-close"
              >
                <X />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence> */}

      {/* Full-Width Hero Section */}
      <section className="package-hero">
        {/* Hero Image */}
        <div className="package-hero-image-wrapper">
          <motion.img
            key={currentImageIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            src={getMediaUrl(packageData.images[currentImageIndex])}
            alt={packageData.title}
            onError={handleImageError}
            className="package-hero-image"
          />

          {/* Gradient Overlay */}
          <div className="package-hero-overlay" />

          {/* Navigation Arrows */}
          <button
            onClick={prevImage}
            className="package-nav-btn prev"
            aria-label="Previous image"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={nextImage}
            className="package-nav-btn next"
            aria-label="Next image"
          >
            <ChevronRight />
          </button>

          {/* Thumbnail Strip - Centered at Bottom */}
          <div className="package-thumbs">
            {packageData.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`package-thumb ${idx === currentImageIndex ? 'active' : ''}`}
              >
                <img
                  src={getMediaUrl(img)}
                  alt=""
                  onError={handleImageError}
                />
              </button>
            ))}
          </div>

          {/* Dots Indicator */}
          <div className="package-dots">
            {packageData.images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`package-dot ${idx === currentImageIndex ? 'active' : ''}`}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>

          {/* Video Play Button - Disabled for now */}
          {/* <button
            onClick={() => setIsVideoModalOpen(true)}
            className="package-video-play-btn"
            aria-label="Play video"
          >
            <Play fill="white" />
          </button> */}
        </div>
      </section>

      {/* Package Info Card - Overlapping Hero */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="package-info-section"
      >
        <div className="package-info-card">
          {/* Top Row: Actions */}
          <div className="package-actions-row">
            <button className="package-share-btn">
              <Share2 />
              Share
            </button>
            <button
              onClick={async () => {
                if (packageData) {
                  const wasInWishlist = isSaved(packageData.id);
                  await toggleSave(packageData.id, {
                    type: 'tour',
                    name: packageData.title,
                    slug: packageData.slug,
                    image: packageData.images[0],
                    price: packageData.price,
                    duration: packageData.duration,
                    destination: packageData.location.split(',')[0],
                  });
                  toast.success(
                    wasInWishlist ? 'Removed from wishlist' : 'Added to wishlist',
                    { icon: wasInWishlist ? '💔' : '❤️', duration: 2000 }
                  );
                }
              }}
              className={`package-wishlist-btn ${packageData && isSaved(packageData.id) ? 'active' : ''}`}
            >
              <Heart fill={packageData && isSaved(packageData.id) ? '#ef4444' : 'none'} />
            </button>
          </div>

          {/* Center-Aligned Title */}
          <div className="package-title-section">
            <h1 className="package-title">{packageData.title}</h1>
            <p className="package-short-desc">{packageData.shortDescription}</p>
          </div>

          {/* Meta Info Row - Centered */}
          <div className="package-meta-row">
            <div className="package-meta-badge">
              <MapPin />
              <span>{packageData.location.split(',')[0]}</span>
            </div>
            <div className="package-meta-badge rating">
              <Star fill="#f59e0b" strokeWidth={0} />
              <span className="rating-value">{packageData.rating}</span>
              <span className="rating-count">({packageData.reviewCount.toLocaleString()})</span>
            </div>
            <div className="package-meta-badge">
              <Calendar />
              <span>{packageData.duration}</span>
            </div>
            <div className="package-meta-badge">
              <User />
              <span>{packageData.host}</span>
            </div>
          </div>

          {/* Price & CTA - Centered */}
          <div className="package-price-section">
            {/* Price */}
            <div className="package-price-wrapper">
              <div className="package-starting-from-label">Starting from</div>
              <div className="package-current-price-row">
                <span className="package-current-price">
                  ₹{packageData.price.toLocaleString()}
                </span>
                <span className="package-price-suffix">/Person</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="package-cta-row">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="package-cta-btn secondary"
                onClick={handleInquireNow}
              >
                <Mail size={18} />
                Inquire Now
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="package-cta-btn whatsapp"
                onClick={handleWhatsAppInquiry}
                style={{
                  background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                  color: 'white'
                }}
              >
                <MessageCircle size={18} />
                WhatsApp
              </motion.button>

              <motion.button
                whileHover={{ scale: isInCart ? 1 : 1.05 }}
                whileTap={{ scale: isInCart ? 1 : 0.98 }}
                className={`package-cta-btn secondary ${isInCart ? 'in-cart' : ''}`}
                onClick={handleAddToCart}
                disabled={isInCart}
              >
                <ShoppingCart size={18} />
                {isInCart ? 'Added to Cart' : 'Add to Cart'}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Tabs Navigation */}
      <div className="package-tabs-nav">
        <div className="package-tabs-container">
          <div className="package-tabs-list scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`package-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content + Sidebar */}
      <div ref={contentRef} className="package-content-area">
        <div className="package-content-wrapper">
          {/* Main Content */}
          <div className="package-main-content">
            <AnimatePresence mode="wait">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="package-tab-content"
                >
                  {/* Description Section */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="package-section large"
                  >
                    {/* Header with accent */}
                    <div className="package-section-header">
                      <div className="package-section-header-inner">
                        <div className="package-section-accent" />
                        <h2 className="package-section-title">About This Trip</h2>
                      </div>
                    </div>

                    {/* Description Text */}
                    <div className="package-description-box">
                      <p className="package-description-text">
                        {showFullDescription
                          ? packageData.description
                          : packageData.description.slice(0, 250) + '...'}
                      </p>

                      {/* Read More Button */}
                      <motion.button
                        onClick={() => setShowFullDescription(!showFullDescription)}
                        whileHover={{ x: 4 }}
                        className="package-read-more-btn"
                      >
                        {showFullDescription ? 'Show Less' : 'Read More'}
                        <ArrowRight />
                      </motion.button>
                    </div>
                  </motion.section>

                  {/* Highlights Section */}
                  <section className="package-section">
                    <h3 className="package-section-subtitle">Trip Highlights</h3>
                    <div className="package-highlights-grid">
                      {packageData.highlights.map((highlight, idx) => (
                        <div key={idx} className="package-highlight-item">
                          <div className="package-highlight-icon">
                            <Check />
                          </div>
                          <span className="package-highlight-text">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Itinerary Section */}
                  <section className="package-section">
                    <h3 className="package-section-subtitle">Day-by-Day Itinerary</h3>
                    <div className="package-itinerary-list">
                      {packageData.itinerary.map((day, idx) => (
                        <div key={idx} className="package-itinerary-item">
                          <button
                            onClick={() => setExpandedDay(expandedDay === idx ? null : idx)}
                            className={`package-itinerary-header ${expandedDay === idx ? 'expanded' : ''}`}
                          >
                            <div className="package-itinerary-header-left">
                              <span className="package-day-number">{day.day}</span>
                              <span className="package-day-title">{day.title}</span>
                            </div>
                            {expandedDay === idx ? (
                              <ChevronUp className="package-itinerary-icon" />
                            ) : (
                              <ChevronDown className="package-itinerary-icon" />
                            )}
                          </button>
                          <AnimatePresence>
                            {expandedDay === idx && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="package-itinerary-content-wrapper"
                              >
                                <div className="package-itinerary-content">
                                  <ul className="package-activity-list">
                                    {day.activities.map((activity, aIdx) => (
                                      <li key={aIdx} className="package-activity-item">
                                        <span className="package-activity-dot" />
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
                </motion.div>
              )}

              {/* Location Tab */}
              {activeTab === 'location' && (
                <motion.div
                  key="location"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="package-tab-content"
                >
                  <section className="package-section">
                    <h2 className="package-location-title">The location you are going to</h2>
                    <div className="package-location-info">
                      <div className="package-location-icon-wrapper">
                        <MapPin className="package-location-icon" />
                      </div>
                      <div>
                        <p className="package-location-name">{packageData.location}</p>
                        <p className="package-location-country">{packageData.country}</p>
                      </div>
                    </div>

                    {/* Google Maps Embed */}
                    <div className="package-map-container">
                      <iframe
                        src={`https://www.google.com/maps?q=${packageData.mapQuery}&output=embed`}
                        width="100%"
                        height="100%"
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Package Location"
                      />
                    </div>
                  </section>

                  {/* Contact Info */}
                  <section className="package-section">
                    <h3 className="package-section-subtitle">Need Help?</h3>
                    <div className="package-contact-list">
                      <div className="package-contact-item">
                        <div className="package-contact-icon-wrapper">
                          <Phone className="package-contact-icon" />
                        </div>
                        <div>
                          <p className="package-contact-label">Call us</p>
                          <p className="package-contact-value">+91 900 700 0777</p>
                        </div>
                      </div>
                      <div className="package-contact-item">
                        <div className="package-contact-icon-wrapper">
                          <Mail className="package-contact-icon" />
                        </div>
                        <div>
                          <p className="package-contact-label">Email us</p>
                          <p className="package-contact-value">support@tripandevent.com</p>
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
                  <div className="package-inclusions-grid">
                    {/* Inclusions */}
                    <section className="package-section">
                      <h3 className="package-inclusions-title included">
                        <div className="package-inclusions-icon-wrapper included">
                          <Check />
                        </div>
                        What's Included
                      </h3>
                      <ul className="package-inclusions-list">
                        {packageData.inclusions.map((item, idx) => (
                          <li key={idx} className="package-inclusion-item included">
                            <Check className="package-inclusion-check included" />
                            <span className="package-inclusion-text">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </section>

                    {/* Exclusions */}
                    <section className="package-section">
                      <h3 className="package-inclusions-title excluded">
                        <div className="package-inclusions-icon-wrapper excluded">
                          <X />
                        </div>
                        What's Not Included
                      </h3>
                      <ul className="package-inclusions-list">
                        {packageData.exclusions.map((item, idx) => (
                          <li key={idx} className="package-inclusion-item excluded">
                            <X className="package-inclusion-check excluded" />
                            <span className="package-inclusion-text">{item}</span>
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
                  <section className="package-section large">
                    <h2 className="package-faq-title">Frequently Asked Questions</h2>
                    <div className="package-faq-list">
                      {packageData.faqs.map((faq, idx) => (
                        <div key={idx} className="package-faq-item">
                          <button
                            onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                            className={`package-faq-header ${expandedFaq === idx ? 'expanded' : ''}`}
                          >
                            <span className="package-faq-question">{faq.question}</span>
                            {expandedFaq === idx ? (
                              <ChevronUp className="package-faq-icon" />
                            ) : (
                              <ChevronDown className="package-faq-icon" />
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
                                    height: {
                                      duration: 0.4,
                                      ease: [0.25, 0.1, 0.25, 1]
                                    },
                                    opacity: {
                                      duration: 0.3,
                                      delay: 0.1,
                                      ease: "easeOut"
                                    }
                                  }
                                }}
                                exit={{
                                  height: 0,
                                  opacity: 0,
                                  transition: {
                                    height: {
                                      duration: 0.3,
                                      ease: [0.4, 0, 0.6, 1]
                                    },
                                    opacity: {
                                      duration: 0.2,
                                      ease: "easeIn"
                                    }
                                  }
                                }}
                                style={{ overflow: 'hidden' }}
                                className="package-faq-content-wrapper"
                              >
                                <motion.div
                                  initial={{ y: -10 }}
                                  animate={{ y: 0 }}
                                  exit={{ y: -10 }}
                                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                                  className="package-faq-content"
                                >
                                  <p className="package-faq-answer">{faq.answer}</p>
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

          {/* Sidebar - Now empty, can add other widgets later */}
        </div>
      </div>

      {/* Reviews Section */}
      <section className="package-reviews-section">
        <div className="package-reviews-container">
          {/* Section Header */}
          <div className="package-reviews-header">
            <h2 className="package-reviews-title">Reviews & Ratings</h2>
            <p className="package-reviews-subtitle">
              See what travelers are saying about this experience
            </p>
          </div>

          {/* Rating Overview - Two Column Layout */}
          <div className="package-rating-overview">
            {/* Left: Star Breakdown */}
            <div>
              <div className="package-star-breakdown">
                {['FIVE', 'FOUR'].map((label, idx) => {
                  const starNum = 5 - idx;
                  const count = packageData.starDistribution[starNum as keyof typeof packageData.starDistribution];
                  const maxCount = Math.max(...Object.values(packageData.starDistribution));
                  const percentage = (count / maxCount) * 100;

                  return (
                    <div key={label} className="package-star-row">
                      <span className="package-star-label">{label}</span>
                      <Star className="package-star-icon filled" fill="#f59e0b" strokeWidth={0} />
                      <div className="package-star-bar-bg">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, delay: 0.1 * idx }}
                          className="package-star-bar-fill"
                        />
                      </div>
                      <span className="package-star-count">
                        {count >= 1000 ? `${(count / 1000).toFixed(1)}K` : count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Overall Rating */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="package-overall-rating"
            >
              <span className="package-rating-number">{packageData.rating}</span>
              <div className="package-rating-stars">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`package-rating-star ${i <= Math.floor(packageData.rating) ? 'filled' : ''}`}
                    fill={i <= Math.floor(packageData.rating) ? '#f59e0b' : 'none'}
                  />
                ))}
              </div>
              <p className="package-total-ratings">
                {packageData.totalRatings.toLocaleString()} Ratings
              </p>
            </motion.div>
          </div>

          {/* Divider */}
          <div className="package-reviews-divider" />

          {/* Recent Feedbacks */}
          <div className="package-feedbacks">
            <h3 className="package-feedback-title">
              <span className="package-feedback-accent" />
              Recent Feedbacks
            </h3>
            <div className="package-feedback-grid">
              {packageData.reviews.map((review) => (
                <motion.div
                  key={review.id}
                  whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                  transition={{ duration: 0.2 }}
                  className="package-feedback-card"
                >
                  <div className="package-feedback-header">
                    <div className="package-feedback-avatar">
                      {review.avatar ? (
                        <img
                          src={getMediaUrl(review.avatar)}
                          alt={review.user}
                          onError={handleImageError}
                        />
                      ) : (
                        <div className="package-feedback-avatar-placeholder">
                          <User />
                        </div>
                      )}
                    </div>
                    <div className="package-feedback-user-info">
                      <p className="package-feedback-username">{review.user}</p>
                      <div className="package-feedback-stars">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className={`package-feedback-star ${i <= review.rating ? 'filled' : ''}`}
                            fill={i <= review.rating ? '#f59e0b' : 'none'}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="package-feedback-comment">{review.comment}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="package-reviews-divider" />

          {/* Add a Review */}
          <div className="package-add-review">
            <h3 className="package-feedback-title">
              <span className="package-feedback-accent" />
              Add a Review
            </h3>
            <div className="package-review-form-container">
              {/* Rating Stars */}
              <div className="package-form-group">
                <label className="package-form-label">
                  Add Your Rating <span className="required">*</span>
                </label>
                <div className="package-rating-input">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setNewReviewRating(i)}
                      onMouseEnter={() => setHoverRating(i)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="package-rating-btn"
                    >
                      <Star
                        className={`package-rating-input-star ${i <= (hoverRating || newReviewRating) ? 'active' : ''}`}
                        fill={i <= (hoverRating || newReviewRating) ? '#f59e0b' : 'none'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Name and Email Row */}
              <div className="package-form-row">
                <div className="package-form-group">
                  <label className="package-form-label">
                    Name <span className="required primary">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={reviewForm.name}
                    onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                    className="package-form-input"
                  />
                </div>
                <div className="package-form-group">
                  <label className="package-form-label">
                    Email <span className="required primary">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="john.doe@email.com"
                    value={reviewForm.email}
                    onChange={(e) => setReviewForm({ ...reviewForm, email: e.target.value })}
                    className="package-form-input"
                  />
                </div>
              </div>

              {/* Review Textarea */}
              <div className="package-form-group">
                <label className="package-form-label">
                  Write Your Review <span className="required primary">*</span>
                </label>
                <textarea
                  placeholder="Share your experience with this trip..."
                  rows={4}
                  value={reviewForm.review}
                  onChange={(e) => setReviewForm({ ...reviewForm, review: e.target.value })}
                  className="package-form-textarea"
                />
              </div>

              {/* Submit Button */}
              <button type="button" className="package-submit-review-btn">
                Submit Review
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Must Visit Destinations Grid */}
      {internationalPackages.length > 0 && (
        <section className="package-must-visit-section">
          <div className="package-must-visit-container">
            <div className="section-header">
              <div className="section-icon-box">
                <MapPin />
              </div>
              <h2 className="section-title section-title--italic">Must Visit Destinations</h2>
              <p className="section-subtitle">
                Explore our handpicked international destinations for your next adventure
              </p>
              <Link to="/destinations" className="section-action-btn">
                <span>View All Destinations</span>
                <ArrowRight />
              </Link>
            </div>

            {/* Grid Layout - matching homepage */}
            <div className="destination-grid">
              {internationalPackages.slice(0, 8).map((pkg, index) => (
                <Link
                  key={pkg.id}
                  to={`/package/${pkg.slug}`}
                  className="destination-card-link"
                >
                  <div
                    className="must-visit-card"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="must-visit-card-image">
                      <img
                        src={getMediaUrl(pkg.imageUrl)}
                        alt={pkg.name}
                        onError={handleImageError}
                      />
                      {/* Gradient Overlay */}
                      <div className="must-visit-card-overlay"></div>

                      {/* Wishlist Button */}
                      <button
                        className={`must-visit-wishlist-btn ${isSaved(pkg.slug) ? 'active' : ''}`}
                        onClick={(e) => handleMustVisitWishlist(e, pkg)}
                        aria-label={isSaved(pkg.slug) ? 'Remove from wishlist' : 'Add to wishlist'}
                      >
                        <Heart className={isSaved(pkg.slug) ? 'filled' : ''} />
                      </button>

                      {/* Popular Badge */}
                      {pkg.popular && (
                        <div className="must-visit-trending-badge">
                          <TrendingUp />
                          <span>Trending</span>
                        </div>
                      )}

                      {/* Category Badge */}
                      <div className="must-visit-category-badge">
                        {pkg.category}
                      </div>

                      {/* Content on Image */}
                      <div className="must-visit-card-image-content">
                        <h4 className="must-visit-card-name">{pkg.name}</h4>
                        <p className="must-visit-card-tagline">{pkg.tagline}</p>
                        <div className="must-visit-card-location">
                          <MapPin />
                          <span>{pkg.country}</span>
                        </div>
                      </div>
                    </div>

                    <div className="must-visit-card-body">
                      {/* Best Season */}
                      <div className="must-visit-best-season">
                        <span className="must-visit-best-season-label">Best Season:</span> {pkg.bestSeason || 'Year Round'}
                      </div>

                      {/* Trip Types */}
                      <div className="must-visit-trip-types">
                        <div className="must-visit-trip-types-list">
                          {pkg.tags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="must-visit-trip-type-tag">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <p className="must-visit-packages-count">{pkg.duration}</p>

                      <div className="must-visit-card-footer">
                        <div>
                          <p className="must-visit-price-label">Starting from</p>
                          <p className="must-visit-price">₹{Number(pkg.startingPrice).toLocaleString('en-IN')}</p>
                        </div>
                        <button className="must-visit-explore-btn">
                          Explore
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
