'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const DURATION = 6500
const TOTAL = 4

const SLIDES = [
  {
    img: '/hero/savanna.jpg',
    alt: 'Wide African savanna landscape at golden hour',
    eyebrow: 'Data · Research · Intelligence',
    title: <>Turning African evidence into <em>decisions</em> that work.</>,
    lede: 'ResearchForge generates field-based data, research and intelligence that help governments, investors, development organizations and businesses design, finance and scale sustainable solutions across Africa.',
    primary: { href: '#projects', label: 'Explore our work' },
    secondary: { href: '#contact', label: 'Partner with us' },
  },
  {
    img: '/hero/agriculture.jpg',
    alt: 'Farmer working in a field at sunrise',
    eyebrow: 'Agriculture & Food Systems',
    title: <>Evidence rooted in the <em>field</em>, not the boardroom.</>,
    lede: 'Household surveys, crop and market data collected directly from smallholder farmers shape every recommendation we make about food systems and rural livelihoods.',
    primary: { href: '#focus', label: 'See focus areas' },
    secondary: { href: '#contact', label: 'Partner with us' },
  },
  {
    img: '/hero/energy.jpg',
    alt: 'Solar panel infrastructure in a rural setting',
    eyebrow: 'Energy & Productive Use',
    title: <>Power that <em>pays for itself</em> in the field.</>,
    lede: 'We size demand and track outcomes for irrigation, cold storage and processing powered by productive-use energy, so financing decisions rest on real usage, not projections.',
    primary: { href: '#projects', label: 'View a project' },
    secondary: { href: '#contact', label: 'Partner with us' },
  },
  {
    img: '/hero/climate.jpg',
    alt: 'Green resilient landscape used for climate research',
    eyebrow: 'Climate Resilience',
    title: <>Built to withstand <em>what&apos;s coming</em>, not what&apos;s passed.</>,
    lede: 'Baseline data and ongoing monitoring on climate-smart practices help partners design resilience programs that hold up as conditions on the ground keep changing.',
    primary: { href: '#research', label: 'Read our research' },
    secondary: { href: '#contact', label: 'Partner with us' },
  },
] as const

function pad(n: number) {
  return String(n + 1).padStart(2, '0')
}

export function HeroSlider() {
  const [active, setActive] = useState(0)
  const activeRef = useRef(0)

  const goTo = useCallback((index: number) => {
    const next = ((index % TOTAL) + TOTAL) % TOTAL
    activeRef.current = next
    setActive(next)
  }, [])

  // Auto-advance: reschedule whenever the active slide changes
  useEffect(() => {
    const id = window.setTimeout(() => {
      goTo(activeRef.current + 1)
    }, DURATION)
    return () => window.clearTimeout(id)
  }, [active, goTo])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goTo(activeRef.current + 1)
      if (e.key === 'ArrowLeft') goTo(activeRef.current - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goTo])

  return (
    <section
      className="hero-slider"
      id="top"
      aria-roledescription="carousel"
      aria-label="ResearchForge introduction"
    >
      <div className="hero-track">
        {SLIDES.map((slide, idx) => (
          <article
            key={slide.eyebrow}
            className={`hero-slide${idx === active ? ' is-active' : ''}`}
            data-slide={idx}
            aria-hidden={idx !== active}
          >
            <div className="hero-slide-media">
              {/* key forces Ken Burns animation to restart on every visit */}
              <img key={`${idx}-${active === idx ? 'on' : 'off'}`} src={slide.img} alt={slide.alt} />
            </div>
            <div className="hero-slide-inner">
              <div className="hero-slide-content">
                <div className="hero-eyebrow">{slide.eyebrow}</div>
                <h1>{slide.title}</h1>
                <p className="lede">{slide.lede}</p>
                <div className="hero-slide-actions">
                  <a href={slide.primary.href} className="btn btn-ghost" style={{ borderColor: '#fff', background: 'rgba(255,255,255,0.08)' }}>
                    {slide.primary.label}
                  </a>
                  <a href={slide.secondary.href} className="btn btn-solid">{slide.secondary.label}</a>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="hero-index">
        <span className="cur">{pad(active)}</span>/&nbsp;{String(TOTAL).padStart(2, '0')}
      </div>

      <div className="hero-slider-nav">
        <div className="hero-dots" role="tablist" aria-label="Slides">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              className={`hero-dot${idx === active ? ' is-active' : ''}`}
              aria-label={`Slide ${idx + 1}`}
              aria-selected={idx === active}
              onClick={() => goTo(idx)}
            />
          ))}
        </div>
        <div className="hero-arrows">
          <button
            type="button"
            className="hero-arrow"
            aria-label="Previous slide"
            onClick={() => goTo(activeRef.current - 1)}
          >
            &#8592;
          </button>
          <button
            type="button"
            className="hero-arrow"
            aria-label="Next slide"
            onClick={() => goTo(activeRef.current + 1)}
          >
            &#8594;
          </button>
        </div>
      </div>

      <div className="hero-progress" key={active}>
        <div className="hero-progress-bar is-running" />
      </div>
    </section>
  )
}
