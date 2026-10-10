import React from 'react';

interface LocationVisualProps {
  locationId: string;
  settingType?: string;
  className?: string;
}

export const LocationVisual: React.FC<LocationVisualProps> = ({
  locationId,
  className = 'w-full h-full',
}) => {
  switch (locationId) {
    case 'common-room':
    case 'fireplace-lounge':
      return (
        <svg viewBox="0 0 320 200" className={className} preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="loc-cr-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#120D12" />
              <stop offset="100%" stopColor="#251216" />
            </linearGradient>
            <radialGradient id="loc-cr-hearth" cx="30%" cy="70%" r="50%">
              <stop offset="0%" stopColor="#FFAA00" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#E85D04" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#120D12" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="320" height="200" fill="url(#loc-cr-bg)" />
          {/* Stone Hearth */}
          <path d="M40 70 L140 70 L150 200 L30 200 Z" fill="#1A181C" />
          <path d="M55 95 Q90 85 125 95 L125 200 L55 200 Z" fill="#0C0A0D" />
          <rect width="320" height="200" fill="url(#loc-cr-hearth)" />
          {/* Fireplace Flames */}
          <polygon points="75,190 90,140 105,190" fill="#FFB703" />
          <polygon points="85,190 95,155 105,190" fill="#FFEAA7" />
          {/* Velvet Wingback Armchair */}
          <path d="M190 110 C185 90 225 90 220 110 L220 160 L190 160 Z" fill="#671018" />
          <rect x="180" y="140" width="50" height="25" rx="5" fill="#800F1A" />
          <rect x="185" y="165" width="6" height="20" fill="#2B1810" />
          <rect x="219" y="165" width="6" height="20" fill="#2B1810" />
          {/* Persian Floor Rug */}
          <ellipse cx="205" cy="188" rx="55" ry="10" fill="#58161E" stroke="#C97B3E" strokeWidth="1" />
        </svg>
      );

    case 'library':
    case 'study-room':
      return (
        <svg viewBox="0 0 320 200" className={className} preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="loc-lib-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0B0E14" />
              <stop offset="100%" stopColor="#141D2B" />
            </linearGradient>
            <radialGradient id="loc-lib-glow" cx="70%" cy="60%" r="35%">
              <stop offset="0%" stopColor="#52B788" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#E8AE62" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0B0E14" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="320" height="200" fill="url(#loc-lib-bg)" />
          {/* Bookstack Columns */}
          <rect x="0" y="0" width="80" height="200" fill="#191310" />
          <rect x="250" y="0" width="70" height="200" fill="#191310" />
          {[10, 45, 80, 115, 150].map((y) => (
            <React.Fragment key={y}>
              <line x1="0" y1={y + 24} x2="80" y2={y + 24} stroke="#2D1F17" strokeWidth="2.5" />
              <rect x="5" y={y} width="10" height="22" fill="#78290F" />
              <rect x="18" y={y + 2} width="12" height="20" fill="#1B4965" />
              <rect x="33" y={y} width="11" height="22" fill="#C97B3E" />
              <rect x="47" y={y + 3} width="9" height="19" fill="#2B9348" />
              <rect x="59" y={y} width="14" height="22" fill="#5F0F40" />
            </React.Fragment>
          ))}
          {/* Tall Stained Glass Lancet Window */}
          <path d="M125 20 Q160 0 195 20 L195 120 L125 120 Z" fill="#102035" stroke="#223652" strokeWidth="2" />
          <line x1="160" y1="8" x2="160" y2="120" stroke="#223652" strokeWidth="1.5" />
          {/* Desk & Green Reading Lamp */}
          <rect x="110" y="140" width="120" height="16" fill="#2D1B10" />
          <rect x="180" y="122" width="22" height="10" rx="3" fill="#2D6A4F" />
          <rect width="320" height="200" fill="url(#loc-lib-glow)" />
        </svg>
      );

    case 'great-hall':
    case 'dining-room':
      return (
        <svg viewBox="0 0 320 200" className={className} preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="loc-gh-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0B132B" />
              <stop offset="60%" stopColor="#1C2541" />
              <stop offset="100%" stopColor="#2E3C57" />
            </linearGradient>
          </defs>
          <rect width="320" height="200" fill="url(#loc-gh-sky)" />
          {/* Soaring Gothic Rafter Arches */}
          <path d="M0 80 Q160 -10 320 80 L320 200 L0 200 Z" fill="#0E1626" />
          <path d="M30 90 Q160 10 290 90" fill="none" stroke="#202D42" strokeWidth="4" />
          {/* Floating Warm Candlelight Clusters */}
          {[
            [70, 50], [120, 35], [160, 45], [200, 35], [250, 50],
            [95, 65], [140, 58], [180, 58], [225, 65]
          ].map(([x, y], i) => (
            <React.Fragment key={i}>
              <line x1={x} y1={y + 3} x2={x} y2={y + 12} stroke="#E2E8F0" strokeWidth="1" opacity="0.6" />
              <circle cx={x} cy={y} r="2.5" fill="#FFEAA7" filter="blur(0.5px)" />
              <circle cx={x} cy={y} r="1" fill="#FFF" />
            </React.Fragment>
          ))}
          {/* Long Wooden Feast Tables */}
          <polygon points="50,150 130,150 120,200 30,200" fill="#1C1410" />
          <polygon points="190,150 270,150 290,200 200,200" fill="#1C1410" />
        </svg>
      );

    case 'train-compartment':
      return (
        <svg viewBox="0 0 320 200" className={className} preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="loc-tr-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0E1A2B" />
              <stop offset="100%" stopColor="#283952" />
            </linearGradient>
            <radialGradient id="loc-tr-lamp" cx="20%" cy="30%" r="40%">
              <stop offset="0%" stopColor="#FFC857" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#0E1A2B" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="320" height="200" fill="#1C1410" />
          {/* Large Carriage Window Framing Scotland/Highlands rain */}
          <rect x="70" y="30" width="190" height="120" fill="url(#loc-tr-bg)" />
          {/* Misty highlands in window */}
          <path d="M70 110 Q140 85 200 100 Q230 90 260 115 L260 150 L70 150 Z" fill="#0A111E" />
          <line x1="165" y1="30" x2="165" y2="150" stroke="#3D2619" strokeWidth="4" />
          {/* Rain streaks on glass */}
          <line x1="100" y1="40" x2="90" y2="120" stroke="#72B0D0" strokeWidth="0.8" opacity="0.4" strokeDasharray="3 8" />
          <line x1="210" y1="50" x2="200" y2="135" stroke="#72B0D0" strokeWidth="0.8" opacity="0.4" strokeDasharray="3 8" />
          {/* Velvet Bench Armrests & Lamp */}
          <rect x="0" y="110" width="55" height="90" fill="#5E141B" rx="4" />
          <rect x="265" y="110" width="55" height="90" fill="#5E141B" rx="4" />
          <rect width="320" height="200" fill="url(#loc-tr-lamp)" />
        </svg>
      );

    case 'rainy-window-view':
    case 'snowy-window-view':
    case 'view-mountains':
    case 'view-village':
    case 'view-forest':
    case 'view-garden':
    case 'view-castle':
    case 'view-city':
    case 'window-seat':
      return (
        <svg viewBox="0 0 320 200" className={className} preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="loc-win-out" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0B132B" />
              <stop offset="60%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
            <radialGradient id="loc-win-warm" cx="50%" cy="85%" r="40%">
              <stop offset="0%" stopColor="#E8AE62" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#0B132B" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Exterior Vista */}
          <rect width="320" height="200" fill="url(#loc-win-out)" />
          {/* Distant pine trees & village silhouettes */}
          <polygon points="50,80 30,130 70,130" fill="#0C1523" />
          <polygon points="120,70 95,130 145,130" fill="#0F1B2E" />
          <polygon points="230,85 210,135 250,135" fill="#0C1523" />
          <polygon points="280,75 260,130 300,130" fill="#0F1B2E" />
          {/* Rain streaks on the glass */}
          {[40, 80, 130, 180, 230, 275].map((x, i) => (
            <line
              key={i}
              x1={x}
              y1={10 + (i % 2) * 15}
              x2={x - 6}
              y2={120 + (i % 3) * 15}
              stroke="#94A3B8"
              strokeWidth="1.2"
              opacity="0.45"
              strokeDasharray="2 7"
            />
          ))}
          {/* Window Frame Panes (Heavy Dark Timber) */}
          <rect x="0" y="0" width="320" height="15" fill="#140E0A" />
          <rect x="0" y="0" width="20" height="200" fill="#140E0A" />
          <rect x="300" y="0" width="20" height="200" fill="#140E0A" />
          <rect x="0" y="160" width="320" height="40" fill="#1C140F" />
          <line x1="160" y1="15" x2="160" y2="160" stroke="#140E0A" strokeWidth="8" />
          <line x1="20" y1="85" x2="300" y2="85" stroke="#140E0A" strokeWidth="6" />
          {/* Window Sill with Candle & Steaming Ceramic Mug */}
          <rect width="320" height="200" fill="url(#loc-win-warm)" />
          <rect x="135" y="145" width="16" height="20" fill="#E8AE62" rx="2" />
          <circle cx="143" cy="142" r="3" fill="#FFF" />
          <rect x="180" y="152" width="18" height="15" fill="#F4A261" rx="2" />
        </svg>
      );

    case 'village':
    case 'city-street':
      return (
        <svg viewBox="0 0 320 200" className={className} preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="loc-vil-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0B1326" />
              <stop offset="60%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#4A3728" />
            </linearGradient>
            <radialGradient id="loc-vil-lamp" cx="50%" cy="50%" r="35%">
              <stop offset="0%" stopColor="#FFAA00" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#E8AE62" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0B1326" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="320" height="200" fill="url(#loc-vil-sky)" />
          {/* Village Cottages & Cobblestones */}
          <polygon points="20,130 70,80 120,130" fill="#3D2619" />
          <rect x="30" y="130" width="80" height="60" fill="#241812" />
          <polygon points="210,125 260,75 310,125" fill="#3D2619" />
          <rect x="220" y="125" width="80" height="65" fill="#241812" />
          {/* Glowing Windows */}
          <rect x="50" y="145" width="18" height="18" fill="#FDE68A" />
          <rect x="245" y="140" width="18" height="18" fill="#FDE68A" />
          {/* Cobblestone Alley & Wet Street Lamp */}
          <rect x="156" y="80" width="6" height="90" fill="#1E293B" />
          <polygon points="148,70 170,70 165,80 153,80" fill="#FFAA00" />
          <rect width="320" height="200" fill="url(#loc-vil-lamp)" />
          <ellipse cx="160" cy="180" rx="40" ry="10" fill="#E8AE62" opacity="0.4" filter="blur(2px)" />
        </svg>
      );

    case 'forest-clearing':
    case 'woodland-path':
      return (
        <svg viewBox="0 0 320 200" className={className} preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="loc-fc-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#051014" />
              <stop offset="60%" stopColor="#0B252C" />
              <stop offset="100%" stopColor="#1B4944" />
            </linearGradient>
            <radialGradient id="loc-fc-moon" cx="50%" cy="30%" r="30%">
              <stop offset="0%" stopColor="#D8F3DC" stopOpacity="0.75" />
              <stop offset="50%" stopColor="#52B788" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#051014" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="320" height="200" fill="url(#loc-fc-sky)" />
          <circle cx="160" cy="50" r="18" fill="#D8F3DC" opacity="0.85" filter="blur(0.5px)" />
          <rect width="320" height="200" fill="url(#loc-fc-moon)" />
          {/* Ancient Pine Trees flanking clearing */}
          <polygon points="50,40 20,160 80,160" fill="#061214" />
          <polygon points="90,60 65,170 115,170" fill="#0A1D20" />
          <polygon points="270,40 240,160 300,160" fill="#061214" />
          <polygon points="230,60 205,170 255,170" fill="#0A1D20" />
          {/* Mossy Glade Ground with Wildflower Fireflies */}
          <ellipse cx="160" cy="185" rx="140" ry="25" fill="#0F2B26" />
          <circle cx="140" cy="165" r="1.5" fill="#FFEAA7" opacity="0.9" />
          <circle cx="180" cy="155" r="2" fill="#74C69D" opacity="0.9" filter="blur(0.3px)" />
          <circle cx="160" cy="170" r="1.3" fill="#FFEAA7" opacity="0.8" />
        </svg>
      );

    case 'lakeside':
    case 'riverside':
    case 'seaside':
    case 'waterfall-setting':
      return (
        <svg viewBox="0 0 320 200" className={className} preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="loc-lk-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0B132B" />
              <stop offset="50%" stopColor="#1C2541" />
              <stop offset="100%" stopColor="#3A506B" />
            </linearGradient>
            <radialGradient id="loc-lk-moon" cx="70%" cy="25%" r="25%">
              <stop offset="0%" stopColor="#E0FBFC" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#3A506B" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="320" height="200" fill="url(#loc-lk-sky)" />
          <circle cx="230" cy="45" r="14" fill="#E0FBFC" opacity="0.9" filter="blur(0.5px)" />
          <rect width="320" height="200" fill="url(#loc-lk-moon)" />
          {/* Distant Mountain Overlooks */}
          <polygon points="0,120 70,70 140,120" fill="#0A101D" />
          <polygon points="100,120 180,60 260,120" fill="#0E1626" />
          {/* Glassy Still Water Body */}
          <rect y="120" width="320" height="80" fill="#0B1526" />
          {/* Moon Shimmer Reflection */}
          <ellipse cx="230" cy="150" rx="15" ry="3" fill="#E0FBFC" opacity="0.5" filter="blur(0.8px)" />
          <ellipse cx="230" cy="170" rx="20" ry="4" fill="#E0FBFC" opacity="0.4" filter="blur(1px)" />
          {/* Wooden Pier Dock */}
          <polygon points="30,200 80,140 105,140 70,200" fill="#2A1B12" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 320 200" className={className} preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="loc-def-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0B1018" />
              <stop offset="60%" stopColor="#192434" />
              <stop offset="100%" stopColor="#223146" />
            </linearGradient>
            <radialGradient id="loc-def-glow" cx="50%" cy="60%" r="40%">
              <stop offset="0%" stopColor="#E8AE62" stopOpacity="0.7" />
              <stop offset="60%" stopColor="#0B1018" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="320" height="200" fill="url(#loc-def-bg)" />
          <path d="M90 200 L90 90 Q160 30 230 90 L230 200 Z" fill="#101722" />
          <rect width="320" height="200" fill="url(#loc-def-glow)" />
          <circle cx="160" cy="120" r="10" fill="#E8AE62" opacity="0.9" />
          <circle cx="160" cy="120" r="3.5" fill="#FFF" />
        </svg>
      );
  }
};
