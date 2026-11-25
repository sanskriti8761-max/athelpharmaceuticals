import { useEffect, useId, useRef, type KeyboardEvent } from 'react'
import gsap from 'gsap'
import { pointer, prefersReducedMotion } from '../lib/motion'

/*
 * THE ATHEL MOLECULE
 * A redrawing of the mark in the Athel logo: one large lime-to-amber sphere,
 * two orange satellites, and a green node on a stem. It is the site's
 * signature motif. The same component behaves differently per `state`.
 * (The company logo itself is never redrawn — it is always the real image.)
 */
export type MoleculeState =
  | 'intro' | 'idle' | 'hover' | 'interactive' | 'disassemble' | 'assemble' | 'transition'
  | 'product-universe' | 'composition-network' | 'legacy' | 'contact' | 'reduced-motion'

interface NodeDef { x: number; y: number; r: number; depth: number; fill: 'core' | 'orange' | 'green'; sx: number; sy: number }

// positions measured from the logo, in a 210 x 200 box
const NODES: NodeDef[] = [
  { x: 95, y: 80, r: 48, depth: 0.3, fill: 'core', sx: 0, sy: 0 },
  { x: 25, y: 25, r: 23, depth: 1, fill: 'orange', sx: -95, sy: -70 },
  { x: 177, y: 61, r: 23, depth: 0.8, fill: 'orange', sx: 120, sy: -45 },
  { x: 61, y: 164, r: 25, depth: 0.6, fill: 'green', sx: -70, sy: 105 },
]
// small outer nodes that appear in the "network" states
const EXTRAS = [
  { x: 150, y: 150, r: 9, from: 0, tone: 'lime' },
  { x: 205, y: 120, r: 6, from: 2, tone: 'amber' },
  { x: -8, y: 92, r: 7, from: 1, tone: 'amber' },
  { x: 112, y: -8, r: 6, from: 0, tone: 'lime' },
  { x: 14, y: 190, r: 6, from: 3, tone: 'lime' },
  { x: 118, y: 196, r: 5, from: 3, tone: 'amber' },
]

const TARGETS: Record<MoleculeState, { scatter: number; extras: number; mouse: boolean; speed: number; signals: boolean }> = {
  intro: { scatter: 0, extras: 0, mouse: false, speed: 1, signals: false },
  idle: { scatter: 0, extras: 0, mouse: false, speed: 1, signals: false },
  hover: { scatter: 0, extras: 0.5, mouse: true, speed: 1.3, signals: false },
  interactive: { scatter: 0, extras: 0, mouse: true, speed: 1, signals: false },
  disassemble: { scatter: 1, extras: 0, mouse: false, speed: 1, signals: false },
  assemble: { scatter: 0, extras: 0, mouse: false, speed: 1, signals: false },
  transition: { scatter: 1, extras: 1, mouse: false, speed: 1.6, signals: false },
  'product-universe': { scatter: 0, extras: 1, mouse: true, speed: 1, signals: false },
  'composition-network': { scatter: 0, extras: 1, mouse: true, speed: 1, signals: true },
  legacy: { scatter: 0, extras: 0, mouse: false, speed: 0.35, signals: false },
  contact: { scatter: 0, extras: 0.7, mouse: true, speed: 0.8, signals: true },
  'reduced-motion': { scatter: 0, extras: 0, mouse: false, speed: 0, signals: false },
}

interface Props {
  state?: MoleculeState
  className?: string
  id?: string
  /** makes the molecule a button (keyboard + click) */
  onActivate?: () => void
  label?: string
  cursor?: string
}

export function Molecule({ state = 'idle', className = '', id, onActivate, label, cursor }: Props) {
  const uid = useId().replace(/:/g, '')
  const svg = useRef<SVGSVGElement>(null)
  const v = useRef({ scatter: state === 'intro' ? 1 : 0, extras: 0, pulse: 0, mx: 0, my: 0 })
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    const el = svg.current
    if (!el) return
    const reduced = prefersReducedMotion() || state === 'reduced-motion'
    const nodes = [...el.querySelectorAll<SVGGElement>('.mol-node')]
    const bonds = [...el.querySelectorAll<SVGLineElement>('.mol-bond')]
    const shines = [...el.querySelectorAll<SVGCircleElement>('.mol-shine')]
    const extras = [...el.querySelectorAll<SVGGElement>('.mol-extra')]
    const signals = [...el.querySelectorAll<SVGCircleElement>('.mol-signal')]
    const pos = NODES.map((n) => ({ x: n.x, y: n.y }))

    const draw = (t: number) => {
      const cfg = TARGETS[stateRef.current]
      const s = v.current
      const rect = el.getBoundingClientRect()
      // pointer position relative to this molecule, softened
      const tx = cfg.mouse && pointer.active ? Math.max(-1, Math.min(1, (pointer.x - (rect.left + rect.width / 2)) / (window.innerWidth / 2))) : 0
      const ty = cfg.mouse && pointer.active ? Math.max(-1, Math.min(1, (pointer.y - (rect.top + rect.height / 2)) / (window.innerHeight / 2))) : 0
      s.mx += (tx - s.mx) * 0.06
      s.my += (ty - s.my) * 0.06
      const sc = s.scatter + s.pulse
      NODES.forEach((n, i) => {
        const f = reduced ? 0 : 1
        const fx = Math.sin(t * 0.0006 * cfg.speed + i * 1.7) * 3.2 * f
        const fy = Math.cos(t * 0.0005 * cfg.speed + i * 2.3) * 3.6 * f
        pos[i].x = n.x + fx + s.mx * 12 * n.depth + n.sx * sc
        pos[i].y = n.y + fy + s.my * 12 * n.depth + n.sy * sc
        const scale = i === 0 ? 1 - 0.35 * sc : 1 - 0.2 * sc
        nodes[i].setAttribute('transform', `translate(${pos[i].x.toFixed(2)} ${pos[i].y.toFixed(2)}) scale(${scale.toFixed(3)})`)
        // the highlight slides toward the cursor: the "light source" follows it
        shines[i]?.setAttribute('transform', `translate(${(s.mx * n.r * 0.35).toFixed(2)} ${(s.my * n.r * 0.35).toFixed(2)})`)
      })
      bonds.forEach((b, i) => {
        const p = pos[i + 1]
        b.setAttribute('x1', pos[0].x.toFixed(2)); b.setAttribute('y1', pos[0].y.toFixed(2))
        b.setAttribute('x2', p.x.toFixed(2)); b.setAttribute('y2', p.y.toFixed(2))
        b.style.opacity = String(Math.max(0, 1 - sc * 1.6))
      })
      extras.forEach((g, i) => {
        const e = EXTRAS[i]
        const a = pos[e.from]
        const k = s.extras
        const ex = a.x + (e.x - NODES[e.from].x) * k + Math.sin(t * 0.0008 + i) * 2 * (reduced ? 0 : 1) + s.mx * 18
        const ey = a.y + (e.y - NODES[e.from].y) * k + Math.cos(t * 0.0007 + i * 2) * 2 * (reduced ? 0 : 1) + s.my * 18
        g.style.opacity = String(k)
        const line = g.firstElementChild as SVGLineElement
        line.setAttribute('x1', a.x.toFixed(2)); line.setAttribute('y1', a.y.toFixed(2))
        line.setAttribute('x2', ex.toFixed(2)); line.setAttribute('y2', ey.toFixed(2))
        ;(g.lastElementChild as SVGCircleElement).setAttribute('transform', `translate(${ex.toFixed(2)} ${ey.toFixed(2)})`)
      })
      signals.forEach((c, i) => {
        if (!cfg.signals || reduced) { c.style.opacity = '0'; return }
        const k = (t * 0.00035 + i * 0.33) % 1
        const p = pos[i + 1]
        c.setAttribute('cx', (pos[0].x + (p.x - pos[0].x) * k).toFixed(2))
        c.setAttribute('cy', (pos[0].y + (p.y - pos[0].y) * k).toFixed(2))
        c.style.opacity = String(Math.sin(k * Math.PI) * 0.9)
      })
    }

    let raf = 0
    let visible = true
    const loop = (t: number) => {
      draw(t)
      if (visible && !document.hidden) raf = requestAnimationFrame(loop)
      else raf = 0
    }
    const start = () => { if (!raf && !reduced) raf = requestAnimationFrame(loop) }
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start() })
    io.observe(el)
    const onVis = () => start()
    document.addEventListener('visibilitychange', onVis)
    draw(0)
    start()
    ;(el as any).__draw = () => draw(performance.now())
    return () => { cancelAnimationFrame(raf); io.disconnect(); document.removeEventListener('visibilitychange', onVis) }
  }, [state === 'reduced-motion'])

  // tween toward the new state's targets
  useEffect(() => {
    const cfg = TARGETS[state]
    const el = svg.current as any
    if (prefersReducedMotion()) {
      Object.assign(v.current, { scatter: state === 'disassemble' || state === 'transition' ? 0 : cfg.scatter, extras: cfg.extras })
      el?.__draw?.()
      return
    }
    const tw = gsap.to(v.current, {
      scatter: cfg.scatter,
      extras: cfg.extras,
      duration: state === 'intro' ? 1.5 : 0.9,
      delay: state === 'intro' ? 0.35 : 0,
      ease: state === 'intro' ? 'power3.inOut' : 'power3.out',
    })
    return () => { tw.kill() }
  }, [state])

  const activate = () => {
    if (!prefersReducedMotion()) gsap.fromTo(v.current, { pulse: 0 }, { pulse: 0.22, duration: 0.22, ease: 'power2.out', yoyo: true, repeat: 1 })
    onActivate?.()
  }
  const onKey = (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate() } }
  const g = (n: string) => `${uid}-${n}`

  return (
    <svg
      ref={svg} id={id} viewBox="-40 -40 290 280" className={`molecule molecule--${state} ${className}`}
      role={onActivate ? 'button' : 'img'} tabIndex={onActivate ? 0 : undefined}
      aria-label={label ?? (onActivate ? 'Athel molecule' : undefined)} aria-hidden={!label && !onActivate ? true : undefined}
      onClick={onActivate ? activate : undefined} onKeyDown={onActivate ? onKey : undefined} data-cursor={cursor}
    >
      <defs>
        <linearGradient id={g('core')} x1="0.15" y1="1" x2="0.85" y2="0">
          <stop offset="0" stopColor="#a9c532" /><stop offset="0.55" stopColor="#d9a826" /><stop offset="1" stopColor="#e8872b" />
        </linearGradient>
        <linearGradient id={g('orange')} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#e5a323" /><stop offset="1" stopColor="#e8802b" />
        </linearGradient>
        <linearGradient id={g('green')} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#6fb23c" /><stop offset="1" stopColor="#a4c93a" />
        </linearGradient>
        <radialGradient id={g('shine')}>
          <stop offset="0" stopColor="#fff" stopOpacity="0.75" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={g('halo')}>
          <stop offset="0" stopColor="#e5a323" stopOpacity="0.38" /><stop offset="0.6" stopColor="#a9c532" stopOpacity="0.1" /><stop offset="1" stopColor="#a9c532" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle className="mol-halo" cx="100" cy="95" r="135" fill={`url(#${g('halo')})`} />
      {EXTRAS.map((e, i) => (
        <g key={i} className="mol-extra" style={{ opacity: 0 }}>
          <line className="mol-thin" />
          <circle r={e.r} className={`mol-extra-node mol-extra-node--${e.tone}`} />
        </g>
      ))}
      {NODES.slice(1).map((n, i) => (
        <line key={i} className="mol-bond" stroke={n.fill === 'green' ? '#86bb3a' : '#e3962a'} strokeWidth={i === 2 ? 15 : 11} strokeLinecap="round" x1={NODES[0].x} y1={NODES[0].y} x2={n.x} y2={n.y} />
      ))}
      {[0, 1, 2].map((i) => <circle key={i} className="mol-signal" r="3.2" style={{ opacity: 0 }} />)}
      {NODES.map((n, i) => (
        <g key={i} className="mol-node" transform={`translate(${n.x} ${n.y})`}>
          <circle r={n.r} fill={`url(#${g(n.fill)})`} />
          {n.fill === 'green' && <circle r={n.r - 2.5} fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.4" />}
          <circle className="mol-shine" cx={-n.r * 0.3} cy={-n.r * 0.32} r={n.r * 0.62} fill={`url(#${g('shine')})`} />
          <path
            d={`M ${-n.r * 0.72} ${-n.r * 0.12} A ${n.r * 0.74} ${n.r * 0.74} 0 0 1 ${-n.r * 0.05} ${-n.r * 0.74} A ${n.r * 0.95} ${n.r * 0.95} 0 0 0 ${-n.r * 0.72} ${-n.r * 0.12} Z`}
            fill="#fff" fillOpacity="0.85"
          />
        </g>
      ))}
    </svg>
  )
}
