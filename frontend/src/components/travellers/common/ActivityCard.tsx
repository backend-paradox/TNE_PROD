import { Clock, Users, MapPin, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Activity } from '@/types/travellers';
import styles from './ActivityCard.module.css';

interface ActivityCardProps {
  activity: Activity;
}

const typeColors = {
  Meetup: 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)',
  Activity: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
  Vote: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
};

export function ActivityCard({ activity }: ActivityCardProps) {
  const { type, title, time, peopleCount, details, participants, location } = activity;
  const iconGradient = typeColors[type];

  return (
    <div className={styles.card}>
      <div className={styles.cardLayout}>
        <div className={styles.iconContainer} style={{ background: iconGradient }}>
          <Calendar size={24} strokeWidth={2} />
        </div>

        <div className={styles.cardBody}>
          <div className={styles.header}>
            <Badge
              className={styles.typeBadge}
              style={{ backgroundColor: type === 'Meetup' ? '#9333ea' : type === 'Activity' ? '#ec4899' : '#f59e0b', color: 'white', border: 'none' }}
            >
              {type}
            </Badge>
            <div className={styles.timeInfo}>
              <Clock size={14} />
              <span>{time}</span>
            </div>
          </div>

          <h3 className={styles.title}>{title}</h3>
          <p className={styles.details}>{details}</p>

          {location && (
            <div className={styles.location}>
              <MapPin size={14} />
              <span>{location}</span>
            </div>
          )}

          <div className={styles.footer}>
            <div className={styles.participants}>
              <div className={styles.avatarStack}>
                {participants.slice(0, 3).map((participant) => (
                  <Avatar key={participant.id} className={styles.avatar}>
                    <AvatarImage src={participant.avatar} alt={participant.name} />
                    <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <span className={styles.peopleCount}>
                <Users size={16} />
                {peopleCount} people
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
