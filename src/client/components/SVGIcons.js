// SVG Icon Library for Mono Games
// Scalable, themeable icons for all games and UI elements

export const SVGIcons = {
    // Game Icons
    snake: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M20,50 Q30,30 50,30 T80,50 Q70,70 50,70 T20,50" 
        fill="#4ECDC4" stroke="#2C3E50" stroke-width="4"/>
      <circle cx="65" cy="35" r="5" fill="#2C3E50"/>
      <path d="M75,45 Q80,50 75,55" stroke="#FF6B6B" stroke-width="3" 
        fill="none" stroke-linecap="round"/>
    </svg>
  `,

    tetris: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="20" width="20" height="20" fill="#FF6B35" stroke="#2C3E50" stroke-width="2"/>
      <rect x="40" y="20" width="20" height="20" fill="#F7931E" stroke="#2C3E50" stroke-width="2"/>
      <rect x="60" y="20" width="20" height="20" fill="#FDCA40" stroke="#2C3E50" stroke-width="2"/>
      <rect x="30" y="40" width="20" height="20" fill="#41EAD4" stroke="#2C3E50" stroke-width="2"/>
      <rect x="50" y="40" width="20" height="20" fill="#FF99C8" stroke="#2C3E50" stroke-width="2"/>
      <rect x="40" y="60" width="20" height="20" fill="#A8DADC" stroke="#2C3E50" stroke-width="2"/>
    </svg>
  `,

    pong: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="30" width="8" height="40" fill="#4ECDC4" 
        stroke="#2C3E50" stroke-width="2" rx="2"/>
      <rect x="82" y="30" width="8" height="40" fill="#FFD93D" 
        stroke="#2C3E50" stroke-width="2" rx="2"/>
      <circle cx="50" cy="50" r="8" fill="#FF6B6B" stroke="#2C3E50" stroke-width="2">
        <animate attributeName="cx" values="25;75;25" dur="2s" repeatCount="indefinite"/>
      </circle>
      <line x1="50" y1="10" x2="50" y2="90" stroke="#2C3E50" 
        stroke-width="2" stroke-dasharray="5,5" opacity="0.3"/>
    </svg>
  `,

    game2048: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="5" width="40" height="40" fill="#FFD93D" stroke="#2C3E50" stroke-width="3" rx="4"/>
      <text x="25" y="32" font-family="Arial" font-size="20" font-weight="900" 
        text-anchor="middle" fill="#2C3E50">2</text>
      
      <rect x="55" y="5" width="40" height="40" fill="#FFA07A" stroke="#2C3E50" stroke-width="3" rx="4"/>
      <text x="75" y="32" font-family="Arial" font-size="20" font-weight="900" 
        text-anchor="middle" fill="#2C3E50">4</text>
      
      <rect x="5" y="55" width="40" height="40" fill="#FF6B6B" stroke="#2C3E50" stroke-width="3" rx="4"/>
      <text x="25" y="82" font-family="Arial" font-size="20" font-weight="900" 
        text-anchor="middle" fill="#FFF">8</text>
      
      <rect x="55" y="55" width="40" height="40" fill="#4ECDC4" stroke="#2C3E50" stroke-width="3" rx="4"/>
      <text x="75" y="82" font-family="Arial" font-size="18" font-weight="900" 
        text-anchor="middle" fill="#FFF">16</text>
    </svg>
  `,

    // UI Icons
    play: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="#4ECDC4" stroke="#2C3E50" stroke-width="4"/>
      <path d="M40,30 L70,50 L40,70 Z" fill="#FFF"/>
    </svg>
  `,

    pause: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="#FFD93D" stroke="#2C3E50" stroke-width="4"/>
      <rect x="35" y="30" width="12" height="40" fill="#2C3E50" rx="2"/>
      <rect x="53" y="30" width="12" height="40" fill="#2C3E50" rx="2"/>
    </svg>
  `,

    restart: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="#FF6B6B" stroke="#2C3E50" stroke-width="4"/>
      <path d="M50,25 A25,25 0 1,1 30,45 L35,40 M30,45 L25,40 M30,45 L35,50" 
        stroke="#FFF" stroke-width="5" fill="none" stroke-linecap="round"/>
    </svg>
  `,

    settings: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="#A8DADC" stroke="#2C3E50" stroke-width="4"/>
      <circle cx="50" cy="50" r="15" fill="#2C3E50"/>
      <g stroke="#2C3E50" stroke-width="6" stroke-linecap="round">
        <line x1="50" y1="20" x2="50" y2="30"/>
        <line x1="50" y1="70" x2="50" y2="80"/>
        <line x1="20" y1="50" x2="30" y2="50"/>
        <line x1="70" y1="50" x2="80" y2="50"/>
        <line x1="30" y1="30" x2="37" y2="37"/>
        <line x1="63" y1="63" x2="70" y2="70"/>
        <line x1="70" y1="30" x2="63" y2="37"/>
        <line x1="37" y1="63" x2="30" y2="70"/>
      </g>
    </svg>
  `,

    home: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="#FF99C8" stroke="#2C3E50" stroke-width="4"/>
      <path d="M30,55 L50,35 L70,55 L70,75 L55,75 L55,60 L45,60 L45,75 L30,75 Z" 
        fill="#FFF" stroke="#2C3E50" stroke-width="3" stroke-linejoin="round"/>
    </svg>
  `,

    diamond: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M50,10 L75,40 L50,90 L25,40 Z" fill="url(#diamondGrad)" 
        stroke="#2C3E50" stroke-width="3"/>
      <defs>
        <linearGradient id="diamondGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#8EEBFF;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#4FD1E8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#2AA7C7;stop-opacity:1" />
        </linearGradient>
      </defs>
      <path d="M50,10 L60,30 L50,40 Z" fill="rgba(255,255,255,0.4)"/>
    </svg>
  `,

    star: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M50,15 L60,40 L87,45 L68,63 L72,90 L50,77 L28,90 L32,63 L13,45 L40,40 Z" 
        fill="#FFD93D" stroke="#2C3E50" stroke-width="3"/>
      <path d="M50,15 L55,35 L50,40 Z" fill="rgba(255,255,255,0.5)"/>
    </svg>
  `,

    trophy: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M30,20 L30,30 Q15,35 15,50 Q15,60 25,60 L30,60 L30,70 L40,70 L40,80 
        L35,80 L35,90 L65,90 L65,80 L60,80 L60,70 L70,70 L70,60 L75,60 Q85,60 85,50 
        Q85,35 70,30 L70,20 Z" 
        fill="#FFD93D" stroke="#2C3E50" stroke-width="3"/>
      <rect x="30" y="15" width="40" height="15" fill="#FF6B6B" 
        stroke="#2C3E50" stroke-width="3" rx="3"/>
      <text x="50" y="27" font-family="Arial" font-size="12" font-weight="900" 
        text-anchor="middle" fill="#FFF">1ST</text>
    </svg>
  `
};

// Helper to create SVG element from string
export function createSVGElement(svgString, size = 64) {
    const div = document.createElement('div');
    div.innerHTML = svgString.trim();
    const svg = div.firstChild;
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    return svg;
}

// Helper to get SVG as data URL
export function getSVGDataURL(svgString) {
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    return URL.createObjectURL(blob);
}

// Themed icon generator
export function getThemedIcon(iconName, theme = {}) {
    let svg = SVGIcons[iconName];
    if (!svg) return null;

    // Apply theme colors
    if (theme.primary) {
        svg = svg.replace(/#4ECDC4/g, theme.primary);
    }
    if (theme.secondary) {
        svg = svg.replace(/#FFD93D/g, theme.secondary);
    }
    if (theme.accent) {
        svg = svg.replace(/#FF6B6B/g, theme.accent);
    }

    return svg;
}

export default SVGIcons;
