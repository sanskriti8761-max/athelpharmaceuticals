import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { COMPANY } from '../data/company'
import { Logo } from './ui'
import { Molecule, type MoleculeState } from './Molecule'
import { Split } from './Split'

/*
 * THE OPENING (about 3.5 seconds, skippable, once per browser session)
 * 1 atmosphere  2 particles drift in  3 they resolve into the molecule
 * 4 the real logo appears with a light sweep  5 the tagline
 * 6 the molecule travels to its place in the homepage hero.
 */
export function Intro({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const mol = useRef<HTMLDivElement>(null)
  const [molState, setMolState] = useState<MoleculeState>('intro')
  const finished = useRef(false)
  const tlRef = useRef<gsap.core.Timeline>()

  const finish = (fast = false) => {
    if (finished.current) return
    finished.current = true
    tlRef.current?.kill()
    setMolState('interactive')
    const el = root.current, m = mol.current
    const target = document.getElementById('hero-molecule')
    const end = () => { document.documentElement.classList.remove('intro-active'); onDone() }
    if (!el || !m) return end()
    const d = fast ? 0.45 : 0.95
    const tl = gsap.timeline({ onComplete: end })
    tl.to(el.querySelectorAll('.intro-fade'), { opacity: 0, duration: d * 0.5, ease: 'power2.out' }, 0)
    tl.to(el.querySelector('.intro-bg'), { opacity: 0, duration: d, ease: 'power2.inOut' }, 0)
    if (target) {
      // hand the molecule over: fly it exactly onto the hero molecule
      const a = m.getBoundingClientRect(), b = target.getBoundingClientRect()
      tl.to(m, { x: `+=${b.left + b.width / 2 - (a.left + a.width / 2)}`, y: `+=${b.top + b.height / 2 - (a.top + a.height / 2)}`, scale: b.width / a.width, duration: d, ease: 'power3.inOut' }, 0)
    } else tl.to(m, { opacity: 0, scale: 0.9, duration: d * 0.6 }, 0)
  }

  useEffect(() => {
    const el = root.current!
    document.documentElement.classList.add('intro-active')
    const safety = setTimeout(() => finish(true), 7000) // never trap a visitor
    try {
      const tl = gsap.timeline({ onComplete: () => finish() })
      tlRef.current = tl
      tl.from(el.querySelector('.intro-glow'), { opacity: 0, scale: 0.7, duration: 1.2, ease: 'power2.out' }, 0)
      tl.fromTo(el.querySelectorAll('.intro-p'),
        { x: () => gsap.utils.random(-42, 42) + 'vw', y: () => gsap.utils.random(-38, 38) + 'vh', opacity: 0, scale: () => gsap.utils.random(0.4, 1.4) },
        { x: 0, y: 0, opacity: (i) => (i % 3 ? 0.9 : 0.5), duration: 1.5, ease: 'power3.inOut', stagger: { each: 0.03, from: 'random' } }, 0.1)
      tl.to(el.querySelectorAll('.intro-p'), { opacity: 0, scale: 0, duration: 0.4, stagger: 0.01 }, 1.5)
      tl.fromTo(mol.current, { opacity: 0, scale: 0.72, rotate: -14 }, { opacity: 1, scale: 1, rotate: 0, duration: 1.5, ease: 'power3.out' }, 0.35)
      tl.fromTo(el.querySelector('.intro-logo'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 1.65)
      tl.fromTo(el.querySelector('.intro-sweep'), { xPercent: -160 }, { xPercent: 160, duration: 0.9, ease: 'power2.inOut' }, 1.85)
      tl.from(el.querySelectorAll('.intro-tag .split-i'), { yPercent: 110, opacity: 0, duration: 0.6, ease: 'power3.out', stagger: 0.035 }, 2.15)
      tl.to({}, { duration: 0.75 })
    } catch { finish(true) }
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape' || e.key === 'Enter') finish(true) }
    window.addEventListener('keydown', key)
    return () => { clearTimeout(safety); window.removeEventListener('keydown', key); tlRef.current?.kill(); document.documentElement.classList.remove('intro-active') }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={root} className="intro" role="dialog" aria-label="Athel Pharmaceutical opening">
      <div className="intro-bg" />
      <div className="intro-glow intro-fade" />
      <div className="intro-stage">
        <div className="intro-particles" aria-hidden="true">
          {Array.from({ length: 16 }, (_, i) => <span key={i} className={`intro-p intro-p--${i % 4}`} />)}
        </div>
        <div ref={mol} className="intro-mol"><Molecule state={molState} /></div>
        <div className="intro-logo intro-fade"><Logo /><span className="intro-sweep" aria-hidden="true" /></div>
        <p className="intro-tag intro-fade"><Split text={COMPANY.tagline} reveal={false} /></p>
      </div>
      <button className="intro-skip intro-fade" onClick={() => finish(true)}>Skip intro</button>
    </div>
  )
}
