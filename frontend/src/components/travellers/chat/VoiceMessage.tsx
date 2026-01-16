import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import styles from './VoiceMessage.module.css';

interface VoiceMessageProps {
  duration?: string;
  waveform?: number[];
  timestamp: string;
  isOwn?: boolean;
  audioUrl?: string;
}

export function VoiceMessage({ duration = '0:00', timestamp, isOwn, audioUrl }: VoiceMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(() => parseDuration(duration));
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  // Parse duration to seconds
  function parseDuration(dur: string): number {
    const parts = dur.split(':').map((part) => Number(part));
    if (parts.length === 1 && Number.isFinite(parts[0])) {
      return parts[0];
    }
    if (parts.length >= 2 && Number.isFinite(parts[0]) && Number.isFinite(parts[1])) {
      return parts[0] * 60 + parts[1];
    }
    return 0;
  }

  const formatDurationLabel = (seconds: number) => {
    const safeSeconds = Math.max(0, Math.floor(seconds));
    const mins = Math.floor(safeSeconds / 60);
    const secs = safeSeconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!audioUrl) {
      setDurationSeconds(parseDuration(duration));
      return;
    }
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      if (Number.isFinite(audio.duration)) {
        setDurationSeconds(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentSeconds(audio.currentTime);
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentSeconds(0);
      setProgress(0);
      audio.currentTime = 0;
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl, duration]);

  useEffect(() => {
    if (!isPlaying || audioUrl) {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      return;
    }

    if (!durationSeconds) return;

    progressInterval.current = setInterval(() => {
      setCurrentSeconds((prev) => {
        const next = prev + 0.1;
        if (next >= durationSeconds) {
          setIsPlaying(false);
          setProgress(0);
          return 0;
        }
        setProgress((next / durationSeconds) * 100);
        return next;
      });
    }, 100);

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isPlaying, audioUrl, durationSeconds]);

  const handlePlayPause = () => {
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        return;
      }
      if (progress >= 100) {
        audioRef.current.currentTime = 0;
        setProgress(0);
        setCurrentSeconds(0);
      }
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
      return;
    }

    if (progress >= 100) {
      setProgress(0);
      setCurrentSeconds(0);
    }
    setIsPlaying(!isPlaying);
  };

  const displayDuration = durationSeconds ? formatDurationLabel(durationSeconds) : duration;
  const displayCurrent =
    isPlaying || currentSeconds > 0
      ? formatDurationLabel(currentSeconds)
      : displayDuration;

  return (
    <div className={`${styles.container} ${isOwn ? styles.own : ''}`}>
      {/* Play/Pause Button */}
      <motion.button
        className={styles.playButton}
        onClick={handlePlayPause}
        whileTap={{ scale: 0.95 }}
      >
        {isPlaying ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" />}
      </motion.button>

      {/* Progress Bar */}
      <div className={styles.waveformContainer}>
        <div className={styles.waveform}>
          <div
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Duration */}
        <div className={styles.timeInfo}>
          <span className={styles.currentTime}>
            {displayCurrent}
          </span>
          <span className={styles.timestamp}>{timestamp}</span>
        </div>
      </div>
    </div>
  );
}
