import React from 'react';

interface DoodleIconProps {
  name: string;
  className?: string;
}

/**
 * Custom Hand-Drawn SVG Doodle Icons for diCatat.
 * Replaces OS emojis (💸, 💰, 🔄, 🍜, 🛵, 🛒, ⚡, 🎮, 💵, 🏦, 📱, ✏️, 🎯, 💡, etc.)
 * with genuine hand-sketched SVG artwork that matches Si Oren Akuntan!
 */
export const DoodleIcon: React.FC<DoodleIconProps> = ({
  name,
  className = 'w-6 h-6',
}) => {
  const renderIcon = () => {
    switch (name) {
      case 'expense':
      case '💸':
        // Flying Banknote with Hand-Drawn Wings
        return (
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            {/* Left Wing */}
            <path
              d="M9 15 C3 9, 2 16, 7 18 C3 19, 5 24, 10 21"
              fill="#FFFDF7"
              stroke="#2C2A29"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Right Wing */}
            <path
              d="M27 15 C33 9, 34 16, 29 18 C33 19, 31 24, 26 21"
              fill="#FFFDF7"
              stroke="#2C2A29"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Banknote Body */}
            <path
              d="M8 13 C14 12, 22 12, 28 13 C29 17, 29 21, 28 25 C22 26, 14 26, 8 25 C7 21, 7 17, 8 13 Z"
              fill="#A8E6CF"
              stroke="#2C2A29"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <circle cx="18" cy="19" r="3.5" fill="#FFE066" stroke="#2C2A29" strokeWidth="2.2" />
            <path d="M11 16 L12 16 M24 22 L25 22" stroke="#2C2A29" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        );

      case 'income':
      case 'salary':
      case '💰':
        // Hand-Drawn Money Pouch with Coin
        return (
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            {/* Pouch Top Frill */}
            <path
              d="M13 10 C11 6, 16 5, 18 8 C20 5, 25 6, 23 10 Z"
              fill="#FFE066"
              stroke="#2C2A29"
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
            {/* Pouch Body */}
            <path
              d="M13 11 C7 15, 6 26, 12 29 C16 31, 20 31, 24 29 C30 26, 29 15, 23 11 Z"
              fill="#FFE066"
              stroke="#2C2A29"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Tie String */}
            <path d="M12 11 Q18 13 24 11" stroke="#FF8B94" strokeWidth="3" strokeLinecap="round" />
            {/* Rp / Currency Mark */}
            <path
              d="M18 16 L18 26 M21 18 C21 16.5, 15 16.5, 15 19 C15 21, 21 21, 21 23.5 C21 25.5, 15 25.5, 15 24"
              stroke="#2C2A29"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </svg>
        );

      case 'transfer':
      case '🔄':
        // Hand-Drawn Circular Swap Arrows
        return (
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <path
              d="M8 15 C10 9, 22 8, 27 14"
              stroke="#2C2A29"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
            <path
              d="M23 9 L28 14 L22 17"
              stroke="#2C2A29"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M28 21 C26 27, 14 28, 9 22"
              stroke="#2C2A29"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
            <path
              d="M13 27 L8 22 L14 19"
              stroke="#2C2A29"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );

      case 'camera':
      case 'scan':
      case '📸':
        // Hand-Drawn Doodle Camera
        return (
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <path
              d="M7 13 C7 11, 9 11, 12 11 L14 8 L22 8 L24 11 C27 11, 29 11, 29 13 L29 26 C29 28, 27 28, 25 28 L11 28 C9 28, 7 28, 7 26 Z"
              fill="#FFFDF7"
              stroke="#2C2A29"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <circle cx="18" cy="19.5" r="5" fill="#A0C4FF" stroke="#2C2A29" strokeWidth="2.4" />
            <circle cx="16.5" cy="18" r="1.3" fill="#FFFDF7" />
            <circle cx="25" cy="14.5" r="1.3" fill="#FF8B94" />
          </svg>
        );

      case 'food':
      case '🍜':
        // Hand-Drawn Warm Ramen Bowl & Chopsticks
        return (
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            {/* Chopsticks */}
            <path d="M10 9 L27 7 M12 12 L27 11" stroke="#2C2A29" strokeWidth="2.3" strokeLinecap="round" />
            {/* Steam */}
            <path d="M15 13 Q14 15 16 17 M21 13 Q20 15 22 17" stroke="#2C2A29" strokeWidth="2" strokeLinecap="round" />
            {/* Bowl */}
            <path
              d="M6 18 L30 18 C29 26, 24 29, 18 29 C12 29, 7 26, 6 18 Z"
              fill="#FF8B94"
              stroke="#2C2A29"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path d="M13 29 L23 29" stroke="#2C2A29" strokeWidth="2.8" strokeLinecap="round" />
          </svg>
        );

      case 'transport':
      case '🛵':
        // Hand-Drawn Cute Scooter / Vehicle
        return (
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <circle cx="10" cy="25" r="4" fill="#FFFDF7" stroke="#2C2A29" strokeWidth="2.5" />
            <circle cx="26" cy="25" r="4" fill="#FFFDF7" stroke="#2C2A29" strokeWidth="2.5" />
            <path
              d="M10 25 L18 25 L22 15 L17 15 M22 11 L26 11 L24 21 L28 21"
              stroke="#2C2A29"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M11 18 L18 18 L19 23 L10 23 Z"
              fill="#FFE066"
              stroke="#2C2A29"
              strokeWidth="2.3"
              strokeLinejoin="round"
            />
          </svg>
        );

      case 'shopping':
      case '🛒':
        // Hand-Drawn Doodle Shopping Tote / Basket
        return (
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <path
              d="M13 14 C13 8, 23 8, 23 14"
              stroke="#2C2A29"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M8 14 L28 14 L26 28 C26 29, 10 29, 10 28 Z"
              fill="#FFE066"
              stroke="#2C2A29"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path d="M14 19 L14 24 M18 19 L18 24 M22 19 L22 24" stroke="#2C2A29" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        );

      case 'bills':
      case '⚡':
        // Hand-Drawn Lightning Bolt
        return (
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <path
              d="M20 5 L9 20 L18 20 L15 31 L27 16 L18 16 Z"
              fill="#FFE066"
              stroke="#2C2A29"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          </svg>
        );

      case 'fun':
      case '🎮':
        // Hand-Drawn Gamepad
        return (
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <path
              d="M9 13 L27 13 C30 13, 31 23, 28 26 C26 28, 23 25, 21 22 L15 22 C13 25, 10 28, 8 26 C5 23, 6 13, 9 13 Z"
              fill="#BDB2FF"
              stroke="#2C2A29"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path d="M12 16 L12 20 M10 18 L14 18" stroke="#2C2A29" strokeWidth="2.3" strokeLinecap="round" />
            <circle cx="23" cy="17" r="1.4" fill="#2C2A29" />
            <circle cx="25.5" cy="19" r="1.4" fill="#2C2A29" />
          </svg>
        );

      case 'freelance':
      case '🎨':
        // Hand-Drawn Art Palette / Star
        return (
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <path
              d="M18 6 L21.5 13.5 L30 14.5 L23.5 20.5 L25 29 L18 24.5 L11 29 L12.5 20.5 L6 14.5 L14.5 13.5 Z"
              fill="#FFE066"
              stroke="#2C2A29"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          </svg>
        );

      case 'cash':
      case '💵':
        // Hand-Drawn Cash Stack
        return (
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <rect
              x="6"
              y="11"
              width="24"
              height="15"
              rx="3"
              fill="#A8E6CF"
              stroke="#2C2A29"
              strokeWidth="2.5"
            />
            <circle cx="18" cy="18.5" r="3.5" fill="#FFE066" stroke="#2C2A29" strokeWidth="2.2" />
            <path d="M10 15 L10 22 M26 15 L26 22" stroke="#2C2A29" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        );

      case 'bank':
      case '🏦':
        // Hand-Drawn Bank Building
        return (
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <path
              d="M18 6 L6 13 L30 13 Z"
              fill="#FFE066"
              stroke="#2C2A29"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path d="M10 13 L10 24 M18 13 L18 24 M26 13 L26 24" stroke="#2C2A29" strokeWidth="2.6" strokeLinecap="round" />
            <path
              d="M6 25 L30 25 L30 28 L6 28 Z"
              fill="#FFFDF7"
              stroke="#2C2A29"
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
          </svg>
        );

      case 'ewallet':
      case '📱':
        // Hand-Drawn Smartphone E-Wallet
        return (
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <rect
              x="10"
              y="6"
              width="16"
              height="24"
              rx="3.5"
              fill="#FFFDF7"
              stroke="#2C2A29"
              strokeWidth="2.5"
            />
            <path d="M15 9.5 L21 9.5" stroke="#2C2A29" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="18" cy="18" r="3.5" fill="#FFE066" stroke="#2C2A29" strokeWidth="2" />
            <circle cx="18" cy="26.5" r="1.2" fill="#2C2A29" />
          </svg>
        );

      case 'paw':
      case '🐾':
      case '🐱':
        // Hand-Drawn Cat Paw Print
        return (
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <ellipse cx="18" cy="22" rx="6.5" ry="5.2" fill="#FF9F43" stroke="#2C2A29" strokeWidth="2.4" />
            <circle cx="10.5" cy="15" r="2.7" fill="#FF9F43" stroke="#2C2A29" strokeWidth="2.2" />
            <circle cx="15.5" cy="11.5" r="2.7" fill="#FF9F43" stroke="#2C2A29" strokeWidth="2.2" />
            <circle cx="21" cy="11.5" r="2.7" fill="#FF9F43" stroke="#2C2A29" strokeWidth="2.2" />
            <circle cx="26" cy="15" r="2.7" fill="#FF9F43" stroke="#2C2A29" strokeWidth="2.2" />
          </svg>
        );

      case 'pencil':
      case '✏️':
      case '📝':
        // Hand-Drawn Pencil
        return (
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <path
              d="M23 7 L29 13 L14 28 L7 29 L8 22 Z"
              fill="#FFE066"
              stroke="#2C2A29"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path d="M20 10 L26 16" stroke="#2C2A29" strokeWidth="2.3" />
            <path d="M7 29 L11 28 L8 25 Z" fill="#2C2A29" />
          </svg>
        );

      case 'notebook':
      case '📓':
      case '📚':
        // Hand-Drawn Journal Notebook
        return (
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <rect
              x="9"
              y="6"
              width="19"
              height="24"
              rx="3"
              fill="#FFE066"
              stroke="#2C2A29"
              strokeWidth="2.5"
            />
            <path d="M7 10 L11 10 M7 16 L11 16 M7 22 L11 22 M7 26 L11 26" stroke="#2C2A29" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M15 13 L23 13 M15 18 L21 18" stroke="#2C2A29" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        );

      case 'wallet':
      case '👛':
        // Hand-Drawn Coin Purse / Wallet
        return (
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <rect
              x="6"
              y="10"
              width="24"
              height="18"
              rx="4"
              fill="#FF9F43"
              stroke="#2C2A29"
              strokeWidth="2.5"
            />
            <path
              d="M22 16 L30 16 L30 22 L22 22 C20 22, 20 16, 22 16 Z"
              fill="#FFE066"
              stroke="#2C2A29"
              strokeWidth="2.3"
            />
            <circle cx="23.5" cy="19" r="1.2" fill="#2C2A29" />
          </svg>
        );

      case 'target':
      case '🎯':
        // Hand-Drawn Target Bullseye with Dart
        return (
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <circle cx="17" cy="19" r="11" fill="#FFE5E7" stroke="#2C2A29" strokeWidth="2.5" />
            <circle cx="17" cy="19" r="6.5" fill="#FFFDF7" stroke="#2C2A29" strokeWidth="2.3" />
            <circle cx="17" cy="19" r="2.8" fill="#FF8B94" stroke="#2C2A29" strokeWidth="2" />
            {/* Little Dart */}
            <path d="M18 18 L28 8" stroke="#2C2A29" strokeWidth="2.4" strokeLinecap="round" />
            <path
              d="M26 7 L31 5 L29 10 Z"
              fill="#A0C4FF"
              stroke="#2C2A29"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        );

      case 'boba':
      case '🧋':
        // Hand-Drawn Cup / Drink
        return (
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <path d="M20 5 L17 13" stroke="#2C2A29" strokeWidth="2.6" strokeLinecap="round" />
            <path
              d="M10 13 L26 13 L24 29 L12 29 Z"
              fill="#FFD8A8"
              stroke="#2C2A29"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path d="M8 13 L28 13" stroke="#2C2A29" strokeWidth="2.8" strokeLinecap="round" />
            <circle cx="15" cy="25" r="1.5" fill="#2C2A29" />
            <circle cx="18.5" cy="26" r="1.5" fill="#2C2A29" />
            <circle cx="21.5" cy="24.5" r="1.5" fill="#2C2A29" />
          </svg>
        );

      case 'movie':
      case '🎬':
        // Hand-Drawn Movie Clapperboard
        return (
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <rect x="6" y="13" width="24" height="16" rx="2.5" fill="#BDB2FF" stroke="#2C2A29" strokeWidth="2.4" />
            <path d="M6 9 L30 9 L30 14 L6 14 Z" fill="#FFE066" stroke="#2C2A29" strokeWidth="2.4" strokeLinejoin="round" />
            <path d="M11 9 L14 14 M19 9 L22 14" stroke="#2C2A29" strokeWidth="2.2" />
          </svg>
        );

      case 'health':
      case '💊':
        // Hand-Drawn First Aid Heart / Capsule
        return (
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <rect x="7" y="10" width="22" height="17" rx="3.5" fill="#FFE5E7" stroke="#2C2A29" strokeWidth="2.4" />
            <path d="M14 10 L14 7 L22 7 L22 10" stroke="#2C2A29" strokeWidth="2.3" strokeLinejoin="round" />
            <path d="M18 14 L18 23 M13.5 18.5 L22.5 18.5" stroke="#FF8B94" strokeWidth="3.2" strokeLinecap="round" />
          </svg>
        );

      case 'travel':
      case '✈️':
        // Hand-Drawn Paper Airplane
        return (
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <path
              d="M5 17 L30 7 L23 29 L16 21 L5 17 Z"
              fill="#A0C4FF"
              stroke="#2C2A29"
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
            <path d="M30 7 L16 21 L16 28 L20 24" stroke="#2C2A29" strokeWidth="2.2" strokeLinejoin="round" />
          </svg>
        );

      case 'gift':
      case '🎁':
        // Hand-Drawn Gift Box
        return (
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <rect x="8" y="15" width="20" height="14" rx="2" fill="#FF8B94" stroke="#2C2A29" strokeWidth="2.4" />
            <rect x="6" y="11" width="24" height="5" rx="1.5" fill="#FFE066" stroke="#2C2A29" strokeWidth="2.4" />
            <path d="M18 11 L18 29" stroke="#2C2A29" strokeWidth="2.4" />
            <path d="M18 11 C13 6, 11 11, 18 11 C25 11, 23 6, 18 11" stroke="#2C2A29" strokeWidth="2.3" strokeLinecap="round" />
          </svg>
        );

      case 'gym':
      case '🏋️':
        // Hand-Drawn Dumbbell
        return (
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <path d="M11 18 L25 18" stroke="#2C2A29" strokeWidth="3" strokeLinecap="round" />
            <rect x="6" y="12" width="5" height="12" rx="2" fill="#A8E6CF" stroke="#2C2A29" strokeWidth="2.4" />
            <rect x="25" y="12" width="5" height="12" rx="2" fill="#A8E6CF" stroke="#2C2A29" strokeWidth="2.4" />
          </svg>
        );

      case 'sparkle':
      case '✨':
        // Hand-Drawn Doodle Sparkle Star
        return (
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <path
              d="M18 5 Q18 18 31 18 Q18 18 18 31 Q18 18 5 18 Q18 18 18 5 Z"
              fill="#FFE066"
              stroke="#2C2A29"
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
          </svg>
        );

      case 'bulb':
      case '💡':
        // Hand-Drawn Lightbulb Idea Icon
        return (
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            {/* Rays */}
            <path
              d="M18 3 L18 5 M6 10 L8 11.5 M30 10 L28 11.5"
              stroke="#2C2A29"
              strokeWidth="2.3"
              strokeLinecap="round"
            />
            {/* Bulb Glass */}
            <path
              d="M11 16 C11 10.5, 25 10.5, 25 16 C25 20, 22 22, 21.5 25 L14.5 25 C14 22, 11 20, 11 16 Z"
              fill="#FFE066"
              stroke="#2C2A29"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Screw Base */}
            <path
              d="M15 28 L21 28 M16 31 L20 31"
              stroke="#2C2A29"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        );

      case 'fire':
      case '🔥':
        // Hand-Drawn Flame Icon
        return (
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <path
              d="M19 5 C19 11, 28 14, 27 22 C26 28, 22 31, 17 31 C11 31, 8 26, 9 20 C10 15, 14 14, 14 10 C15 13, 17 13, 19 5 Z"
              fill="#FF8B94"
              stroke="#2C2A29"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d="M18 18 C18 21, 22 22, 21 26 C20.5 28.5, 18.5 29.5, 16.5 29.5 C14 29.5, 13 27, 13.5 24 C14 21.5, 16.5 21, 18 18 Z"
              fill="#FFE066"
              stroke="#2C2A29"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        );

      case 'chart':
      case '📊':
      case '🎨':
        // Hand-Drawn Bar Chart Icon
        return (
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <path d="M6 29 L30 29" stroke="#2C2A29" strokeWidth="2.6" strokeLinecap="round" />
            <rect
              x="8"
              y="18"
              width="5"
              height="11"
              rx="1.5"
              fill="#FF8B94"
              stroke="#2C2A29"
              strokeWidth="2.3"
            />
            <rect
              x="15.5"
              y="10"
              width="5"
              height="19"
              rx="1.5"
              fill="#FFE066"
              stroke="#2C2A29"
              strokeWidth="2.3"
            />
            <rect
              x="23"
              y="14"
              width="5"
              height="15"
              rx="1.5"
              fill="#A0C4FF"
              stroke="#2C2A29"
              strokeWidth="2.3"
            />
          </svg>
        );

      case 'calendar':
      case '🗓️':
        // Hand-Drawn Calendar Page
        return (
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <rect
              x="7"
              y="9"
              width="22"
              height="20"
              rx="3"
              fill="#FFFDF7"
              stroke="#2C2A29"
              strokeWidth="2.5"
            />
            <path d="M7 15 L29 15" stroke="#2C2A29" strokeWidth="2.4" />
            <path d="M13 6 L13 11 M23 6 L23 11" stroke="#2C2A29" strokeWidth="2.6" strokeLinecap="round" />
            <circle cx="14" cy="21" r="1.6" fill="#FF8B94" />
            <circle cx="18" cy="21" r="1.6" fill="#2C2A29" />
            <circle cx="22" cy="21" r="1.6" fill="#2C2A29" />
          </svg>
        );

      case 'warning':
      case '⚠️':
        // Hand-Drawn Warning Triangle Doodle
        return (
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <path
              d="M18 6 L31 28 C31.8 29.3, 30.8 30.8, 29.3 30.8 L6.7 30.8 C5.2 30.8, 4.2 29.3, 5 28 L18 6 Z"
              fill="#FFE066"
              stroke="#2C2A29"
              strokeWidth="2.6"
              strokeLinejoin="round"
            />
            <path
              d="M18 14 L18 21.5"
              stroke="#2C2A29"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
            <circle cx="18" cy="26" r="1.8" fill="#2C2A29" />
          </svg>
        );

      default:
        // Default Hand-Drawn Pin / Tag Doodle
        return (
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <circle
              cx="18"
              cy="18"
              r="9"
              fill="#FFE066"
              stroke="#2C2A29"
              strokeWidth="2.5"
            />
            <circle cx="18" cy="18" r="3" fill="#2C2A29" />
          </svg>
        );
    }
  };

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ filter: 'url(#wobble-sketch)' }}
    >
      {renderIcon()}
    </span>
  );
};

