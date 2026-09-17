export function WhereWeWork() {
  return (
    <section className="reach" id="reach">
      <div className="wrap">
        <div className="section-head reveal">
          <div>
            <div className="eyebrow">Where we work</div>
            <h2>Field presence across the continent.</h2>
          </div>
          <p>ResearchForge works directly in the communities its evidence is drawn from — not from a distance.</p>
        </div>

        <div className="reach-grid reveal">
          <div className="reach-photo">
            <img src="/reach/landscape.png" alt="Aerial view of agricultural land, plantations and rural settlement" />
          </div>
          <div className="reach-map">
            <svg viewBox="0 0 680 500" role="img" aria-label="Animated map of Africa with a textured data surface and a slow light sweep">
              <defs>
                <clipPath id="reachClip">
                  <path d="M310,50 L395,58 L450,90 L462,145 L498,195 L466,225 L452,270 L432,320 L408,375 L392,420 L345,468 L300,462 L268,430 L245,388 L222,340 L210,295 L232,272 L258,256 L238,236 L205,232 L175,222 L152,198 L146,165 L168,118 L210,80 L260,58 Z" />
                </clipPath>
                <pattern id="reachDots" width="13" height="13" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1" fill="var(--terracotta)" opacity="0.55" />
                </pattern>
                <linearGradient id="reachSweep" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--lime)" stopOpacity="0" />
                  <stop offset="50%" stopColor="var(--lime)" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="var(--lime)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                className="m3-breathe"
                d="M310,50 L395,58 L450,90 L462,145 L498,195 L466,225 L452,270 L432,320 L408,375 L392,420 L345,468 L300,462 L268,430 L245,388 L222,340 L210,295 L232,272 L258,256 L238,236 L205,232 L175,222 L152,198 L146,165 L168,118 L210,80 L260,58 Z"
                fill="var(--olive-deep)"
                stroke="var(--olive)"
                strokeWidth="1"
              />
              <g clipPath="url(#reachClip)">
                <rect x="120" y="30" width="400" height="460" fill="url(#reachDots)" />
                <rect className="m3-sweep" x="0" y="30" width="160" height="460" fill="url(#reachSweep)" />
              </g>
            </svg>
            <div className="reach-caption">Field-first, evidence-led, present on the ground</div>
          </div>
        </div>
      </div>
    </section>
  )
}
