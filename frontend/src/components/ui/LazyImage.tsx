import { useState, useEffect, useRef } from 'react';
import './LazyImage.css';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  onError?: () => void;
  placeholderSrc?: string;
}

export function LazyImage({
  src,
  alt,
  className = '',
  onError,
  placeholderSrc
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before visible
        threshold: 0.01,
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setIsLoaded(true); // Still mark as loaded to remove blur
    if (onError) onError();
  };

  // Generate a tiny placeholder using CSS gradient as fallback
  const placeholderStyle = placeholderSrc
    ? { backgroundImage: `url(${placeholderSrc})` }
    : { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' };

  return (
    <div className="lazy-image-wrapper" ref={imgRef}>
      {/* Blur placeholder */}
      <div
        className={`lazy-image-placeholder ${isLoaded ? 'loaded' : ''}`}
        style={placeholderStyle}
        aria-hidden="true"
      />

      {/* Actual image - only load when in view */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`lazy-image ${isLoaded ? 'loaded' : ''} ${className}`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      )}
    </div>
  );
}
