import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({
  className = '',
  showText = true,
  size = 'md'
}: LogoProps) {
  const sizes = {
    sm: { icon: 32, text: '1.1rem', tagline: '0.55rem' },
    md: { icon: 40, text: '1.35rem', tagline: '0.65rem' },
    lg: { icon: 52, text: '1.6rem', tagline: '0.75rem' },
  };

  const { icon: iconSize, text: textSize, tagline: taglineSize } = sizes[size];

  return (
    <Link to="/" className={`logo-wrapper ${className}`}>
      <div className="logo-mark">
        <img
          src="/assets/images/logo/logo-main.svg"
          alt="Trip & Event Logo"
          width={iconSize}
          height={iconSize}
          style={{
            width: iconSize,
            height: iconSize,
            objectFit: 'contain',
            borderRadius: '8px'
          }}
        />
      </div>

      {showText && (
        <div className="logo-text-container">
          <span className="logo-brand" style={{ fontSize: textSize }}>
            Trip<span className="logo-ampersand">&</span>Event
          </span>
          <span className="logo-tagline" style={{ fontSize: taglineSize }}>
            Explore • Experience • Enjoy
          </span>
        </div>
      )}
    </Link>
  );
}

export default Logo;
