import React from 'react';

interface WorldVisualProps {
  worldId: string;
  className?: string;
}

export const WorldVisual: React.FC<WorldVisualProps> = ({ worldId, className = 'w-full h-full' }) => {
  // Bespoke cinematic SVG atmospheric artworks tailored to each world archetype
  switch (worldId) {
    case 'hogwarts-wizarding':
      return (
        <svg viewBox="0 0 400 240" className={className} preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="hw-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0B132B" />
              <stop offset="60%" stopColor="#1C2541" />
              <stop offset="100%" stopColor="#3A506B" />
            </linearGradient>
            <radialGradient id="hw-hearth" cx="50%" cy="85%" r="40%">
              <stop offset="0%" stopColor="#FFB703" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#FB8500" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0B132B" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="hw-moon" cx="80%" cy="25%" r="20%">
              <stop offset="0%" stopColor="#E0FBFC" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#98C1D9" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0B132B" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="400" height="240" fill="url(#hw-sky)" />
          <circle cx="320" cy="50" r="18" fill="#E0FBFC" opacity="0.85" filter="blur(0.5px)" />
          <rect width="400" height="240" fill="url(#hw-moon)" />
          {/* Gothic Spires & Castle Silhouettes */}
          <path d="M40 240 L40 130 L60 80 L80 130 L80 240 Z" fill="#0A0F1D" />
          <path d="M70 240 L70 110 L100 40 L130 110 L130 240 Z" fill="#0F172A" />
          <path d="M120 240 L120 120 L150 70 L180 120 L180 240 Z" fill="#0A0F1D" />
          <polygon points="100,20 95,45 105,45" fill="#0A0F1D" />
          <path d="M190 240 L190 140 L230 100 L270 140 L270 240 Z" fill="#151E30" />
          {/* Arched Lancet Windows glowing warm amber */}
          <path d="M92 90 Q100 75 108 90 L108 120 L92 120 Z" fill="#FFAA00" opacity="0.9" />
          <path d="M54 140 Q60 130 66 140 L66 165 L54 165 Z" fill="#FFB703" opacity="0.8" />
          <path d="M142 130 Q150 120 158 130 L158 155 L142 155 Z" fill="#FB8500" opacity="0.85" />
          <path d="M222 150 Q230 140 238 150 L238 175 L222 175 Z" fill="#FFB703" opacity="0.8" />
          {/* Great Hall roof & warm glowing lantern light */}
          <rect y="180" width="400" height="60" fill="url(#hw-hearth)" />
          {/* Rain streaks */}
          <line x1="20" y1="20" x2="10" y2="70" stroke="#72B0D0" strokeWidth="0.8" opacity="0.4" strokeDasharray="3 8" />
          <line x1="160" y1="30" x2="150" y2="90" stroke="#72B0D0" strokeWidth="0.8" opacity="0.3" strokeDasharray="4 9" />
          <line x1="260" y1="10" x2="250" y2="80" stroke="#72B0D0" strokeWidth="0.8" opacity="0.35" strokeDasharray="2 7" />
          <line x1="360" y1="40" x2="350" y2="110" stroke="#72B0D0" strokeWidth="0.8" opacity="0.4" strokeDasharray="3 8" />
          {/* Floating magical sparkles */}
          <circle cx="95" cy="80" r="1.5" fill="#FFEAA7" opacity="0.9" />
          <circle cx="150" cy="110" r="1.8" fill="#FFEAA7" opacity="0.8" />
          <circle cx="210" cy="130" r="1.2" fill="#FFEAA7" opacity="0.9" />
        </svg>
      );

    case 'the-shire-village':
      return (
        <svg viewBox="0 0 400 240" className={className} preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="sh-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1E3A5F" />
              <stop offset="50%" stopColor="#C97B3E" />
              <stop offset="100%" stopColor="#F4A261" />
            </linearGradient>
            <radialGradient id="sh-sun" cx="30%" cy="50%" r="35%">
              <stop offset="0%" stopColor="#FFE3A8" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#F4A261" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#C97B3E" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="400" height="240" fill="url(#sh-sky)" />
          <circle cx="120" cy="110" r="32" fill="#FFE3A8" opacity="0.8" filter="blur(1px)" />
          <rect width="400" height="240" fill="url(#sh-sun)" />
          {/* Rolling green hills */}
          <path d="M-20 180 Q100 130 220 170 Q320 200 420 150 L420 240 L-20 240 Z" fill="#1C3829" />
          <path d="M-20 200 Q120 160 260 200 Q360 180 420 210 L420 240 L-20 240 Z" fill="#2D5A3F" />
          {/* Round timber Hobbit Door */}
          <circle cx="160" cy="205" r="24" fill="#3D2619" />
          <circle cx="160" cy="205" r="20" fill="#2E6B47" stroke="#9A6B3A" strokeWidth="2.5" />
          <circle cx="160" cy="205" r="3" fill="#E8AE62" />
          {/* Round Glowing Window */}
          <circle cx="215" cy="200" r="10" fill="#FFEAA7" opacity="0.95" />
          <line x1="215" y1="190" x2="215" y2="210" stroke="#3D2619" strokeWidth="1.5" />
          <line x1="205" y1="200" x2="225" y2="200" stroke="#3D2619" strokeWidth="1.5" />
          {/* Chimney & curling woodsmoke */}
          <rect x="175" y="160" width="10" height="18" fill="#4A3B32" />
          <path d="M180 158 Q195 140 185 125 Q175 110 190 95 Q205 80 195 65" fill="none" stroke="#E0E6ED" strokeWidth="2.5" opacity="0.4" />
          {/* Flower planters & fence */}
          <circle cx="125" cy="215" r="4" fill="#E76F51" />
          <circle cx="132" cy="217" r="3.5" fill="#E9C46A" />
          <circle cx="195" cy="216" r="3.5" fill="#F4A261" />
        </svg>
      );

    case 'medieval-fantasy':
    case 'fantasy-tavern':
      return (
        <svg viewBox="0 0 400 240" className={className} preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="tv-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#140D07" />
              <stop offset="100%" stopColor="#2A180B" />
            </linearGradient>
            <radialGradient id="tv-hearth" cx="35%" cy="75%" r="55%">
              <stop offset="0%" stopColor="#FF9E00" stopOpacity="0.9" />
              <stop offset="40%" stopColor="#E85D04" stopOpacity="0.5" />
              <stop offset="80%" stopColor="#370617" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#140D07" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="400" height="240" fill="url(#tv-bg)" />
          {/* Heavy Oak Rafters & Beams */}
          <rect x="0" y="20" width="400" height="18" fill="#1C1008" />
          <line x1="80" y1="38" x2="120" y2="120" stroke="#160C06" strokeWidth="10" />
          <line x1="220" y1="38" x2="180" y2="120" stroke="#160C06" strokeWidth="10" />
          <line x1="340" y1="38" x2="300" y2="120" stroke="#160C06" strokeWidth="10" />
          {/* Massive Stone Fireplace Hearth */}
          <path d="M70 120 L210 120 L220 240 L60 240 Z" fill="#201A16" />
          <path d="M90 145 Q140 130 190 145 L190 240 L90 240 Z" fill="#120A05" />
          <rect width="400" height="240" fill="url(#tv-hearth)" />
          {/* Roaring Flames */}
          <path d="M115 235 Q140 170 150 200 Q160 160 170 235 Z" fill="#FFAA00" />
          <path d="M125 235 Q142 185 150 215 Q158 180 162 235 Z" fill="#FFE600" />
          {/* Wrought Iron Chandelier with glowing candle lights */}
          <line x1="300" y1="38" x2="300" y2="85" stroke="#333" strokeWidth="2" />
          <path d="M260 85 Q300 95 340 85" fill="none" stroke="#222" strokeWidth="3" />
          <circle cx="265" cy="80" r="3.5" fill="#FFEAA7" filter="blur(0.5px)" />
          <circle cx="300" cy="82" r="3.5" fill="#FFEAA7" filter="blur(0.5px)" />
          <circle cx="335" cy="80" r="3.5" fill="#FFEAA7" filter="blur(0.5px)" />
          {/* Weathered Tavern Table & Tankard */}
          <rect x="230" y="180" width="160" height="15" fill="#2C1B10" />
          <rect x="270" y="160" width="16" height="20" fill="#7D5A3C" rx="2" />
          <path d="M286 165 Q293 170 286 176" fill="none" stroke="#7D5A3C" strokeWidth="2.5" />
        </svg>
      );

    case 'enchanted-forest':
    case 'magical-forest-night':
      return (
        <svg viewBox="0 0 400 240" className={className} preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="ef-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#03071E" />
              <stop offset="50%" stopColor="#0B1D28" />
              <stop offset="100%" stopColor="#0D3B36" />
            </linearGradient>
            <radialGradient id="ef-glow" cx="60%" cy="70%" r="40%">
              <stop offset="0%" stopColor="#52B788" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#2D6A4F" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#03071E" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="400" height="240" fill="url(#ef-sky)" />
          <circle cx="280" cy="45" r="16" fill="#D8F3DC" opacity="0.85" filter="blur(0.5px)" />
          {/* Silhouetted Ancient Trees with Twisted Branches */}
          <path d="M30 240 Q40 150 20 80 Q25 40 45 10 Q35 60 55 100 Q75 140 60 240 Z" fill="#051014" />
          <path d="M120 240 Q135 160 115 100 Q120 50 140 20 Q130 70 150 110 Q160 160 150 240 Z" fill="#081A1F" />
          <path d="M340 240 Q330 150 350 90 Q340 50 370 15 Q360 65 375 110 Q385 170 370 240 Z" fill="#051014" />
          {/* Winding glowing stream */}
          <path d="M0 230 Q140 210 220 220 Q320 225 400 240 L400 240 L0 240 Z" fill="#1B4944" />
          <path d="M60 228 Q180 212 250 222 Q340 226 400 238" fill="none" stroke="#74C69D" strokeWidth="2.5" opacity="0.6" filter="blur(0.5px)" />
          <rect width="400" height="240" fill="url(#ef-glow)" />
          {/* Bioluminescent Flora & Mushrooms */}
          <ellipse cx="230" cy="205" rx="8" ry="4" fill="#52B788" filter="blur(0.5px)" />
          <ellipse cx="245" cy="210" rx="6" ry="3" fill="#74C69D" />
          <ellipse cx="140" cy="215" rx="7" ry="3.5" fill="#48CAE4" filter="blur(0.5px)" />
          {/* Drifting fairy dust / magical pollen motes */}
          <circle cx="170" cy="140" r="1.8" fill="#B7E4C7" opacity="0.9" filter="blur(0.2px)" />
          <circle cx="210" cy="120" r="1.5" fill="#74C69D" opacity="0.8" />
          <circle cx="250" cy="155" r="2.2" fill="#90E0EF" opacity="0.9" filter="blur(0.3px)" />
          <circle cx="110" cy="170" r="1.4" fill="#B7E4C7" opacity="0.8" />
          <circle cx="300" cy="130" r="1.7" fill="#52B788" opacity="0.8" />
        </svg>
      );

    case 'magical-library':
    case 'dark-academia':
      return (
        <svg viewBox="0 0 400 240" className={className} preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="lib-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0B090A" />
              <stop offset="100%" stopColor="#161A1D" />
            </linearGradient>
            <radialGradient id="lib-lamp" cx="70%" cy="65%" r="35%">
              <stop offset="0%" stopColor="#52B788" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#E8AE62" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0B090A" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="400" height="240" fill="url(#lib-bg)" />
          {/* Towering Bookshelves left & right */}
          <rect x="0" y="0" width="90" height="240" fill="#1C1410" />
          <rect x="310" y="0" width="90" height="240" fill="#1C1410" />
          {/* Books on Shelves with varied antique leather tones */}
          {[15, 45, 75, 105, 135, 165, 195].map((y) => (
            <React.Fragment key={y}>
              <line x1="0" y1={y + 24} x2="90" y2={y + 24} stroke="#2D1F17" strokeWidth="3" />
              <rect x="5" y={y} width="12" height="22" fill="#78290F" />
              <rect x="18" y={y + 2} width="10" height="20" fill="#15616D" />
              <rect x="29" y={y} width="14" height="22" fill="#C97B3E" />
              <rect x="44" y={y + 3} width="8" height="19" fill="#582F0E" />
              <rect x="53" y={y} width="15" height="22" fill="#243E36" />
              <rect x="69" y={y + 1} width="12" height="21" fill="#6A040F" />
            </React.Fragment>
          ))}
          {/* Arched skylight window with rain in background */}
          <path d="M140 30 Q200 0 260 30 L260 130 L140 130 Z" fill="#0F172A" />
          <path d="M140 30 Q200 0 260 30 L260 130 L140 130 Z" fill="none" stroke="#283952" strokeWidth="2.5" />
          <line x1="200" y1="12" x2="200" y2="130" stroke="#283952" strokeWidth="1.5" />
          <line x1="140" y1="80" x2="260" y2="80" stroke="#283952" strokeWidth="1.5" />
          {/* Antique Oak Writing Desk in foreground */}
          <rect x="120" y="160" width="180" height="20" fill="#2B1810" />
          <rect x="135" y="180" width="18" height="60" fill="#20110A" />
          <rect x="267" y="180" width="18" height="60" fill="#20110A" />
          {/* Green Banker's Lamp casting warm emerald & amber glow */}
          <rect x="225" y="135" width="28" height="12" rx="4" fill="#2D6A4F" />
          <ellipse cx="239" cy="144" rx="10" ry="4" fill="#95D5B2" opacity="0.9" />
          <rect width="400" height="240" fill="url(#lib-lamp)" />
          {/* Rolling brass ladder */}
          <line x1="75" y1="0" x2="85" y2="240" stroke="#C9A227" strokeWidth="2" opacity="0.7" />
          <line x1="60" y1="0" x2="70" y2="240" stroke="#C9A227" strokeWidth="2" opacity="0.7" />
        </svg>
      );

    case 'cozy-cabin':
    case 'mountain-lodge':
      return (
        <svg viewBox="0 0 400 240" className={className} preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="cb-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0A1128" />
              <stop offset="60%" stopColor="#1C2541" />
              <stop offset="100%" stopColor="#2E3C57" />
            </linearGradient>
            <radialGradient id="cb-window" cx="50%" cy="65%" r="45%">
              <stop offset="0%" stopColor="#FFB703" stopOpacity="0.95" />
              <stop offset="45%" stopColor="#FB8500" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0A1128" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="400" height="240" fill="url(#cb-sky)" />
          {/* Pine Trees in cold winter/autumn rain */}
          <polygon points="50,60 20,130 80,130" fill="#0A1E1E" />
          <polygon points="50,30 30,90 70,90" fill="#0F2A2A" />
          <polygon points="340,50 300,140 380,140" fill="#0A1E1E" />
          <polygon points="340,20 315,90 365,90" fill="#0F2A2A" />
          {/* Rough-hewn Timber Cabin Architecture */}
          <polygon points="200,60 100,120 300,120" fill="#1C140F" />
          <rect x="110" y="120" width="180" height="100" fill="#2A1B12" />
          {/* Log siding lines */}
          {[135, 150, 165, 180, 195, 210].map((y) => (
            <line key={y} x1="110" y1={y} x2="290" y2={y} stroke="#1B110B" strokeWidth="2" />
          ))}
          {/* Stone Chimney & smoke */}
          <rect x="250" y="70" width="22" height="50" fill="#3A3835" />
          <path d="M260 65 Q275 40 265 25 Q255 10 270 0" fill="none" stroke="#E2E8F0" strokeWidth="3" opacity="0.4" />
          {/* Large Multi-Pane Glowing Window */}
          <rect x="150" y="135" width="70" height="60" fill="#FFEAA7" />
          <rect width="400" height="240" fill="url(#cb-window)" />
          <line x1="185" y1="135" x2="185" y2="195" stroke="#2A1B12" strokeWidth="3" />
          <line x1="150" y1="165" x2="220" y2="165" stroke="#2A1B12" strokeWidth="3" />
          {/* Steaming Mug on sill */}
          <rect x="180" y="180" width="8" height="10" fill="#E8AE62" rx="1" />
          {/* Rain streaks down exterior glass */}
          <line x1="160" y1="135" x2="158" y2="175" stroke="#FFF" strokeWidth="0.8" opacity="0.4" />
          <line x1="200" y1="145" x2="198" y2="190" stroke="#FFF" strokeWidth="0.8" opacity="0.4" />
        </svg>
      );

    case 'japanese-garden':
    case 'traditional-japanese-interior':
      return (
        <svg viewBox="0 0 400 240" className={className} preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="jp-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1A1C29" />
              <stop offset="60%" stopColor="#3E4259" />
              <stop offset="100%" stopColor="#7E7275" />
            </linearGradient>
            <radialGradient id="jp-lantern" cx="72%" cy="65%" r="25%">
              <stop offset="0%" stopColor="#FFE066" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#E8AE62" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#1A1C29" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="400" height="240" fill="url(#jp-sky)" />
          {/* Japanese Pagoda / Temple Roof Eaves */}
          <path d="M40 90 Q120 75 200 90 L190 70 Q120 60 50 70 Z" fill="#1C1819" />
          <path d="M20 120 Q120 100 220 120 L210 95 Q120 80 30 95 Z" fill="#252022" />
          {/* Traditional Stone Toro Lantern */}
          <path d="M270 145 L310 145 L320 160 L260 160 Z" fill="#3D4047" />
          <rect x="278" y="160" width="24" height="20" fill="#FFAA00" opacity="0.9" />
          <rect x="282" y="180" width="16" height="40" fill="#32353B" />
          <ellipse cx="290" cy="225" rx="25" ry="8" fill="#26282E" />
          <rect width="400" height="240" fill="url(#jp-lantern)" />
          {/* Weeping Crimson Maple Branch */}
          <path d="M0 20 Q100 30 180 80" fill="none" stroke="#2B1E1E" strokeWidth="4" />
          <ellipse cx="140" cy="65" rx="9" ry="6" fill="#9E2A2B" opacity="0.9" />
          <ellipse cx="160" cy="75" rx="8" ry="5" fill="#D62828" opacity="0.9" />
          <ellipse cx="180" cy="85" rx="7" ry="5" fill="#E85D04" opacity="0.9" />
          {/* Bamboo water spout & still pond with gentle concentric rain ripples */}
          <ellipse cx="160" cy="220" rx="90" ry="18" fill="#1B2836" />
          <ellipse cx="160" cy="220" rx="70" ry="14" fill="none" stroke="#486581" strokeWidth="1" opacity="0.6" />
          <ellipse cx="160" cy="220" rx="40" ry="8" fill="none" stroke="#627D98" strokeWidth="1.2" opacity="0.7" />
        </svg>
      );

    case 'rainy-city-streets':
    case 'victorian-london':
    case 'historic-european-city':
      return (
        <svg viewBox="0 0 400 240" className={className} preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="rn-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0B1326" />
              <stop offset="60%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
            <radialGradient id="rn-lamp" cx="30%" cy="55%" r="35%">
              <stop offset="0%" stopColor="#FFC857" stopOpacity="0.95" />
              <stop offset="45%" stopColor="#E8AE62" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0B1326" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="400" height="240" fill="url(#rn-sky)" />
          {/* Historic City Street Facades */}
          <path d="M0 240 L0 80 L70 50 L140 80 L140 240 Z" fill="#0F172A" />
          <path d="M260 240 L260 70 L340 40 L400 65 L400 240 Z" fill="#0A0F1D" />
          {/* Gas Lamp Post with warm glowing lantern */}
          <rect x="115" y="110" width="6" height="110" fill="#1E293B" />
          <polygon points="105,95 131,95 124,110 112,110" fill="#FFC857" opacity="0.95" />
          <polygon points="102,95 134,95 118,80" fill="#0F172A" />
          <rect width="400" height="240" fill="url(#rn-lamp)" />
          {/* Wet Cobblestones reflecting amber streetlight */}
          <rect y="200" width="400" height="40" fill="#0B101D" />
          <ellipse cx="120" cy="225" rx="60" ry="12" fill="#E8AE62" opacity="0.45" filter="blur(2px)" />
          {/* Continuous vertical rain streaks */}
          {[20, 65, 110, 160, 210, 255, 305, 355].map((x, i) => (
            <line
              key={i}
              x1={x}
              y1={10 + (i % 3) * 15}
              x2={x - 8}
              y2={110 + (i % 3) * 20}
              stroke="#94A3B8"
              strokeWidth="0.9"
              opacity="0.35"
              strokeDasharray="4 10"
            />
          ))}
        </svg>
      );

    case 'cyberpunk-city':
    case 'space-station-bay':
    case 'futuristic-interior':
    case 'original-scifi':
      return (
        <svg viewBox="0 0 400 240" className={className} preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="cb-sky-sci" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#05050A" />
              <stop offset="50%" stopColor="#0A0D1A" />
              <stop offset="100%" stopColor="#10182E" />
            </linearGradient>
            <linearGradient id="neon-cyan" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#00F0FF" />
              <stop offset="100%" stopColor="#0077B6" />
            </linearGradient>
            <linearGradient id="neon-pink" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF007F" />
              <stop offset="100%" stopColor="#7B2CBF" />
            </linearGradient>
          </defs>
          <rect width="400" height="240" fill="url(#cb-sky-sci)" />
          {/* Distant Skyscrapers & Hologram Spires */}
          <rect x="40" y="40" width="50" height="200" fill="#080C16" />
          <rect x="110" y="20" width="70" height="220" fill="#0D1322" />
          <rect x="200" y="60" width="60" height="180" fill="#080C16" />
          <rect x="280" y="30" width="80" height="210" fill="#0F1728" />
          {/* Glowing Neon Accents */}
          <line x1="110" y1="35" x2="110" y2="200" stroke="url(#neon-cyan)" strokeWidth="3" opacity="0.8" />
          <line x1="280" y1="45" x2="360" y2="45" stroke="url(#neon-pink)" strokeWidth="3" opacity="0.8" />
          <rect x="130" y="70" width="30" height="8" fill="#00F0FF" opacity="0.75" />
          <rect x="300" y="80" width="40" height="10" fill="#FF007F" opacity="0.75" />
          {/* Cyberpunk Heavy Torrential Rain & Wet Reflective Highway */}
          <polygon points="0,240 180,180 220,180 400,240" fill="#0A0F1D" />
          <ellipse cx="200" cy="220" rx="90" ry="12" fill="#00F0FF" opacity="0.3" filter="blur(3px)" />
          <ellipse cx="240" cy="225" rx="60" ry="8" fill="#FF007F" opacity="0.25" filter="blur(2px)" />
        </svg>
      );

    case 'stardew-valley':
    case 'pixel-art-fantasy':
    case 'cozy-life-sim':
    case 'autumn-farmhouse':
      return (
        <svg viewBox="0 0 400 240" className={className} preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="sd-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2D3142" />
              <stop offset="60%" stopColor="#4F5D75" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <radialGradient id="sd-warm" cx="50%" cy="80%" r="40%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#B45309" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#2D3142" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="400" height="240" fill="url(#sd-sky)" />
          {/* Autumn Orchard & Wooden Barn Silhouettes */}
          <rect x="220" y="100" width="120" height="90" fill="#78350F" />
          <polygon points="210,100 280,55 350,100" fill="#92400E" />
          <rect x="260" y="140" width="30" height="50" fill="#451A03" />
          <rect x="270" y="110" width="18" height="18" fill="#FDE68A" opacity="0.9" />
          {/* Split-rail wooden fence */}
          <line x1="20" y1="180" x2="200" y2="180" stroke="#78350F" strokeWidth="3" />
          <line x1="20" y1="195" x2="200" y2="195" stroke="#78350F" strokeWidth="3" />
          <line x1="50" y1="170" x2="50" y2="210" stroke="#5A280B" strokeWidth="4" />
          <line x1="110" y1="170" x2="110" y2="210" stroke="#5A280B" strokeWidth="4" />
          <line x1="170" y1="170" x2="170" y2="210" stroke="#5A280B" strokeWidth="4" />
          {/* Harvest Pumpkin Patch */}
          <ellipse cx="60" cy="220" rx="10" ry="7" fill="#EA580C" />
          <ellipse cx="80" cy="225" rx="12" ry="8" fill="#F97316" />
          <ellipse cx="130" cy="222" rx="11" ry="7.5" fill="#EA580C" />
          <rect width="400" height="240" fill="url(#sd-warm)" />
        </svg>
      );

    default:
      // Cinematic General Sanctuary Visual
      return (
        <svg viewBox="0 0 400 240" className={className} preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="gen-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0B1018" />
              <stop offset="60%" stopColor="#192434" />
              <stop offset="100%" stopColor="#223146" />
            </linearGradient>
            <radialGradient id="gen-glow" cx="50%" cy="65%" r="45%">
              <stop offset="0%" stopColor="#E8AE62" stopOpacity="0.75" />
              <stop offset="60%" stopColor="#C68A3E" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0B1018" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="400" height="240" fill="url(#gen-sky)" />
          {/* Architectural Archway Sanctuary */}
          <path d="M120 240 L120 110 Q200 40 280 110 L280 240 Z" fill="#101722" />
          <path d="M140 240 L140 125 Q200 65 260 125 L260 240 Z" fill="#151F2E" />
          <rect width="400" height="240" fill="url(#gen-glow)" />
          {/* Warm center lantern or candle flame */}
          <circle cx="200" cy="160" r="12" fill="#E8AE62" opacity="0.9" filter="blur(1px)" />
          <circle cx="200" cy="160" r="4" fill="#FFF" />
          {/* Subtle stars */}
          <circle cx="80" cy="40" r="1" fill="#FFF" opacity="0.8" />
          <circle cx="320" cy="50" r="1.2" fill="#FFF" opacity="0.8" />
          <circle cx="290" cy="25" r="1.5" fill="#FFF" opacity="0.9" />
        </svg>
      );
  }
};
