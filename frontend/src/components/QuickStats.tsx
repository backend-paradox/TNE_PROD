import { useEffect, useState, useRef } from 'react';
import { Users, MapPin, Award, Headphones } from 'lucide-react';
import './QuickStats.css';

interface StatItem {
  icon: typeof Users;
  value: number;
  suffix: string;
  label: string;
  decimals?: number;
}

const stats: StatItem[] = [
  { icon: Users, value: 10000, suffix: '+', label: 'Happy Travelers' },
  { icon: MapPin, value: 500, suffix: '+', label: 'Destinations' },
  { icon: Award, value: 15, suffix: '+', label: 'Years Experience' },
  { icon: Headphones, value: 24, suffix: ' X 7', label: 'Customer Care Service' }
];

function CountUp({
  end,
  duration = 2000,
  decimals = 0,
  suffix = ''
}: {
  end: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  // Intersection Observer to detect when in view
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '-100px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Count-up animation
  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    const startValue = 0;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = startValue + (end - startValue) * easeOutQuart;

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  const displayValue = decimals > 0
    ? count.toFixed(decimals)
    : Math.floor(count).toLocaleString();

  return (
    <span ref={ref} className="stat-value">
      {displayValue}{suffix}
    </span>
  );
}

export function QuickStats() {
  return (
    <section className="quick-stats">
      <div className="quick-stats-container">
        <div className="stats-grid quick-stats-fade-in">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="stat-item stat-item-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="quick-stats-icon">
                  <Icon />
                </div>
                <CountUp
                  end={stat.value}
                  suffix={stat.suffix}
                  decimals={stat.decimals || 0}
                />
                <span className="stat-label">{stat.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
