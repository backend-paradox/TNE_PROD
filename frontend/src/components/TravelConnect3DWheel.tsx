import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  MessageCircle,
  Users,
  Receipt,
  Calendar,
  Vote,
  Compass,
  X,
  Search,
  Globe,
  Bell,
  Send,
  Clock,
  CreditCard,
  UserPlus,
  Check
} from 'lucide-react';
import './TravelConnect3DWheel.css';

// TypeScript Interfaces
interface MousePosition {
  x: number;
  y: number;
}

interface Feature {
  id: number;
  icon: React.ElementType;
  title: string;
  desc: string;
  color: string;
  shadowColor: string;
  content: React.ReactNode;
}

interface TravelConnect3DWheelProps {
  autoRotate?: boolean;
}

// Main Component
export function TravelConnect3DWheel({ autoRotate = true }: TravelConnect3DWheelProps) {
  const [mousePos, setMousePos] = useState<MousePosition>({ x: 0, y: 0 });
  const [activeFeature, setActiveFeature] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(autoRotate);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Auto rotation for the feature wheel
  useEffect(() => {
    if (!isAutoRotating) return;
    const interval = setInterval(() => {
      setRotationAngle((prev) => (prev + 0.3) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, [isAutoRotating]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left - rect.width / 2) / 40,
      y: (e.clientY - rect.top - rect.height / 2) / 40
    });
  };

  // Feature data
  const features: Feature[] = [
    {
      id: 0,
      icon: MapPin,
      title: 'Travelers Nearby',
      desc: 'Find travel buddies heading to your destination',
      color: 'emerald-teal',
      shadowColor: 'rgba(16, 185, 129, 0.4)',
      content: <TravelersNearbyPanel />
    },
    {
      id: 1,
      icon: MessageCircle,
      title: 'Chat & Connect',
      desc: 'Real-time messaging with fellow travelers',
      color: 'teal-cyan',
      shadowColor: 'rgba(20, 184, 166, 0.4)',
      content: <ChatPanel />
    },
    {
      id: 2,
      icon: Receipt,
      title: 'Bill Splits',
      desc: 'Easy expense tracking and settlements',
      color: 'cyan-emerald',
      shadowColor: 'rgba(6, 182, 212, 0.4)',
      content: <ExpensePanel />
    },
    {
      id: 3,
      icon: Users,
      title: 'Join Groups',
      desc: 'Plan adventures with like-minded travelers',
      color: 'emerald-green',
      shadowColor: 'rgba(16, 185, 129, 0.4)',
      content: <GroupsPanel />
    },
    {
      id: 4,
      icon: Vote,
      title: 'Destination Polls',
      desc: 'Democratic decisions for group activities',
      color: 'green-teal',
      shadowColor: 'rgba(34, 197, 94, 0.4)',
      content: <VotingPanel />
    },
    {
      id: 5,
      icon: Calendar,
      title: 'Trip Planning',
      desc: 'Organize and schedule your adventures',
      color: 'teal-emerald',
      shadowColor: 'rgba(20, 184, 166, 0.4)',
      content: <TripPlanningPanel />
    }
  ];

  const handleFeatureClick = (index: number) => {
    setIsAutoRotating(false);
    setActiveFeature(activeFeature === index ? null : index);

    // Resume auto rotation after 10 seconds of inactivity
    setTimeout(() => {
      if (activeFeature === null) setIsAutoRotating(true);
    }, 10000);
  };

  const closePanel = () => {
    setActiveFeature(null);
    setTimeout(() => setIsAutoRotating(true), 2000);
  };

  return (
    <>
      <div
        ref={containerRef}
        className={`tc3d-container ${isLoaded ? 'tc3d-loaded' : ''}`}
        onMouseMove={handleMouseMove}
      >
        {/* Central Glow */}
        <div className="tc3d-central-glow" />

        {/* Rotating Feature Wheel */}
        <div
          className="tc3d-wheel"
          style={{
            transform: `rotateY(${mousePos.x * -0.3}deg) rotateX(${mousePos.y * 0.3}deg)`
          }}
        >
          {/* Center Hub */}
          <div
            className="tc3d-hub"
            onClick={() => setIsAutoRotating(!isAutoRotating)}
          >
            <div className="tc3d-hub-content">
              <Compass className={`tc3d-hub-icon ${isAutoRotating ? '' : 'paused'}`} />
              <p className="tc3d-hub-text">Explore</p>
              <p className="tc3d-hub-subtext">{isAutoRotating ? 'Auto' : 'Manual'}</p>
            </div>
          </div>

          {/* Orbiting Feature Cards */}
          {features.map((feature, index) => {
            const angle = (index * 60) + rotationAngle;
            const radian = (angle * Math.PI) / 180;
            const radius = 160;
            const x = Math.cos(radian) * radius;
            const y = Math.sin(radian) * radius;
            const zIndex = Math.round(Math.sin(radian) * 10) + 10;
            const scale = 0.8 + (Math.sin(radian) + 1) * 0.15;
            const opacity = 0.6 + (Math.sin(radian) + 1) * 0.2;

            return (
              <div
                key={feature.id}
                className={`tc3d-feature-card ${hoveredFeature === index ? 'hovered' : ''} ${activeFeature === index ? 'active' : ''}`}
                style={{
                  transform: `translate(${x}px, ${y}px) scale(${hoveredFeature === index ? 1.3 : scale}) translateZ(${30 + zIndex * 2}px)`,
                  zIndex: hoveredFeature === index ? 9999 : zIndex,
                  opacity: hoveredFeature === index ? 1 : opacity
                }}
                onClick={() => handleFeatureClick(index)}
                onMouseEnter={() => {
                  setHoveredFeature(index);
                  setIsAutoRotating(false);
                }}
                onMouseLeave={() => {
                  setHoveredFeature(null);
                  if (activeFeature === null) setIsAutoRotating(true);
                }}
              >
                <div
                  className={`tc3d-feature-card-inner color-${feature.color}`}
                  style={{
                    '--shadow-color': feature.shadowColor
                  } as React.CSSProperties}
                >
                  <feature.icon className="tc3d-feature-icon" />
                  <p className="tc3d-feature-title">{feature.title.split(' ')[0]}</p>
                </div>
              </div>
            );
          })}

          {/* Orbital Rings */}
          <div className="tc3d-orbital-ring tc3d-orbital-ring-1" />
          <div className="tc3d-orbital-ring tc3d-orbital-ring-2" />
        </div>

        {/* Floating Tooltip - Outside 3D Context */}
        {hoveredFeature !== null && (() => {
          const angle = (hoveredFeature * 60) + rotationAngle;
          const radian = (angle * Math.PI) / 180;
          const cardRadius = 160;
          const tooltipRadius = 260; // Push tooltip outward from center

          // Position tooltip radially outward from the card
          const x = Math.cos(radian) * tooltipRadius;
          const y = Math.sin(radian) * tooltipRadius;

          // Determine alignment based on position
          // Right side (angles around 0°): align left
          // Left side (angles around 180°): align right
          // Top/Bottom: center align
          const normalizedAngle = ((angle % 360) + 360) % 360;
          let transformX = '-50%'; // default center

          if (normalizedAngle > 45 && normalizedAngle < 135) {
            // Bottom section
            transformX = '-50%';
          } else if (normalizedAngle >= 135 && normalizedAngle < 225) {
            // Left section - align to right of tooltip
            transformX = '-100%';
          } else if (normalizedAngle >= 225 && normalizedAngle < 315) {
            // Top section
            transformX = '-50%';
          } else {
            // Right section - align to left of tooltip
            transformX = '0%';
          }

          return (
            <div
              className="tc3d-tooltip-floating"
              style={{
                position: 'absolute',
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                transform: `translate(${transformX}, -50%)`
              }}
            >
              <p className="tc3d-tooltip-title">{features[hoveredFeature].title}</p>
              <p className="tc3d-tooltip-desc">{features[hoveredFeature].desc}</p>
            </div>
          );
        })()}

        {/* Instruction Text - Moved after tooltip */}
        <p className="tc3d-instruction">
          Click on any feature to explore • Hover to pause rotation
        </p>
      </div>

      {/* Feature Detail Panel - Slides from Right */}
      <div className={`tc3d-panel ${activeFeature !== null ? 'open' : ''}`}>
        {/* Backdrop */}
        <div
          className={`tc3d-panel-backdrop ${activeFeature !== null ? 'visible' : ''}`}
          onClick={closePanel}
        />

        {/* Panel Content */}
        <div className="tc3d-panel-content">
          {activeFeature !== null && (
            <>
              {/* Panel Header */}
              <div className={`tc3d-panel-header color-${features[activeFeature].color}`}>
                <div className="tc3d-panel-header-content">
                  <div className="tc3d-panel-icon-wrapper">
                    {React.createElement(features[activeFeature].icon, {
                      className: 'tc3d-panel-icon'
                    })}
                  </div>
                  <div className="tc3d-panel-header-text">
                    <h3 className="tc3d-panel-title">{features[activeFeature].title}</h3>
                    <p className="tc3d-panel-subtitle">{features[activeFeature].desc}</p>
                  </div>
                </div>
                <button onClick={closePanel} className="tc3d-panel-close">
                  <X />
                </button>
              </div>

              {/* Panel Body */}
              <div className="tc3d-panel-body">
                {features[activeFeature].content}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// Panel Components

function TravelersNearbyPanel() {
  const travelers = [
    { name: 'Rahul Sharma', dest: 'Manali', date: 'Jan 19-26', distance: '2.3 km', status: 'pending', avatar: 'RS', color: 'amber' },
    { name: 'Priya Patel', dest: 'Goa', date: 'Feb 2-8', distance: '5.1 km', status: 'connected', avatar: 'PP', color: 'pink' },
    { name: 'Alex Kumar', dest: 'Dubai', date: 'Mar 10-15', distance: '8.7 km', status: 'new', avatar: 'AK', color: 'blue' },
    { name: 'Sarah Chen', dest: 'Bali', date: 'Feb 15-22', distance: '12 km', status: 'pending', avatar: 'SC', color: 'emerald' },
  ];

  return (
    <div className="tc3d-panel-section">
      {/* Search */}
      <div className="tc3d-search-wrapper">
        <Search className="tc3d-search-icon" />
        <input
          type="text"
          placeholder="Search by destination..."
          className="tc3d-search-input"
        />
      </div>

      {/* Stats */}
      <div className="tc3d-stats-grid">
        <div className="tc3d-stat-card">
          <MapPin className="tc3d-stat-icon" />
          <p className="tc3d-stat-value">10</p>
          <p className="tc3d-stat-label">Nearby</p>
        </div>
        <div className="tc3d-stat-card">
          <Users className="tc3d-stat-icon" />
          <p className="tc3d-stat-value">24</p>
          <p className="tc3d-stat-label">Connected</p>
        </div>
        <div className="tc3d-stat-card">
          <MessageCircle className="tc3d-stat-icon" />
          <p className="tc3d-stat-value">5</p>
          <p className="tc3d-stat-label">Chats</p>
        </div>
      </div>

      {/* Travelers List */}
      <div className="tc3d-list">
        <h4 className="tc3d-section-title">
          <MapPin className="tc3d-title-icon" />
          Nearby Travelers
        </h4>

        {travelers.map((traveler, i) => (
          <div key={i} className="tc3d-traveler-card">
            <div className={`tc3d-avatar bg-${traveler.color}`}>
              <span>{traveler.avatar}</span>
            </div>
            <div className="tc3d-traveler-info">
              <div className="tc3d-traveler-header">
                <p className="tc3d-traveler-name">{traveler.name}</p>
                <span className={`tc3d-badge badge-${traveler.status}`}>{traveler.status}</span>
              </div>
              <p className="tc3d-traveler-dest">📍 {traveler.dest} • {traveler.date}</p>
              <p className="tc3d-traveler-distance">🚶 {traveler.distance} away</p>
            </div>
            <button className="tc3d-btn-icon">
              <MessageCircle />
            </button>
          </div>
        ))}
      </div>

      {/* Connect Button */}
      <button className="tc3d-btn-primary">
        <Users /> View All Travelers
      </button>
    </div>
  );
}

function ChatPanel() {
  const messages = [
    { sender: 'them', text: 'Hey! 👋 Heading to Manali too?', time: '10:24 AM' },
    { sender: 'me', text: 'Yes! Would love to connect! 🎿', time: '10:26 AM' },
    { sender: 'them', text: 'Perfect! Let\'s plan together ⛷️', time: '10:27 AM' },
    { sender: 'me', text: 'I\'m thinking of going skiing on Day 2', time: '10:28 AM' },
    { sender: 'them', text: 'That sounds amazing! Count me in 🙌', time: '10:30 AM' },
  ];

  return (
    <div className="tc3d-panel-section">
      {/* Chat Header */}
      <div className="tc3d-chat-header">
        <div className="tc3d-avatar color-amber">RS</div>
        <div className="tc3d-chat-user">
          <h4 className="tc3d-chat-name">Rahul Sharma</h4>
          <div className="tc3d-online-status">
            <div className="tc3d-online-dot" />
            <span>Online</span>
          </div>
        </div>
        <button className="tc3d-icon-btn">
          <Bell />
        </button>
      </div>

      {/* Messages */}
      <div className="tc3d-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`tc3d-message ${msg.sender}`}>
            <div className="tc3d-message-bubble">
              <p className="tc3d-message-text">{msg.text}</p>
              <p className="tc3d-message-time">{msg.time}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="tc3d-chat-input">
        <input
          type="text"
          placeholder="Type a message..."
          className="tc3d-input"
        />
        <button className="tc3d-btn-send">
          <Send />
        </button>
      </div>
    </div>
  );
}

function ExpensePanel() {
  const expenses = [
    { item: 'Hotel Booking', amount: 600, by: 'Sarah', perPerson: 120, emoji: '🏨' },
    { item: 'Group Dinner', amount: 180, by: 'Mike', perPerson: 36, emoji: '🍽️' },
    { item: 'Scooter Rentals', amount: 250, by: 'You', perPerson: 50, emoji: '🛵' },
  ];

  return (
    <div className="tc3d-panel-section">
      {/* Summary Cards */}
      <div className="tc3d-expense-summary">
        <div className="tc3d-expense-card">
          <CreditCard className="tc3d-expense-icon" />
          <p className="tc3d-expense-value">₹600</p>
          <p className="tc3d-expense-label">Total Spent</p>
        </div>
        <div className="tc3d-expense-card">
          <Clock className="tc3d-expense-icon" />
          <p className="tc3d-expense-value warning">₹0</p>
          <p className="tc3d-expense-label">Pending</p>
        </div>
        <div className="tc3d-expense-card">
          <Receipt className="tc3d-expense-icon" />
          <p className="tc3d-expense-value success">₹300</p>
          <p className="tc3d-expense-label">Your Balance</p>
        </div>
      </div>

      {/* Group Balances */}
      <div className="tc3d-section-card">
        <h4 className="tc3d-section-title">
          <Users className="tc3d-title-icon" />
          Group Balances
        </h4>
        <div className="tc3d-balance-grid">
          <div className="tc3d-balance-card">
            <div className="tc3d-avatar color-teal">BS</div>
            <p className="tc3d-balance-name">Bhaskar Sarkar</p>
            <p className="tc3d-balance-amount success">↓ Owed ₹300</p>
          </div>
          <div className="tc3d-balance-card">
            <div className="tc3d-avatar color-cyan">SS</div>
            <p className="tc3d-balance-name">Shubha Sarkar</p>
            <p className="tc3d-balance-amount danger">↗ Owes ₹300</p>
          </div>
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="tc3d-list">
        <h4 className="tc3d-section-title">
          <Receipt className="tc3d-title-icon" />
          Recent Expenses
        </h4>
        {expenses.map((expense, i) => (
          <div key={i} className="tc3d-expense-item">
            <div className="tc3d-expense-info">
              <span className="tc3d-expense-emoji">{expense.emoji}</span>
              <div>
                <p className="tc3d-expense-name">{expense.item}</p>
                <p className="tc3d-expense-by">Paid by {expense.by}</p>
              </div>
            </div>
            <div className="tc3d-expense-amounts">
              <p className="tc3d-expense-total">₹{expense.amount}</p>
              <p className="tc3d-expense-split">₹{expense.perPerson}/person</p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Expense Button */}
      <button className="tc3d-btn-primary">
        <span className="tc3d-btn-plus">+</span> Add New Expense
      </button>
    </div>
  );
}

function GroupsPanel() {
  const groups = [
    { name: 'Bali Adventure Squad', members: 5, days: 10, status: 'active', emoji: '🌴' },
    { name: 'Manali Snow Trip', members: 8, days: 7, status: 'planning', emoji: '🏔️' },
    { name: 'Goa Beach Party', members: 12, days: 5, status: 'upcoming', emoji: '🏖️' },
  ];

  return (
    <div className="tc3d-panel-section">
      {/* Create Group */}
      <button className="tc3d-btn-primary">
        <UserPlus /> Create New Group
      </button>

      {/* Groups List */}
      <div className="tc3d-list">
        {groups.map((group, i) => (
          <div key={i} className="tc3d-group-card">
            <div className="tc3d-group-icon">{group.emoji}</div>
            <div className="tc3d-group-info">
              <div className="tc3d-group-header">
                <h4 className="tc3d-group-name">{group.name}</h4>
                <span className={`tc3d-badge badge-${group.status}`}>{group.status}</span>
              </div>
              <p className="tc3d-group-meta">👥 {group.members} members • 📅 {group.days} days</p>
              {/* Member Avatars */}
              <div className="tc3d-group-avatars">
                {[...Array(Math.min(group.members, 5))].map((_, j) => (
                  <div key={j} className="tc3d-group-avatar" />
                ))}
                {group.members > 5 && (
                  <div className="tc3d-group-avatar-more">+{group.members - 5}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Invitations */}
      <div className="tc3d-notification-card">
        <div className="tc3d-notification-icon">
          <Bell />
        </div>
        <div className="tc3d-notification-text">
          <p className="tc3d-notification-title">2 Pending Invitations</p>
          <p className="tc3d-notification-subtitle">People want you to join their trip!</p>
        </div>
        <button className="tc3d-btn-view">View</button>
      </div>
    </div>
  );
}

function VotingPanel() {
  const polls = [
    {
      question: 'Day 5 Activity?',
      options: [
        { name: 'Mount Batur Trek', votes: 4, emoji: '⛰️' },
        { name: 'Nusa Penida Tour', votes: 3, emoji: '🏝️' },
        { name: 'Beach Day', votes: 2, emoji: '🏖️' },
      ],
      deadline: '2 days left',
      totalVotes: 5
    }
  ];

  return (
    <div className="tc3d-panel-section">
      {polls.map((poll, i) => (
        <div key={i} className="tc3d-poll-card">
          <div className="tc3d-poll-header">
            <div>
              <h4 className="tc3d-poll-question">🗳️ {poll.question}</h4>
              <p className="tc3d-poll-meta">{poll.totalVotes} members • ⏰ {poll.deadline}</p>
            </div>
          </div>

          <div className="tc3d-poll-options">
            {poll.options.map((option, j) => {
              const percentage = Math.round((option.votes / poll.totalVotes) * 100);
              const isLeading = option.votes === Math.max(...poll.options.map(o => o.votes));

              return (
                <div key={j} className={`tc3d-poll-option ${isLeading ? 'leading' : ''}`}>
                  <div className="tc3d-poll-option-header">
                    <div className="tc3d-poll-option-info">
                      <span className="tc3d-poll-emoji">{option.emoji}</span>
                      <span className="tc3d-poll-option-name">{option.name}</span>
                      {isLeading && (
                        <span className="tc3d-badge badge-leading">🏆 Leading</span>
                      )}
                    </div>
                    <span className="tc3d-poll-votes">{option.votes}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="tc3d-progress-bar">
                    <div
                      className={`tc3d-progress-fill ${isLeading ? 'leading' : ''}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="tc3d-poll-percentage">{percentage}% votes</p>
                </div>
              );
            })}
          </div>

          <button className="tc3d-btn-primary">✅ Submit Vote</button>
        </div>
      ))}

      {/* Create Poll */}
      <button className="tc3d-btn-secondary">
        <Vote /> Create New Poll
      </button>
    </div>
  );
}

function TripPlanningPanel() {
  const itinerary = [
    { day: 'Day 1', activity: 'Ubud Rice Terraces', by: 'Sarah', emoji: '🌾', status: 'confirmed' },
    { day: 'Day 2', activity: 'Tanah Lot Temple', by: 'Mike', emoji: '🛕', status: 'confirmed' },
    { day: 'Day 3', activity: 'Scuba Diving', by: 'Emma', emoji: '🤿', status: 'pending' },
    { day: 'Day 4', activity: 'Mount Batur Sunrise', by: 'You', emoji: '⛰️', status: 'voting' },
  ];

  return (
    <div className="tc3d-panel-section">
      {/* Trip Overview */}
      <div className="tc3d-trip-overview">
        <div className="tc3d-trip-icon">🌴</div>
        <div className="tc3d-trip-info">
          <h4 className="tc3d-trip-name">Bali Adventure</h4>
          <p className="tc3d-trip-date">Jan 15 - Jan 25, 2026</p>
          <p className="tc3d-trip-meta">5 travelers • 10 days</p>
        </div>
      </div>

      {/* Itinerary */}
      <div className="tc3d-list">
        <h4 className="tc3d-section-title">
          <Calendar className="tc3d-title-icon" />
          Itinerary
        </h4>

        {itinerary.map((item, i) => (
          <div key={i} className="tc3d-itinerary-item">
            <div className={`tc3d-itinerary-status status-${item.status}`}>
              {item.status === 'confirmed' && <Check />}
              {item.status === 'pending' && <Clock />}
              {item.status === 'voting' && <Vote />}
            </div>
            <div className="tc3d-itinerary-info">
              <p className="tc3d-itinerary-title">{item.emoji} {item.day}: {item.activity}</p>
              <p className="tc3d-itinerary-by">Added by {item.by}</p>
            </div>
            <span className={`tc3d-badge badge-${item.status}`}>{item.status}</span>
          </div>
        ))}
      </div>

      {/* Add Activity */}
      <button className="tc3d-btn-primary">
        <span className="tc3d-btn-plus">+</span> Add Activity
      </button>
    </div>
  );
}
