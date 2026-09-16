export function ArbitrumLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-arbitrum-blue to-arbitrum-neon rounded-xl blur-sm opacity-60 animate-pulse-slow" />
      
      {/* Official Arbitrum Stylus Logomark SVG */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-full h-full drop-shadow-[0_0_12px_rgba(0,229,255,0.6)]"
      >
        <defs>
          <linearGradient id="arbBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#28A0F0" />
            <stop offset="100%" stopColor="#00E5FF" />
          </linearGradient>
          <linearGradient id="stylusCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="100%" stopColor="#20C997" />
          </linearGradient>
        </defs>

        {/* Outer shield / diamond silhouette */}
        <polygon
          points="50,6 88,27 88,73 50,94 12,73 12,27"
          fill="#0a122c"
          stroke="url(#arbBlueGrad)"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Arbitrum Stylus stylized 'A' faceted geometry */}
        {/* Left wing */}
        <path
          d="M 33 68 L 50 24 L 50 48 L 41 68 Z"
          fill="url(#arbBlueGrad)"
        />
        {/* Right wing with Stylus cyan glow */}
        <path
          d="M 67 68 L 50 24 L 50 48 L 59 68 Z"
          fill="url(#stylusCyanGrad)"
        />
        {/* Crossbar stylus connector */}
        <path
          d="M 35 56 L 65 56 L 60 62 L 40 62 Z"
          fill="#FFFFFF"
          opacity="0.9"
        />
        {/* Center Stylus Core Spark */}
        <circle cx="50" cy="48" r="3" fill="#00E5FF" className="animate-ping" />
      </svg>
    </div>
  );
}
