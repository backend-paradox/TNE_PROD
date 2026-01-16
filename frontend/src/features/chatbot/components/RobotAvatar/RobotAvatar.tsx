import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface RobotAvatarProps {
  size?: number;
  isOpen?: boolean;
}

export function RobotAvatar({ size = 50, isOpen = false }: RobotAvatarProps) {
  const [isWaving, setIsWaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsWaving(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Scale factor based on size (original viewBox is 320x400)
  const scale = size / 320;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size * 1.1 }}>
      <svg
        width={size}
        height={size * 1.1}
        viewBox="0 0 320 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Antenna */}
        <motion.g
          animate={{
            rotate: [-5, 5, -5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ transformOrigin: "160px 80px" }}
        >
          <line x1="160" y1="80" x2="160" y2="50" stroke="#64748B" strokeWidth="4" />
          <motion.circle
            cx="160"
            cy="45"
            r="8"
            fill="#EF4444"
            animate={{
              opacity: [1, 0.3, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.g>

        {/* Head */}
        <motion.g
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <rect
            x="100"
            y="80"
            width="120"
            height="100"
            rx="20"
            fill="url(#robotGradient)"
          />

          {/* Screen/Face area */}
          <rect
            x="110"
            y="95"
            width="100"
            height="70"
            rx="10"
            fill="#1E293B"
            opacity="0.8"
          />

          {/* Eyes */}
          <motion.g
            animate={{
              scaleY: [1, 0.1, 1],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <circle cx="135" cy="125" r="12" fill="#06b6d4" />
            <circle cx="185" cy="125" r="12" fill="#06b6d4" />

            {/* Eye highlights */}
            <circle cx="138" cy="122" r="4" fill="#cffafe" />
            <circle cx="188" cy="122" r="4" fill="#cffafe" />
          </motion.g>

          {/* Mouth display */}
          <motion.rect
            x="130"
            y="145"
            width="60"
            height="8"
            rx="4"
            fill="#10B981"
            animate={{
              width: [60, 70, 60],
              x: [130, 125, 130],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Bolts on head */}
          <circle cx="95" cy="110" r="5" fill="#94A3B8" />
          <circle cx="225" cy="110" r="5" fill="#94A3B8" />
          <circle cx="93" cy="110" r="2" fill="#475569" />
          <circle cx="223" cy="110" r="2" fill="#475569" />
        </motion.g>

        {/* Body */}
        <motion.g
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <rect
            x="90"
            y="185"
            width="140"
            height="120"
            rx="15"
            fill="url(#bodyGradient)"
          />

          {/* Control panel */}
          <rect x="120" y="210" width="80" height="60" rx="8" fill="#1E293B" opacity="0.6" />

          {/* Buttons */}
          <motion.circle
            cx="140"
            cy="235"
            r="8"
            fill="#EF4444"
            animate={{
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.circle
            cx="160"
            cy="235"
            r="8"
            fill="#F59E0B"
            animate={{
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.3,
            }}
          />
          <motion.circle
            cx="180"
            cy="235"
            r="8"
            fill="#10B981"
            animate={{
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.6,
            }}
          />

          {/* Display bars */}
          <rect x="125" y="250" width="70" height="4" rx="2" fill="#14b8a6" opacity="0.8" />
          <rect x="125" y="258" width="50" height="4" rx="2" fill="#14b8a6" opacity="0.6" />
        </motion.g>

        {/* Left Arm */}
        <motion.g
          animate={{
            rotate: [0, -10, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ transformOrigin: "85px 200px" }}
        >
          <rect x="60" y="200" width="25" height="80" rx="12" fill="#64748B" />
          <circle cx="72.5" cy="285" r="15" fill="#94A3B8" />
        </motion.g>

        {/* Right Arm - Waving */}
        <motion.g
          animate={
            isWaving && !isOpen
              ? {
                  rotate: [0, -45, -20, -45, 0],
                }
              : {}
          }
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ transformOrigin: "235px 200px" }}
        >
          <rect x="235" y="200" width="25" height="80" rx="12" fill="#64748B" />
          <motion.circle
            cx="247.5"
            cy="285"
            r="15"
            fill="#94A3B8"
            animate={
              isWaving && !isOpen
                ? {
                    scale: [1, 1.2, 1],
                  }
                : {}
            }
            transition={{
              duration: 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.g>

        {/* Legs */}
        <motion.g
          animate={{
            y: [0, -3, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <rect x="115" y="310" width="30" height="40" rx="8" fill="#64748B" />
          <rect x="175" y="310" width="30" height="40" rx="8" fill="#64748B" />
        </motion.g>

        {/* Sparkles */}
        <motion.path
          d="M275 140 L278 145 L283 143 L279 148 L282 153 L277 150 L273 155 L274 149 L268 147 L273 144 Z"
          fill="#F59E0B"
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Gradients */}
        <defs>
          <linearGradient id="robotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0d9488" />
            <stop offset="100%" stopColor="#0f766e" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default RobotAvatar;
