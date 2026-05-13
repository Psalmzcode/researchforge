'use client'
import { useEffect, useState, useCallback } from 'react'

const slides = [
  {
    image: '/hero/research.png',
    headline: 'Data-Driven Research,\nStrategy & Sustainable Solutions',
    accent: 'Sustainable',
    description:
      'We help organizations design smarter research systems, generate actionable insights, and drive impact across energy, environment, development, and industry.',
  },
  {
    image: '/hero/survey.png',
    headline: 'Digital Survey Design\n& Data Collection',
    accent: 'Data Collection',
    description:
      'From questionnaire architecture to field deployment, we build survey systems that capture clean, reliable data at scale — across sectors and geographies.',
  },
  {
    image: '/hero/sustainability.png',
    headline: 'Sustainability &\nEnvironmental Consulting',
    accent: 'Environmental',
    description:
      'We embed sustainability into every strategy — helping organizations meet ESG goals, reduce environmental footprint, and build evidence-backed frameworks.',
  },
  {
    image: '/hero/advisory.png',
    headline: 'Strategic Advisory &\nDevelopment Impact',
    accent: 'Development Impact',
    description:
      'Guiding organizations through complex decisions with structured thinking, sector expertise, and measurable outcomes that drive lasting change.',
  },
]

const INTERVAL = 6000
const FADE_MS = 600

export function HeroCarousel() {
  const [current, setCurrent] = useState(0)
  const [visible, setVisible] = useState(true)

  const goTo = useCallback(
    (idx: number) => {
      if (idx === current) return
      setVisible(false)
      setTimeout(() => {
        setCurrent(idx)
        setVisible(true)
      }, FADE_MS)
    },
    [current],
  )

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setCurrent((i) => (i + 1) % slides.length)
        setVisible(true)
      }, FADE_MS)
    }, INTERVAL)
    return () => clearInterval(id)
  }, [])

  const s = slides[current]

  const renderHeadline = () => {
    const parts = s.headline.split(s.accent)
    if (parts.length < 2) return s.headline
    return (
      <>
        {parts[0].split('\n').map((line, i, arr) => (
          <span key={i}>
            {line}
            {i < arr.length - 1 && <br />}
          </span>
        ))}
        <em className="not-italic" style={{ color: 'var(--accent)' }}>
          {s.accent}
        </em>
        {parts[1].split('\n').map((line, i, arr) => (
          <span key={`b${i}`}>
            {line}
            {i < arr.length - 1 && <br />}
          </span>
        ))}
      </>
    )
  }

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center px-[6%] pt-32 pb-20 overflow-hidden"
    >
      {/* Background images — all rendered, opacity controlled */}
      {slides.map((sl, i) => (
        <div
          key={i}
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${sl.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: i === current ? 1 : 0,
            transition: `opacity ${FADE_MS}ms ease-in-out`,
            transform: i === current ? 'scale(1.03)' : 'scale(1)',
          }}
        />
      ))}

      {/* Dark overlay for text readability — lower alpha = brighter hero */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(105deg, rgba(10,15,28,.72) 45%, rgba(10,15,28,.42) 100%)' }}
      />


      {/* Content */}
      <div className="relative z-10 max-w-[1200px] mx-auto w-full grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 items-center">
        <div className="max-w-[640px]">
          {/* Eyebrow — stays fixed */}
          <div
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] uppercase mb-6"
            style={{ color: 'var(--accent)' }}
          >
            <span className="w-7 h-[1.5px]" style={{ background: 'var(--accent)' }} />
            Consulting · Research · Strategy
          </div>

          {/* Fading headline */}
          <h1
            className="font-serif text-[clamp(2rem,4.5vw,3.7rem)] font-bold leading-[1.17] mb-6"
            style={{
              color: '#fff',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(12px)',
              transition: `opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease`,
            }}
          >
            {renderHeadline()}
          </h1>

          {/* Fading description */}
          <p
            className="text-[clamp(.9rem,1.5vw,1rem)] mb-9 leading-[1.82]"
            style={{
              color: 'rgba(255,255,255,.7)',
              maxWidth: '520px',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(12px)',
              transition: `opacity ${FADE_MS}ms ease ${visible ? '100ms' : '0ms'}, transform ${FADE_MS}ms ease ${visible ? '100ms' : '0ms'}`,
            }}
          >
            {s.description}
          </p>

          {/* CTA — stays fixed */}
          <div className="flex gap-4 flex-wrap">
            <a
              href="#contact"
              className="inline-block px-7 py-3 rounded-full text-sm font-bold transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(0,198,162,.3)]"
              style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
            >
              Request a Consultation
            </a>
            <a
              href="#services"
              className="inline-block px-7 py-3 rounded-full text-sm font-semibold border transition-all hover:-translate-y-0.5"
              style={{ borderColor: 'rgba(255,255,255,.2)', color: '#fff' }}
            >
              Explore Services
            </a>
          </div>

          {/* Slide indicators */}
          <div className="flex gap-2 mt-10">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: i === current ? '32px' : '12px',
                  background: i === current ? 'var(--accent)' : 'rgba(255,255,255,.25)',
                }}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Stats — stays fixed */}
          <div
            className="flex gap-10 mt-10 pt-7 border-t flex-wrap"
            style={{ borderColor: 'rgba(255,255,255,.1)' }}
          >
            {[
              ['4+', 'Service Pillars'],
              ['Multi-Sector', 'Cross-Industry Reach'],
              ['100%', 'Outcome Focused'],
            ].map(([n, l]) => (
              <div key={l}>
                <div className="font-serif text-[1.9rem] font-bold" style={{ color: '#fff' }}>
                  {n.includes('+') ? (
                    <>
                      {n.replace('+', '')}
                      <span style={{ color: 'var(--accent)' }}>+</span>
                    </>
                  ) : n.includes('%') ? (
                    <>
                      {n.replace('%', '')}
                      <span style={{ color: 'var(--accent)' }}>%</span>
                    </>
                  ) : (
                    n
                  )}
                </div>
                <div className="text-[.73rem] mt-0.5 tracking-[.04em]" style={{ color: 'rgba(255,255,255,.5)' }}>
                  {l}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating cards — desktop only */}
        <div className="hidden lg:flex flex-col gap-4 flex-shrink-0">
          {[
            ['Project Status', '🟢 Analysis Complete'],
            ['Data Accuracy', '98.4% Field Validation'],
            ['Active Sectors', 'Energy · Environment · Education · NGO'],
          ].map(([lbl, val], i) => (
            <div
              key={lbl}
              className={`rounded-2xl p-4 min-w-[210px] border backdrop-blur-md ${i === 1 ? 'ml-8' : ''}`}
              style={{
                background: 'rgba(15,20,35,.6)',
                borderColor: 'rgba(255,255,255,.08)',
                animation: `heroFloat ${4 + i * 0.5}s ease-in-out ${i * 0.6}s infinite`,
              }}
            >
              <div className="text-[.67rem] uppercase tracking-[.1em] mb-1" style={{ color: 'rgba(255,255,255,.5)' }}>
                {lbl}
              </div>
              <div className="text-[.92rem] font-semibold" style={{ color: '#fff' }}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0) }
          50% { transform: translateY(-10px) }
        }
      `}</style>
    </section>
  )
}
