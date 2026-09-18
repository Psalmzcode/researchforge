'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Scroll-triggered fade/slide for `.reveal` elements, plus a page enter fade.
 * Re-runs when the route changes so About / project pages animate too.
 */
export function RevealOnScroll() {
  const pathname = usePathname()

  useEffect(() => {
    const root = document.querySelector('.rf-site')
    if (root) {
      root.classList.remove('rf-page-ready')
      void (root as HTMLElement).offsetWidth
      requestAnimationFrame(() => {
        root.classList.add('rf-page-ready')
      })
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal'))

    if (reduceMotion || !('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('in-view'))
      return
    }

    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )

    els.forEach(el => {
      el.classList.remove('in-view')
      io.observe(el)
    })

    return () => io.disconnect()
  }, [pathname])

  return null
}
