import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { useState, useEffect, useRef } from 'react';
import {
  Users,
  MapPin,
  Wallet,
  MessageCircle,
  ArrowRight,
  Globe,
  Calendar,
  Shield,
  Star,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Quote,
  UserPlus,
  Mountain,
  Palmtree,
  Waves,
  TreePine,
  X,
  LogIn,
  Sparkles,
  Clock,
} from 'lucide-react';
import { TravelConnect3DCarousel } from '../components/TravelConnect3DCarousel';
import './TravellersLandingPage.css';

// Features data
const features = [
  {
    icon: Users,
    title: 'Find Travel Buddies',
    description: 'Connect with like-minded travelers heading to the same destinations. Never travel alone again.',
  },
  {
    icon: Calendar,
    title: 'Plan Group Trips',
    description: 'Create and manage group trips with ease. Coordinate itineraries, dates, and activities together.',
  },
  {
    icon: Wallet,
    title: 'Split Expenses',
    description: 'Track and split travel expenses fairly. No more awkward money conversations.',
  },
  {
    icon: MessageCircle,
    title: 'Real-time Chat',
    description: 'Stay connected with your travel group through instant messaging and trip updates.',
  },
];

// Steps data
const steps = [
  {
    number: '01',
    title: 'Create Your Profile',
    description: 'Sign up and tell us about your travel style, interests, and dream destinations.',
  },
  {
    number: '02',
    title: 'Find Your Tribe',
    description: 'Discover travelers with similar interests or invite friends to join your adventures.',
  },
  {
    number: '03',
    title: 'Travel Together',
    description: 'Plan, book, and experience unforgettable journeys with your new travel community.',
  },
];

// Testimonials data
const testimonials = [
  {
    id: 1,
    name: 'Priya Sharma',
    location: 'Mumbai',
    avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
    initials: 'PS',
    rating: 5,
    trips: 3,
    text: 'Found my perfect travel squad for Ladakh! We split costs, shared memories, and made friends for life. TravelConnect changed how I travel.',
    destination: 'Ladakh',
  },
  {
    id: 2,
    name: 'Rahul Verma',
    location: 'Delhi',
    avatar: 'https://randomuser.me/api/portraits/men/41.jpg',
    initials: 'RV',
    rating: 5,
    trips: 4,
    text: 'As a solo traveler, I was hesitant at first. But the verified profiles and group planning tools made it so easy to connect with trustworthy people.',
    destination: 'Goa',
  },
  {
    id: 3,
    name: 'Ananya Patel',
    location: 'Bangalore',
    avatar: 'https://randomuser.me/api/portraits/women/55.jpg',
    initials: 'AP',
    rating: 5,
    trips: 2,
    text: 'The expense splitting feature is a game-changer! No more awkward conversations about money. Everything is tracked and fair.',
    destination: 'Manali',
  },
  {
    id: 4,
    name: 'Vikram Singh',
    location: 'Pune',
    avatar: 'https://randomuser.me/api/portraits/men/58.jpg',
    initials: 'VS',
    rating: 5,
    trips: 5,
    text: 'I\'ve organized 3 group trips through TravelConnect. The planning tools and real-time chat make coordination effortless.',
    destination: 'Kerala',
  },
];

// FAQ data
const faqs = [
  {
    question: 'Is TravelConnect free to use?',
    answer: 'Yes! Creating a profile, finding travel buddies, and joining groups is completely free. We only charge a small service fee when you book trips through our platform.',
  },
  {
    question: 'How do I find travel buddies?',
    answer: 'Once you create your profile with your travel preferences, our matching algorithm suggests compatible travelers. You can also browse travelers by destination, dates, or interests and send connection requests.',
  },
  {
    question: 'Is my personal information safe?',
    answer: 'Absolutely. All profiles are verified, and we use bank-level encryption for your data. You control what information is visible to others, and you can report any concerns to our 24/7 support team.',
  },
  {
    question: 'Can I plan private trips with friends only?',
    answer: 'Yes! You can create private groups that are invite-only. Only people you specifically invite can see and join these trips. Perfect for planning with existing friends.',
  },
  {
    question: 'How does expense splitting work?',
    answer: 'Add expenses as you go, assign who paid and who owes. TravelConnect automatically calculates the fairest way to settle up. You can settle via UPI, bank transfer, or cash - we just track it for you.',
  },
];

// Stats data for animated counter
const stats = [
  { value: 850, suffix: '+', label: 'Active Travelers' },
  { value: 75, suffix: '+', label: 'Group Trips' },
  { value: 25, suffix: '+', label: 'Destinations' },
];

// Featured Groups data
const featuredGroups = [
  {
    id: 1,
    name: 'Ladakh Adventure',
    destination: 'Leh-Ladakh',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    icon: Mountain,
    members: 8,
    maxMembers: 12,
    startDate: 'Jan 25, 2026',
    duration: '7 days',
    spotsLeft: 4,
    organizer: { name: 'Arjun K.', avatar: 'https://randomuser.me/api/portraits/men/75.jpg', initials: 'AK' },
    memberAvatars: [
      'https://randomuser.me/api/portraits/women/21.jpg',
      'https://randomuser.me/api/portraits/men/23.jpg',
      'https://randomuser.me/api/portraits/women/24.jpg',
    ],
  },
  {
    id: 2,
    name: 'Goa Beach Vibes',
    destination: 'North Goa',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&h=300&fit=crop',
    icon: Palmtree,
    members: 6,
    maxMembers: 10,
    startDate: 'Feb 10, 2026',
    duration: '5 days',
    spotsLeft: 4,
    organizer: { name: 'Sneha M.', avatar: 'https://randomuser.me/api/portraits/women/42.jpg', initials: 'SM' },
    memberAvatars: [
      'https://randomuser.me/api/portraits/men/26.jpg',
      'https://randomuser.me/api/portraits/women/27.jpg',
      'https://randomuser.me/api/portraits/men/28.jpg',
    ],
  },
  {
    id: 3,
    name: 'Kerala Backwaters',
    destination: 'Alleppey',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&h=300&fit=crop',
    icon: Waves,
    members: 5,
    maxMembers: 8,
    startDate: 'Feb 20, 2026',
    duration: '4 days',
    spotsLeft: 3,
    organizer: { name: 'Ravi P.', avatar: 'https://randomuser.me/api/portraits/men/51.jpg', initials: 'RP' },
    memberAvatars: [
      'https://randomuser.me/api/portraits/women/31.jpg',
      'https://randomuser.me/api/portraits/men/32.jpg',
      'https://randomuser.me/api/portraits/women/34.jpg',
    ],
  },
  {
    id: 4,
    name: 'Manali Snow Trek',
    destination: 'Himachal',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&h=300&fit=crop',
    icon: TreePine,
    members: 10,
    maxMembers: 15,
    startDate: 'Mar 5, 2026',
    duration: '6 days',
    spotsLeft: 5,
    organizer: { name: 'Kavya S.', avatar: 'https://randomuser.me/api/portraits/women/68.jpg', initials: 'KS' },
    memberAvatars: [
      'https://randomuser.me/api/portraits/men/37.jpg',
      'https://randomuser.me/api/portraits/women/38.jpg',
      'https://randomuser.me/api/portraits/men/39.jpg',
    ],
  },
];

// Active Travelers data
const activeTravelers = [
  {
    id: 1,
    name: 'Aditya Sharma',
    location: 'Mumbai',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    initials: 'AS',
    interests: ['Mountains', 'Photography'],
    tripsCompleted: 4,
    lookingFor: 'Ladakh trip buddy',
    verified: true,
  },
  {
    id: 2,
    name: 'Meera Reddy',
    location: 'Hyderabad',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    initials: 'MR',
    interests: ['Beaches', 'Food'],
    tripsCompleted: 3,
    lookingFor: 'Beach vacation group',
    verified: true,
  },
  {
    id: 3,
    name: 'Karthik Nair',
    location: 'Chennai',
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    initials: 'KN',
    interests: ['Backpacking', 'Culture'],
    tripsCompleted: 5,
    lookingFor: 'Southeast Asia trip',
    verified: true,
  },
  {
    id: 4,
    name: 'Ishita Gupta',
    location: 'Delhi',
    avatar: 'https://randomuser.me/api/portraits/women/28.jpg',
    initials: 'IG',
    interests: ['Adventure', 'Trekking'],
    tripsCompleted: 2,
    lookingFor: 'Himalayan trek group',
    verified: true,
  },
  {
    id: 5,
    name: 'Rohan Joshi',
    location: 'Pune',
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
    initials: 'RJ',
    interests: ['Road trips', 'Wildlife'],
    tripsCompleted: 4,
    lookingFor: 'Wildlife safari buddy',
    verified: true,
  },
  {
    id: 6,
    name: 'Ananya Das',
    location: 'Kolkata',
    avatar: 'https://randomuser.me/api/portraits/women/63.jpg',
    initials: 'AD',
    interests: ['Heritage', 'Art'],
    tripsCompleted: 3,
    lookingFor: 'Rajasthan heritage tour',
    verified: true,
  },
];

// Activity Feed data
const activityFeed = [
  {
    id: 1,
    type: 'join',
    user: 'Priya S.',
    avatar: 'https://randomuser.me/api/portraits/women/31.jpg',
    action: 'joined',
    target: 'Ladakh Adventure group',
    time: '2 min ago',
  },
  {
    id: 2,
    type: 'create',
    user: 'Rahul V.',
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    action: 'created',
    target: 'Goa New Year Trip',
    time: '5 min ago',
  },
  {
    id: 3,
    type: 'connect',
    user: 'Neha K.',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    action: 'connected with',
    target: 'Amit P.',
    time: '8 min ago',
  },
  {
    id: 4,
    type: 'trip',
    user: 'Kerala Backwaters group',
    avatar: 'https://randomuser.me/api/portraits/men/52.jpg',
    action: 'completed their trip',
    target: '',
    time: '15 min ago',
  },
  {
    id: 5,
    type: 'join',
    user: 'Vikram M.',
    avatar: 'https://randomuser.me/api/portraits/men/36.jpg',
    action: 'joined',
    target: 'Manali Snow Trek',
    time: '20 min ago',
  },
  {
    id: 6,
    type: 'create',
    user: 'Anjali R.',
    avatar: 'https://randomuser.me/api/portraits/women/47.jpg',
    action: 'is looking for',
    target: 'travel buddies to Rishikesh',
    time: '25 min ago',
  },
];

// Animated Counter Hook
function useCountUp(end: number, duration: number = 2000, start: boolean = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, start]);

  return count;
}

// Intersection Observer Hook
function useInView(threshold: number = 0.3) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

// Animated Stat Component
function AnimatedStat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { ref, inView } = useInView(0.5);
  const count = useCountUp(value, 2000, inView);

  return (
    <div className="tl-stat" ref={ref}>
      <span className="tl-stat-value">
        {count.toLocaleString()}{suffix}
      </span>
      <span className="tl-stat-label">{label}</span>
    </div>
  );
}

// FAQ Item Component
function FAQItem({ question, answer, isOpen, onClick }: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div className={`tl-faq-item ${isOpen ? 'open' : ''}`}>
      <button className="tl-faq-question" onClick={onClick}>
        <span>{question}</span>
        <ChevronDown className={`tl-faq-icon ${isOpen ? 'rotate' : ''}`} />
      </button>
      <div className={`tl-faq-answer ${isOpen ? 'open' : ''}`}>
        <p>{answer}</p>
      </div>
    </div>
  );
}

// Login Prompt Modal Component
function LoginPromptModal({
  isOpen,
  onClose,
  actionType,
  redirectPath
}: {
  isOpen: boolean;
  onClose: () => void;
  actionType: string;
  redirectPath: string;
}) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const getModalContent = () => {
    switch (actionType) {
      case 'join':
        return {
          title: 'Join This Group',
          description: 'Login to join travel groups and connect with fellow adventurers.',
          icon: UserPlus,
        };
      case 'connect':
        return {
          title: 'Connect with Traveler',
          description: 'Login to send connection requests and start chatting.',
          icon: Users,
        };
      case 'message':
        return {
          title: 'Send a Message',
          description: 'Login to message travelers and plan trips together.',
          icon: MessageCircle,
        };
      default:
        return {
          title: 'Login Required',
          description: 'Please login to access this feature.',
          icon: LogIn,
        };
    }
  };

  const content = getModalContent();
  const IconComponent = content.icon;

  return (
    <div className="tl-modal-overlay" onClick={onClose}>
      <div className="tl-modal" onClick={(e) => e.stopPropagation()}>
        <button className="tl-modal-close" onClick={onClose}>
          <X />
        </button>

        <div className="tl-modal-icon">
          <IconComponent />
        </div>

        <h3 className="tl-modal-title">{content.title}</h3>
        <p className="tl-modal-description">{content.description}</p>

        <div className="tl-modal-actions">
          <button
            className="tl-modal-btn-primary"
            onClick={() => navigate(`/auth?type=login&redirect=${encodeURIComponent(redirectPath)}`)}
          >
            <LogIn />
            Login
          </button>
          <button
            className="tl-modal-btn-secondary"
            onClick={() => navigate(`/auth?type=signup&redirect=${encodeURIComponent(redirectPath)}`)}
          >
            <Sparkles />
            Sign Up Free
          </button>
        </div>

        <p className="tl-modal-note">
          Join 850+ travelers already on TravelConnect
        </p>
      </div>
    </div>
  );
}

export function TravellersLandingPage() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalActionType, setModalActionType] = useState('');
  const [videoLoaded, setVideoLoaded] = useState(false);
  const travelersScrollRef = useRef<HTMLDivElement>(null);

  // Activity feed rotation state
  const [activityStartIndex, setActivityStartIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/travellers/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Current path for redirect after login
  const currentPath = location.pathname;

  const ctaLink = `/auth?type=login&redirect=${encodeURIComponent(currentPath)}`;
  const ctaText = 'Join TravelConnect';

  // Don't render landing page content if authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  // Get visible activities (3 items)
  const getVisibleActivities = () => {
    const visible = [];
    for (let i = 0; i < 3; i++) {
      const index = (activityStartIndex + i) % activityFeed.length;
      visible.push({ ...activityFeed[index], displayIndex: i });
    }
    return visible;
  };

  // Rotate activity feed
  useEffect(() => {
    const rotateInterval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setActivityStartIndex((prev) => (prev + 1) % activityFeed.length);
        setIsAnimating(false);
      }, 500); // Half of animation duration
    }, 3000); // Rotate every 3 seconds

    return () => clearInterval(rotateInterval);
  }, []);

  // Handle gated action
  const handleGatedAction = (actionType: string, callback?: () => void) => {
    if (isAuthenticated) {
      callback?.();
    } else {
      setModalActionType(actionType);
      setModalOpen(true);
    }
  };

  // Scroll travelers horizontally
  const scrollTravelers = (direction: 'left' | 'right') => {
    const container = travelersScrollRef.current;
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Auto-rotate testimonials (show pairs, so step by 2)
  const testimonialPairCount = Math.ceil(testimonials.length / 2);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 2) % (testimonialPairCount * 2));
    }, 6000);
    return () => clearInterval(interval);
  }, [testimonialPairCount]);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 2) % (testimonialPairCount * 2));
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 2 + testimonialPairCount * 2) % (testimonialPairCount * 2));
  };

  // Get the pair of testimonials to show
  const getTestimonialPair = () => {
    const firstIndex = currentTestimonial;
    const secondIndex = (currentTestimonial + 1) % testimonials.length;
    return [firstIndex, secondIndex];
  };

  return (
    <div className="travellers-landing">
      {/* Hero Section */}
      <section className="tl-hero">
        <div className="tl-hero-bg">
          <iframe
            className={`tl-hero-video ${videoLoaded ? 'loaded' : ''}`}
            src="https://www.youtube.com/embed/DX4Yu5jQzks?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=DX4Yu5jQzks&modestbranding=1&playsinline=1&disablekb=1"
            allow="autoplay; encrypted-media"
            allowFullScreen
            title="TravelConnect Community"
            onLoad={() => setTimeout(() => setVideoLoaded(true), 1500)}
          />
          <div className="tl-hero-video-overlay" />
        </div>

        <div className="tl-hero-content">
          <div className="tl-hero-badge">
            <Globe className="tl-badge-icon" />
            <span>TravelConnect Community</span>
          </div>

          <h1 className="tl-hero-title">
            Travel Better,
            <span className="tl-title-highlight"> Together</span>
          </h1>

          <p className="tl-hero-subtitle">
            Join thousands of travelers connecting, planning trips, and creating
            unforgettable memories together. Your next adventure starts here.
          </p>

          <div className="tl-hero-actions">
            <Link to={ctaLink} className="tl-btn-primary">
              {ctaText}
              <ArrowRight />
            </Link>
            <Link to="/destinations" className="tl-btn-secondary">
              Explore Destinations
            </Link>
          </div>

          {/* Animated Stats */}
          <div className="tl-hero-stats">
            {stats.map((stat, index) => (
              <>
                <AnimatedStat key={stat.label} {...stat} />
                {index < stats.length - 1 && <div className="tl-stat-divider" />}
              </>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="tl-how-it-works" id="how-it-works">
        <div className="tl-container">
          <div className="tl-section-header">
            <h2 className="tl-section-title">How It Works</h2>
            <p className="tl-section-subtitle">
              Explore our interactive features by clicking on any icon
            </p>
          </div>

          <TravelConnect3DCarousel />
        </div>
      </section>

      {/* Featured Groups Section */}
      <section className="tl-featured-groups">
        <div className="tl-container">
          <div className="tl-section-header">
            <h2 className="tl-section-title">Trending Travel Groups</h2>
            <p className="tl-section-subtitle">
              Join these popular groups and start your next adventure
            </p>
          </div>

          <div className="tl-groups-grid">
            {featuredGroups.map((group) => {
              const IconComponent = group.icon;
              return (
                <div key={group.id} className="tl-group-card">
                  <div className="tl-group-image">
                    <img src={group.image} alt={group.name} loading="lazy" />
                    <div className="tl-group-overlay" />
                    <div className="tl-group-badge">
                      <IconComponent />
                      {group.destination}
                    </div>
                    <div className="tl-spots-badge">
                      {group.spotsLeft} spots left
                    </div>
                  </div>

                  <div className="tl-group-content">
                    <h3 className="tl-group-name">{group.name}</h3>

                    <div className="tl-group-details">
                      <span className="tl-group-detail">
                        <Calendar />
                        {group.startDate}
                      </span>
                      <span className="tl-group-detail">
                        <Clock />
                        {group.duration}
                      </span>
                    </div>

                    <div className="tl-group-members">
                      <div className="tl-member-avatars">
                        {group.memberAvatars.map((avatarUrl, i) => (
                          <div key={i} className="tl-member-avatar">
                            <img src={avatarUrl} alt={`Member ${i + 1}`} />
                          </div>
                        ))}
                        {group.members > 3 && (
                          <div className="tl-member-avatar tl-member-more">
                            +{group.members - 3}
                          </div>
                        )}
                      </div>
                      <span className="tl-member-count">
                        {group.members}/{group.maxMembers} members
                      </span>
                    </div>

                    <div className="tl-group-organizer">
                      <span className="tl-organizer-avatar">
                        <img src={group.organizer.avatar} alt={group.organizer.name} />
                      </span>
                      <span>Organized by {group.organizer.name}</span>
                    </div>

                    <button
                      className="tl-group-join-btn"
                      onClick={() => handleGatedAction('join', () => navigate(`/travellers/group/${group.id}`))}
                    >
                      <UserPlus />
                      Join Group
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="tl-groups-cta">
            <Link to={ctaLink} className="tl-btn-secondary tl-btn-outline">
              View All Groups
              <ArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Active Travelers Section */}
      <section className="tl-active-travelers">
        <div className="tl-container">
          <div className="tl-section-header">
            <h2 className="tl-section-title">Meet Active Travelers</h2>
            <p className="tl-section-subtitle">
              Connect with fellow adventurers looking for travel buddies
            </p>
          </div>

          <div className="tl-travelers-carousel">
            <button
              className="tl-travelers-nav prev"
              onClick={() => scrollTravelers('left')}
              aria-label="Scroll left"
            >
              <ChevronLeft />
            </button>

            <div className="tl-travelers-scroll" ref={travelersScrollRef}>
              {activeTravelers.map((traveler) => (
                <div key={traveler.id} className="tl-traveler-card">
                  <div className="tl-traveler-avatar">
                    <img
                      src={traveler.avatar}
                      alt={traveler.name}
                      onError={(e) => {
                        // Fallback to initials if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.classList.add('tl-avatar-fallback');
                        target.parentElement!.setAttribute('data-initials', traveler.initials);
                      }}
                    />
                    {traveler.verified && (
                      <span className="tl-verified-badge" title="Verified">
                        <Shield />
                      </span>
                    )}
                  </div>

                  <h4 className="tl-traveler-name">{traveler.name}</h4>

                  <p className="tl-traveler-location">
                    <MapPin />
                    {traveler.location}
                  </p>

                  <div className="tl-traveler-interests">
                    {traveler.interests.map((interest, i) => (
                      <span key={i} className="tl-interest-tag">{interest}</span>
                    ))}
                  </div>

                  <p className="tl-traveler-looking">{traveler.lookingFor}</p>

                  <div className="tl-traveler-stats">
                    <span>{traveler.tripsCompleted} trips</span>
                  </div>

                  <button
                    className="tl-connect-btn"
                    onClick={() => handleGatedAction('connect')}
                  >
                    <UserPlus />
                    Connect
                  </button>
                </div>
              ))}
            </div>

            <button
              className="tl-travelers-nav next"
              onClick={() => scrollTravelers('right')}
              aria-label="Scroll right"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      </section>

      {/* Live Activity Feed Section */}
      <section className="tl-activity-feed">
        <div className="tl-container">
          <div className="tl-activity-layout">
            <div className="tl-activity-left">
              <div className="tl-activity-live-badge">
                <span className="tl-live-dot" />
                <span>Live</span>
              </div>
              <h3 className="tl-activity-title">Community Activity</h3>
              <p className="tl-activity-subtitle">See what travelers are doing right now</p>
            </div>

            <div className="tl-activity-feed-container">
              <div className={`tl-activity-list ${isAnimating ? 'animating' : ''}`}>
                {getVisibleActivities().map((activity, index) => (
                  <div
                    key={`${activityStartIndex}-${activity.id}`}
                    className={`tl-activity-item ${isAnimating && index === 0 ? 'exiting' : ''} ${isAnimating && index === 2 ? 'entering' : ''}`}
                  >
                    <div className="tl-activity-avatar">
                      <img src={activity.avatar} alt={activity.user} />
                    </div>
                    <div className="tl-activity-content">
                      <p>
                        <strong>{activity.user}</strong>
                        <span> {activity.action} </span>
                        {activity.target && <span className="tl-activity-target">{activity.target}</span>}
                      </p>
                      <span className="tl-activity-time">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="tl-features">
        <div className="tl-container">
          <div className="tl-section-header">
            <h2 className="tl-section-title">Everything You Need to Travel Together</h2>
            <p className="tl-section-subtitle">
              Powerful tools designed to make group travel planning simple and enjoyable
            </p>
          </div>

          <div className="tl-features-grid">
            {features.map((feature, index) => (
              <div key={index} className="tl-feature-card">
                <div className="tl-feature-icon">
                  <feature.icon />
                </div>
                <h3 className="tl-feature-title">{feature.title}</h3>
                <p className="tl-feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="tl-testimonials">
        <div className="tl-container">
          <div className="tl-section-header">
            <h2 className="tl-section-title">Loved by Travelers</h2>
            <p className="tl-section-subtitle">
              See what our community has to say about their TravelConnect experience
            </p>
          </div>

          <div className="tl-testimonial-carousel">
            <button
              className="tl-testimonial-nav prev"
              onClick={prevTestimonial}
              aria-label="Previous testimonials"
            >
              <ChevronLeft />
            </button>

            <div className="tl-testimonial-wrapper">
              {getTestimonialPair().map((testimonialIndex) => {
                const testimonial = testimonials[testimonialIndex];
                return (
                  <div
                    key={testimonial.id}
                    className="tl-testimonial-card active"
                  >
                    <div className="tl-testimonial-quote">
                      <Quote className="tl-quote-icon" />
                    </div>
                    <p className="tl-testimonial-text">{testimonial.text}</p>
                    <div className="tl-testimonial-rating">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="tl-star" />
                      ))}
                    </div>
                    <div className="tl-testimonial-author">
                      <div className="tl-testimonial-avatar">
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.classList.add('tl-avatar-fallback');
                            target.parentElement!.setAttribute('data-initials', testimonial.initials);
                          }}
                        />
                      </div>
                      <div className="tl-testimonial-info">
                        <span className="tl-testimonial-name">{testimonial.name}</span>
                        <span className="tl-testimonial-meta">
                          <MapPin className="tl-meta-icon" />
                          {testimonial.location} • {testimonial.trips} trips
                        </span>
                      </div>
                    </div>
                    <div className="tl-testimonial-destination">
                      Traveled to {testimonial.destination}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              className="tl-testimonial-nav next"
              onClick={nextTestimonial}
              aria-label="Next testimonials"
            >
              <ChevronRight />
            </button>

            {/* Dots indicator - one per pair */}
            <div className="tl-testimonial-dots">
              {[...Array(testimonialPairCount)].map((_, index) => (
                <button
                  key={index}
                  className={`tl-dot ${Math.floor(currentTestimonial / 2) === index ? 'active' : ''}`}
                  onClick={() => setCurrentTestimonial(index * 2)}
                  aria-label={`Go to testimonials ${index * 2 + 1}-${index * 2 + 2}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="tl-faq">
        <div className="tl-container">
          <div className="tl-section-header">
            <h2 className="tl-section-title">Frequently Asked Questions</h2>
            <p className="tl-section-subtitle">
              Got questions? We've got answers
            </p>
          </div>

          <div className="tl-faq-list">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFAQ === index}
                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="tl-trust">
        <div className="tl-container">
          <div className="tl-trust-content">
            <div className="tl-trust-icon">
              <Shield />
            </div>
            <h3 className="tl-trust-title">Safe & Verified Community</h3>
            <p className="tl-trust-description">
              All members are verified travelers. Your safety and privacy are our top priorities.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="tl-cta">
        <div className="tl-container">
          <div className="tl-cta-content">
            <h2 className="tl-cta-title">Ready to Start Your Journey?</h2>
            <p className="tl-cta-subtitle">
              Join TravelConnect today and discover a new way to explore the world
            </p>
            <Link to={ctaLink} className="tl-btn-primary tl-btn-large">
              {ctaText}
              <ArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        actionType={modalActionType}
        redirectPath={currentPath}
      />
    </div>
  );
}
