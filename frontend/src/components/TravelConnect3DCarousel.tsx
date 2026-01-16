import { useState, useEffect, CSSProperties } from 'react';
import {
  Calendar,
  MapPin,
  MessageCircle,
  Users,
  CheckCircle2,
  Receipt,
  Send,
  Bell,
  Zap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import './TravelConnect3DCarousel.css';

// Icon component type for step icons
type IconComponent = React.FC<{ style?: CSSProperties; className?: string }>;

// Step data type
interface Step {
  id: number;
  number: string;
  title: string;
  description: string;
  icon: IconComponent;
  gradient: string;
  color: string;
}

// Steps data
const steps: Step[] = [
  {
    id: 0,
    number: '1',
    title: 'Create or Join a Trip',
    description: 'Start your journey by creating a personalized trip or joining exciting adventures planned by fellow travelers.',
    icon: Calendar,
    gradient: 'linear-gradient(145deg, #10b981, #059669)',
    color: '#10b981'
  },
  {
    id: 1,
    number: '2',
    title: 'Discover Travelers Nearby',
    description: 'Find like-minded explorers heading to your dream destination. Connect with travelers in real-time.',
    icon: MapPin,
    gradient: 'linear-gradient(145deg, #14b8a6, #0d9488)',
    color: '#14b8a6'
  },
  {
    id: 2,
    number: '3',
    title: 'Connect and Chat',
    description: 'Break the ice and start conversations. Build meaningful connections before your journey begins.',
    icon: MessageCircle,
    gradient: 'linear-gradient(145deg, #8b5cf6, #7c3aed)',
    color: '#8b5cf6'
  },
  {
    id: 3,
    number: '4',
    title: 'Group Up and Collaborate',
    description: 'Join forces with fellow adventurers. Plan together, share ideas, and create the perfect itinerary.',
    icon: Users,
    gradient: 'linear-gradient(145deg, #f97316, #ea580c)',
    color: '#f97316'
  },
  {
    id: 4,
    number: '5',
    title: 'Vote for Destinations',
    description: "Democratic decision-making for group travel. Everyone's voice matters in choosing your next adventure.",
    icon: CheckCircle2,
    gradient: 'linear-gradient(145deg, #06b6d4, #0891b2)',
    color: '#06b6d4'
  },
  {
    id: 5,
    number: '6',
    title: 'Split Bills & Expenses',
    description: 'Keep finances transparent and stress-free. Track expenses and settle payments with ease.',
    icon: Receipt,
    gradient: 'linear-gradient(145deg, #ec4899, #db2777)',
    color: '#ec4899'
  }
];

// Card Content Components
function CardContent({ index }: { index: number }) {
  switch(index) {
    case 0: // Dashboard - Create Trip
      return (
        <div className="carousel-card-content">
          <div className="card-header-section">
            <div className="card-header-top">
              <div className="card-user-info">
                <div className="card-avatar">
                  <span>👤</span>
                </div>
                <div>
                  <p className="card-greeting">GOOD MORNING</p>
                  <p className="card-username">Bhaskar Sarkar</p>
                </div>
              </div>
              <div className="card-notification">
                <Bell className="bell-icon" />
                <div className="notification-badge">3</div>
              </div>
            </div>
            <p className="card-status">✓ Ready for your next adventure?</p>
            <div className="card-actions">
              <div className="action-btn-primary">+ Create Trip</div>
              <div className="action-btn-secondary">Find Travellers</div>
            </div>
          </div>
          <div className="card-stats-row">
            {[{ val: '5', label: 'Cities', icon: '🌐' }, { val: '3', label: 'Trips', icon: '✈️' }, { val: '12', label: 'Friends', icon: '❤️' }].map((s, i) => (
              <div key={i} className="card-stat-item">
                <p className="stat-icon">{s.icon}</p>
                <p className="stat-value">{s.val}</p>
                <p className="stat-label">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="quick-actions-section">
            <div className="quick-actions-header">
              <Zap className="zap-icon" />
              <span>Quick Actions</span>
            </div>
            {['Create Trip', 'Join Group', 'Messages'].map((action, i) => (
              <div key={i} className="quick-action-item">
                <div className="quick-action-icon">
                  {i === 0 ? <Calendar className="action-icon" /> : i === 1 ? <Users className="action-icon" /> : <MessageCircle className="action-icon" />}
                </div>
                <span>{action}</span>
                {i === 2 && <div className="message-badge">4</div>}
              </div>
            ))}
          </div>
        </div>
      );
    case 1: // Travelers Nearby
      return (
        <div className="carousel-card-content">
          <div className="travelers-header">
            <MapPin className="travelers-icon" />
            <p className="travelers-title">Travelers Nearby</p>
          </div>
          <p className="travelers-subtitle">10 travellers on tour in your destinations</p>
          <div className="travelers-stats">
            {[{ val: '10', label: 'ON TOUR' }, { val: '5', label: 'DESTINATIONS', active: true }, { val: '1', label: 'CONNECTIONS' }].map((s, i) => (
              <div key={i} className={`traveler-stat ${s.active ? 'active' : ''}`}>
                <p className="traveler-stat-value">{s.val}</p>
                <p className="traveler-stat-label">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="traveler-card-white">
            <div className="traveler-profile">
              <div className="traveler-avatar-circle">RS</div>
              <div className="traveler-info">
                <div className="traveler-name-row">
                  <p className="traveler-name">Rahul Sharma, 30</p>
                  <span className="pending-badge">Request Pending</span>
                </div>
                <p className="traveler-location">📍 Manali | Manali Snow Adventure</p>
                <p className="traveler-dates">Jan 19 - Jan 26 • Mumbai, India</p>
              </div>
            </div>
          </div>
          <div className="travelers-tabs">
            <div className="tab-active">👥 Travellers</div>
            <div className="tab-inactive">Groups</div>
          </div>
        </div>
      );
    case 2: // Chat
      return (
        <div className="carousel-card-content chat-content">
          <div className="chat-header">
            <div className="chat-avatar">RS</div>
            <div>
              <p className="chat-name">Rahul Sharma</p>
              <div className="online-status">
                <div className="online-dot" />
                <p>Online now</p>
              </div>
            </div>
          </div>
          <div className="chat-messages">
            <div className="message received">
              <p>Hey! 👋 Heading to Manali too?</p>
              <span className="message-time">10:24 AM</span>
            </div>
            <div className="message sent">
              <p>Yes! Would love to connect! 🎿</p>
              <span className="message-time-sent">10:26 AM</span>
            </div>
            <div className="message received">
              <p>Perfect! Let's plan together 🎉</p>
              <span className="message-time">10:27 AM</span>
            </div>
          </div>
          <div className="chat-input-area">
            <div className="chat-input">Type a message...</div>
            <div className="send-btn">
              <Send className="send-icon" />
            </div>
          </div>
        </div>
      );
    case 3: // Group Planning
      return (
        <div className="carousel-card-content">
          <div className="group-card-white">
            <div className="group-header">
              <div>
                <p className="group-name">🌴 Bali Adventure Squad</p>
                <p className="group-meta">5 members • 10 days</p>
              </div>
              <div className="member-avatars">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="member-dot" style={{ background: `hsl(${i * 50}, 70%, 50%)`, marginLeft: i > 1 ? '-8px' : 0 }} />
                ))}
              </div>
            </div>
            <div className="itinerary-section">
              <div className="itinerary-header">
                <span>📋</span>
                <span className="itinerary-label">ITINERARY</span>
              </div>
              {[{ day: 'Day 1: Ubud Rice Terraces', by: 'Sarah', emoji: '🌾' }, { day: 'Day 2: Tanah Lot Temple', by: 'Mike', emoji: '⛩️' }, { day: 'Day 3: Scuba Diving', by: 'Emma', emoji: '🤿' }].map((item, i) => (
                <div key={i} className="itinerary-item">
                  <div className="check-circle">
                    <CheckCircle2 className="check-icon" />
                  </div>
                  <div>
                    <p className="itinerary-day">{item.emoji} {item.day}</p>
                    <p className="itinerary-by">by {item.by}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    case 4: // Voting
      return (
        <div className="carousel-card-content">
          <div className="voting-card-white">
            <div className="voting-header">
              <p className="voting-title">🗳️ Vote for Day 5 Activity</p>
              <p className="voting-meta">5 members • ⏰ 2 days left</p>
            </div>
            {[{ name: 'Mount Batur Trek', votes: 4, pct: 80, leading: true, emoji: '⛰️' }, { name: 'Nusa Penida Tour', votes: 3, pct: 60, emoji: '🏝️' }, { name: 'Beach Day', votes: 2, pct: 40, emoji: '🏖️' }].map((opt, i) => (
              <div key={i} className="vote-option">
                <div className="vote-option-header">
                  <div className="vote-option-name">
                    <span>{opt.emoji} {opt.name}</span>
                    {opt.leading && <span className="leading-badge">🏆 Leading</span>}
                  </div>
                  <span className="vote-count">{opt.votes}</span>
                </div>
                <div className="vote-bar-bg">
                  <div className={`vote-bar-fill ${opt.leading ? 'leading' : ''}`} style={{ width: `${opt.pct}%` }} />
                </div>
                <div className="vote-footer">
                  <span className="vote-pct">{opt.pct}% votes</span>
                  <span className="vote-action">Vote →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case 5: // Expenses
      return (
        <div className="carousel-card-content">
          <div className="expense-header-dark">
            <Receipt className="expense-icon" />
            <div>
              <p className="expense-title">Expenses</p>
              <p className="expense-subtitle">Bali Trip 2026</p>
            </div>
          </div>
          <p className="total-label">TOTAL SPENT</p>
          <p className="total-amount">₹12,450</p>
          <div className="due-section">
            <span>Due Amount</span>
            <span className="due-amount">₹800</span>
          </div>
          <div className="expense-list-white">
            {[{ item: 'Hotel Booking', amount: '₹6,000', per: '₹1,200/person', by: 'Sarah', emoji: '🏨' }, { item: 'Group Dinner', amount: '₹1,800', per: '₹360/person', by: 'Mike', emoji: '🍽️' }].map((exp, i) => (
              <div key={i} className={`expense-item ${i === 0 ? 'bordered' : ''}`}>
                <div>
                  <p className="expense-item-name">{exp.emoji} {exp.item}</p>
                  <p className="expense-paid-by">Paid by {exp.by}</p>
                </div>
                <div className="expense-amounts">
                  <p className="expense-total">{exp.amount}</p>
                  <p className="expense-per-person">{exp.per}</p>
                </div>
              </div>
            ))}
            <div className="add-expense-btn">+ Add Expense</div>
          </div>
        </div>
      );
    default:
      return null;
  }
}

export function TravelConnect3DCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 300);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % 6);
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const getCardStyle = (index: number): CSSProperties => {
    const diff = (index - activeIndex + 6) % 6;
    const angleStep = 360 / 6;
    const angle = diff * angleStep;
    const radius = 320;

    const x = Math.sin((angle * Math.PI) / 180) * radius;
    const z = Math.cos((angle * Math.PI) / 180) * radius - radius;
    const rotateY = -angle;

    const isActive = diff === 0;
    const isVisible = diff <= 2 || diff >= 4;
    const scale = isActive ? 1.1 : diff === 1 || diff === 5 ? 0.9 : 0.75;
    const opacity = isActive ? 1 : diff === 1 || diff === 5 ? 0.85 : 0.55;

    return {
      transform: `translateX(${x}px) translateZ(${z}px) rotateY(${rotateY}deg) scale(${scale})`,
      opacity: isVisible ? opacity : 0,
      zIndex: isActive ? 100 : 50 - Math.abs(diff),
      filter: isActive ? 'none' : diff === 1 || diff === 5 ? 'brightness(0.85)' : 'brightness(0.75)'
    };
  };

  return (
    <div className="carousel-wrapper">
      {/* Background Effects */}
      <div className="carousel-bg-pattern" />
      <div
        className="carousel-bg-glow left"
        style={{ background: `radial-gradient(circle, ${steps[activeIndex].color}20 0%, transparent 70%)` }}
      />
      <div
        className="carousel-bg-glow right"
        style={{ background: `radial-gradient(circle, ${steps[(activeIndex + 3) % 6].color}15 0%, transparent 70%)` }}
      />

      {/* Step Indicator */}
      <div className="carousel-step-indicator">
        <div
          className="step-badge"
          style={{
            background: steps[activeIndex].gradient,
            boxShadow: `0 10px 40px ${steps[activeIndex].color}50`
          }}
        >
          STEP {steps[activeIndex].number} of 6
        </div>
      </div>

      {/* 3D Carousel */}
      <div className="carousel-3d-container">
        <div className="carousel-3d-track">
          {steps.map((step, index) => {
            const cardStyle = getCardStyle(index);
            const isActive = index === activeIndex;
            const StepIcon = step.icon;

            return (
              <div
                key={step.id}
                onClick={() => { setActiveIndex(index); setIsAutoPlaying(false); }}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`carousel-card ${isActive ? 'active' : ''}`}
                style={{
                  ...cardStyle,
                  '--glow-color': `${step.color}60`,
                  boxShadow: isActive
                    ? `0 30px 60px rgba(0,0,0,0.5), 0 0 100px ${step.color}50, inset 0 1px 0 rgba(255,255,255,0.15)`
                    : `0 15px 30px rgba(0,0,0,0.3), 0 0 40px ${step.color}20`,
                  borderColor: isActive ? `${step.color}80` : `${step.color}30`,
                } as React.CSSProperties}
              >
                {/* Shine effect */}
                <div
                  className="card-shine"
                  style={{ left: isActive || hoveredCard === index ? '150%' : '-150%' }}
                />

                {/* Large Step Number */}
                <div className="card-step-number">{step.number}</div>

                {/* Card Header */}
                <div className="card-header">
                  <div className="card-header-row">
                    <div
                      className="card-icon-box"
                      style={{
                        background: step.gradient,
                        boxShadow: `0 8px 20px ${step.color}40`
                      }}
                    >
                      <StepIcon className="step-icon" />
                    </div>
                    <div className="step-label">
                      STEP {step.number}
                    </div>
                  </div>
                  <h3 className="card-title">{step.title}</h3>
                  <p className="card-description">{step.description}</p>
                </div>

                {/* Card Content */}
                <CardContent index={index} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="carousel-navigation">
        <button
          onClick={() => { setActiveIndex((activeIndex - 1 + 6) % 6); setIsAutoPlaying(false); }}
          className="nav-btn"
          aria-label="Previous step"
        >
          <ChevronLeft />
        </button>

        {/* Step Dots */}
        <div className="nav-dots">
          {steps.map((step, i) => (
            <button
              key={i}
              onClick={() => { setActiveIndex(i); setIsAutoPlaying(false); }}
              className={`nav-dot ${activeIndex === i ? 'active' : ''}`}
              style={{
                width: activeIndex === i ? '32px' : '12px',
                background: activeIndex === i ? step.gradient : 'rgba(255,255,255,0.2)',
                boxShadow: activeIndex === i ? `0 4px 15px ${step.color}50` : 'none'
              }}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={() => { setActiveIndex((activeIndex + 1) % 6); setIsAutoPlaying(false); }}
          className="nav-btn"
          aria-label="Next step"
        >
          <ChevronRight />
        </button>
      </div>

      {/* Stats */}
      <div className="carousel-stats">
        {[{ val: '50K+', label: 'Active Travelers' }, { val: '120+', label: 'Destinations' }, { val: '98%', label: 'Satisfaction Rate' }].map((stat, i) => (
          <div key={i} className="carousel-stat">
            <p className="carousel-stat-value">{stat.val}</p>
            <p className="carousel-stat-label">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Auto-play indicator */}
      <div className="autoplay-control">
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className={`autoplay-btn ${isAutoPlaying ? 'playing' : ''}`}
        >
          {isAutoPlaying ? '⏸ Auto' : '▶ Play'}
        </button>
      </div>
    </div>
  );
}

export default TravelConnect3DCarousel;
