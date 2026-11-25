import { useEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from './motion'

gsap.registerPlugin(ScrollTrigger)

/*
 * SCROLL STORYTELLING
 * Put one of these attributes on any element inside a page:
 *   data-reveal="up"       fades and rises
 *   data-reveal="words"    (on a <Split>) words rise one after another
 *   data-reveal="letters"  (on a <Split by="letters">) letter by letter
 *   data-reveal="mask"     wipes open from the bottom, for images
 *   data-reveal="stagger"  direct children appear one after another
 *   data-reveal="slow"     a long, quiet fade (used on the legacy page)
 *   data-parallax="0.2"    drifts with scroll
 *   data-draw              an SVG path or line that draws itself with scroll
 * Content is visible by default; animation only ever adds to it, so nothing
 * is lost if scripts fail or reduced motion is requested.
 */
export function useScrollStory(ref: RefObject<HTMLElement>, deps: unknown[] = []) {
  useEffect(() => {
    const root = ref.current
    if (!root || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      const each = (sel: string, fn: (el: HTMLElement) => void) => root.querySelectorAll<HTMLElement>(sel).forEach(fn)
      const st = (el: Element, start = 'top 86%') => ({ trigger: el, start, once: true })

      each('[data-reveal="up"]', (el) => gsap.from(el, { y: 36, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: st(el) }))
      each('[data-reveal="slow"]', (el) => gsap.from(el, { y: 14, opacity: 0, duration: 1.8, ease: 'power2.out', scrollTrigger: st(el, 'top 80%') }))
      each('[data-reveal="words"]', (el) =>
        gsap.from(el.querySelectorAll('.split-i'), { yPercent: 115, duration: 0.95, ease: 'power4.out', stagger: 0.045, scrollTrigger: st(el) }),
      )
      each('[data-reveal="letters"]', (el) =>
        gsap.from(el.querySelectorAll('.split-i'), { yPercent: 115, opacity: 0, duration: 0.8, ease: 'power4.out', stagger: 0.028, scrollTrigger: st(el) }),
      )
      each('[data-reveal="mask"]', (el) =>
        gsap.fromTo(el, { clipPath: 'inset(100% 0% 0% 0% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: 1.2, ease: 'power3.inOut', scrollTrigger: st(el) }),
      )
      each('[data-reveal="stagger"]', (el) =>
        gsap.from(el.children, { y: 28, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.07, scrollTrigger: st(el) }),
      )
      each('[data-parallax]', (el) =>
        gsap.to(el, { yPercent: -100 * Number(el.dataset.parallax || 0.2), ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 } }),
      )
      root.querySelectorAll<SVGGeometryElement>('[data-draw]').forEach((el) => {
        const len = el.getTotalLength?.() ?? 0
        if (!len) return
        gsap.fromTo(el, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 55%', scrub: 0.5 } })
      })
    }, root)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

export { gsap, ScrollTrigger }
