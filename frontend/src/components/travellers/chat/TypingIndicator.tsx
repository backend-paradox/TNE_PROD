import { motion } from 'framer-motion';
import styles from './TypingIndicator.module.css';

interface TypingIndicatorProps {
  users: Array<{
    name: string;
    avatar: string;
  }>;
}

export function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  const getTypingText = () => {
    if (users.length === 1) {
      return `${users[0].name} is typing`;
    } else if (users.length === 2) {
      return `${users[0].name} and ${users[1].name} are typing`;
    } else {
      return `${users[0].name} and ${users.length - 1} others are typing`;
    }
  };

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
    >
      {/* Avatars */}
      <div className={styles.avatars}>
        {users.slice(0, 3).map((user, index) => (
          <img
            key={index}
            src={user.avatar}
            alt={user.name}
            className={styles.avatar}
            style={{ zIndex: 3 - index }}
          />
        ))}
      </div>

      {/* Typing Bubble */}
      <div className={styles.bubble}>
        <div className={styles.dots}>
          <motion.div
            className={styles.dot}
            animate={{ y: [0, -5, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0,
            }}
          />
          <motion.div
            className={styles.dot}
            animate={{ y: [0, -5, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.15,
            }}
          />
          <motion.div
            className={styles.dot}
            animate={{ y: [0, -5, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.3,
            }}
          />
        </div>
      </div>

      {/* Typing Text */}
      <span className={styles.text}>{getTypingText()}</span>
    </motion.div>
  );
}
