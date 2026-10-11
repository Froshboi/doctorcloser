export function HeroVisual() {
  return (
    <div className="hero-visual">
      <svg
        viewBox="0 0 560 360"
        role="img"
        aria-labelledby="hero-visual-title"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title id="hero-visual-title">DoctorCloser appointment booking preview</title>
        <defs>
          <linearGradient id="hero-panel" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#2d755d" />
            <stop offset="1" stopColor="#174738" />
          </linearGradient>
          <linearGradient id="hero-card" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fffdf8" />
            <stop offset="1" stopColor="#e9f0e9" />
          </linearGradient>
          <filter id="hero-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="12" stdDeviation="12" floodColor="#09251b" floodOpacity=".22" />
          </filter>
        </defs>
        <rect width="560" height="360" rx="18" fill="url(#hero-panel)" />
        <circle cx="460" cy="70" r="135" fill="#ffffff" opacity=".045" />
        <circle cx="76" cy="320" r="122" fill="#b9e7ce" opacity=".055" />
        <path d="M26 75h508M26 116h508M26 157h508M26 198h508M26 239h508M26 280h508" stroke="#fff" strokeOpacity=".09" />
        <path d="M70 32v296M145 32v296M220 32v296M295 32v296M370 32v296M445 32v296M520 32v296" stroke="#fff" strokeOpacity=".07" />
        <g filter="url(#hero-shadow)">
          <rect x="54" y="48" width="262" height="254" rx="13" fill="url(#hero-card)" />
          <circle cx="82" cy="77" r="12" fill="#1f5c4a" />
          <path d="M77 77h10M82 72v10" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          <text x="102" y="75" fill="#16241c" fontSize="12" fontWeight="700" fontFamily="Arial, sans-serif">Your next appointment</text>
          <text x="102" y="91" fill="#758078" fontSize="9" fontFamily="Arial, sans-serif">A little closer to feeling better</text>
          <rect x="74" y="111" width="222" height="1" fill="#e2e8e1" />
          <circle cx="103" cy="150" r="21" fill="#dcebe2" />
          <circle cx="103" cy="144" r="7" fill="#8ba693" />
          <path d="M89 165c2-9 8-14 14-14s12 5 14 14" fill="#8ba693" />
          <text x="137" y="146" fill="#16241c" fontSize="11" fontWeight="700" fontFamily="Arial, sans-serif">Dr. Amaka Chukwu</text>
          <text x="137" y="162" fill="#758078" fontSize="9" fontFamily="Arial, sans-serif">General practice · Rumuola Clinic</text>
          <rect x="74" y="186" width="222" height="1" fill="#e2e8e1" />
          <rect x="74" y="202" width="104" height="54" rx="8" fill="#eaf2ec" />
          <text x="87" y="221" fill="#758078" fontSize="8" fontFamily="Arial, sans-serif">TOMORROW</text>
          <text x="87" y="241" fill="#16241c" fontSize="13" fontWeight="700" fontFamily="Arial, sans-serif">9:30 AM</text>
          <rect x="186" y="202" width="110" height="54" rx="8" fill="#fff" stroke="#dce4dc" />
          <text x="198" y="221" fill="#758078" fontSize="8" fontFamily="Arial, sans-serif">CONSULTATION</text>
          <text x="198" y="241" fill="#16241c" fontSize="13" fontWeight="700" fontFamily="Arial, sans-serif">₦8,000</text>
          <rect x="74" y="270" width="222" height="19" rx="5" fill="#1f5c4a" />
          <text x="185" y="283" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="700" fontFamily="Arial, sans-serif">APPOINTMENT CONFIRMED</text>
        </g>
        <g filter="url(#hero-shadow)">
          <rect x="346" y="115" width="170" height="96" rx="11" fill="#fffdf8" />
          <circle cx="370" cy="140" r="10" fill="#e2f1e7" />
          <path d="m366 140 3 3 6-7" fill="none" stroke="#327251" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <text x="389" y="139" fill="#16241c" fontSize="10" fontWeight="700" fontFamily="Arial, sans-serif">Slot secured</text>
          <text x="389" y="153" fill="#758078" fontSize="8" fontFamily="Arial, sans-serif">Clinic calendar updated</text>
          <path d="M365 174h130" stroke="#e2e8e1" />
          <text x="365" y="192" fill="#758078" fontSize="8" fontFamily="Arial, sans-serif">PORT HARCOURT · 2.4 KM AWAY</text>
        </g>
        <circle cx="487" cy="89" r="4" fill="#a8dfbd" />
        <circle cx="332" cy="265" r="5" fill="#d8f0df" opacity=".8" />
      </svg>
      <span className="caption">Find care that fits your day.</span>
    </div>
  );
}
