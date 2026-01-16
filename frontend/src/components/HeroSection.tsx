import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Mic, MicOff, Play, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMediaUrl } from '@/utils';
import './HeroSection.css';

const popularDestinations = [
  'Kashmir',
  'Kerala',
  'Goa',
  'Rajasthan',
  'Bali',
  'Thailand',
];

export function HeroSection() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(true);
  const recognitionRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  // Lazy load video using Intersection Observer
  useEffect(() => {
    if (!heroRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !shouldLoadVideo) {
            setShouldLoadVideo(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '100px', // Start loading 100px before hero is visible
        threshold: 0.1,
      }
    );

    observer.observe(heroRef.current);

    return () => observer.disconnect();
  }, [shouldLoadVideo]);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setVoiceSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'en-IN';

      recognitionRef.current.onresult = (e: any) => {
        setDestination(e.results[0][0].transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleVoice = () => {
    if (!voiceSupported) {
      alert('Voice search is not supported in your browser. Please try Chrome, Edge, or Safari.');
      return;
    }
    isListening
      ? recognitionRef.current?.stop()
      : recognitionRef.current?.start();
    setIsListening(!isListening);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(
      destination
        ? `/trips?destination=${encodeURIComponent(destination)}`
        : '/trips'
    );
  };

  return (
    <section className="hero" ref={heroRef}>
      {/* Video/Image Background */}
      <div className="hero__bg">
        {!videoError && shouldLoadVideo ? (
          <iframe
            className={`hero__video ${videoLoaded ? 'loaded' : ''}`}
            src="https://www.youtube.com/embed/-FpmQjNjL1Y?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=-FpmQjNjL1Y&modestbranding=1&playsinline=1&disablekb=1"
            allow="autoplay; encrypted-media"
            allowFullScreen
            title="Trip & Event - World's First CineMatrip Travel Experiences"
            onLoad={() => setTimeout(() => setVideoLoaded(true), 1500)}
          />
        ) : (
          <img
            className="hero__image"
            src={getMediaUrl("/assets/images/hero/homepage_hero_beach.jpeg")}
            alt="Scenic travel destination background"
            loading="eager"
          />
        )}
        <div className="hero__overlay" />
      </div>

      {/* Main Content */}
      <div className="hero__container">
        <div className="hero__content">
          {/* Brand Badge */}
          <motion.div
            className="hero__badge"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Play size={14} />
            <span>WORLD FIRST CINEMATRIP BRAND</span>
          </motion.div>

          {/* Main Heading */}

          <motion.h2
            className="hero__subtitle"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            Seamless journeys <br/> <span className="hero__highlight">Unforgettable</span> experiences{' '}
            
          </motion.h2>

          {/* Search Box */}
          <motion.div
            className="hero__search"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            <form onSubmit={handleSearch} className="hero__search-form">
              <div className="hero__search-field">
                <MapPin size={20} />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Where do you want to go?"
                />
              </div>

              <button
                type="button"
                className={`hero__mic-btn ${isListening ? 'active' : ''}`}
                onClick={toggleVoice}
                aria-label={isListening ? "Stop voice search" : "Voice search for destinations"}
                aria-pressed={isListening}
                title={voiceSupported ? "Search destinations by voice" : "Voice search not supported"}
                disabled={!voiceSupported}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>

              <button type="submit" className="hero__search-btn" aria-label="Search destinations">
                <Search size={20} />
                <span>Search</span>
              </button>
            </form>

            {/* Suggestions Dropdown */}
            <AnimatePresence>
              {showSuggestions && (
                <motion.div
                  className="hero__suggestions"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <p className="hero__suggestions-title">Popular Destinations</p>
                  <div className="hero__suggestions-list">
                    {popularDestinations.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          setDestination(d);
                          setShowSuggestions(false);
                        }}
                      >
                        <MapPin size={16} />
                        {d}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

        </div>
      </div>

      {/* Voice Modal */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            className="hero__voice-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleVoice}
            role="dialog"
            aria-modal="true"
            aria-label="Voice search active"
          >
            <motion.div
              className="hero__voice-card"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="hero__voice-icon hero__voice-icon--search" aria-hidden="true">
                <Mic size={32} />
              </div>
              <h3>Listening for destination...</h3>
              <p aria-live="polite">Say a destination name like "Bali", "Maldives", or "Kashmir"</p>
              <button onClick={toggleVoice} aria-label="Cancel voice search">Cancel</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
