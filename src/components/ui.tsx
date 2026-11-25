import { Component, useEffect, useRef, type ReactNode, type MouseEvent } from 'react'
import gsap from 'gsap'
import logo from '../assets/athel-logo.png'
import { TLink } from '../lib/transition'
import { isFinePointer, prefersReducedMotion } from '../lib/motion'
import { Molecule } from './Molecule'

/** The real Athel logo, cropped from the company PDF. Never redrawn or recoloured.
 *  In dark mode it sits on an ivory plate so the teal wordmark stays legible. */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`logo ${className}`}>
      <img src={logo} alt="Athel Pharmaceutical" width={600} height={449} />
    </span>
  )
}

/** Tiny pull toward the cursor on desktop. Movement is capped at a few pixels. */
function useMagnetic<T extends HTMLElement>(enabled: boolean) {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || !enabled || !isFinePointer() || prefersReducedMotion()) return
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      gsap.to(el, { x: ((e.clientX - r.left) / r.width - 0.5) * 8, y: ((e.clientY - r.top) / r.height - 0.5) * 6, duration: 0.4, ease: 'power3.out' })
    }
    const leave = () => gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.6)' })
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); gsap.set(el, { x: 0, y: 0 }) }
  }, [enabled])
  return ref
}

interface BtnProps {
  children: ReactNode
  to?: string
  href?: string
  onClick?: (e: MouseEvent) => void
  variant?: 'primary' | 'ghost' | 'quiet'
  type?: 'button' | 'submit'
  magnetic?: boolean
  disabled?: boolean
  className?: string
  ariaLabel?: string
  pressed?: boolean
}
/** One button for the whole site. Give it `to` (internal page), `href`
 *  (email, phone, outside link) or `onClick`. */
export function Btn({ children, to, href, onClick, variant = 'primary', type = 'button', magnetic = true, disabled, className = '', ariaLabel, pressed }: BtnProps) {
  const ref = useMagnetic<any>(magnetic)
  const cls = `btn btn--${variant} ${className}`
  const inner = <span className="btn-in">{children}</span>
  if (to) return <TLink ref={ref} to={to} className={cls} aria-label={ariaLabel} onClick={onClick as any}>{inner}</TLink>
  if (href) return <a ref={ref} href={href} className={cls} aria-label={ariaLabel} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">{inner}</a>
  return <button ref={ref} type={type} className={cls} onClick={onClick} disabled={disabled} aria-label={ariaLabel} aria-pressed={pressed}>{inner}</button>
}

/** Shows real content when it exists; otherwise a clearly labelled placeholder. */
export function Fill({ value, children, where }: { value?: string; children: ReactNode; where: string }) {
  if (value && value.trim()) return <>{value}</>
  return (
    <span className="ph">
      <span className="ph-tag">Placeholder</span>
      {children} <span className="ph-where">Edit: {where}</span>
    </span>
  )
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow"><span className="eyebrow-dot" aria-hidden="true" />{children}</p>
}

export function Loader({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="loader" role="status" aria-live="polite">
      <Molecule state="idle" className="loader-mol" />
      <span>{label}…</span>
    </div>
  )
}

/** Catches a crash in one feature (for example 3D) and shows a fallback
 *  instead of taking the whole page down. */
export class ErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(err: unknown) { console.warn('Athel: a feature failed and its fallback is shown instead.', err) }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

/** Portrait frame. Shows the real photograph when one is supplied — never a stock photo. */
export function Portrait({ src, name, file }: { src?: string; name: string; file: string }) {
  return (
    <figure className="portrait">
      {src ? (
        <img src={src} alt={`Portrait of ${name}`} loading="lazy" />
      ) : (
        <div className="portrait-empty">
          <Molecule state="legacy" className="portrait-mol" />
          <span className="ph-tag">Photograph to be added</span>
          <span className="ph-where">{file}</span>
        </div>
      )}
    </figure>
  )
}

/** Shown if 3D cannot run. Same idea, drawn flat. */
export function CapsuleFallback() {
  return (
    <div className="capsule capsule--flat">
      <svg viewBox="0 0 320 160" role="img" aria-label="Illustration of a capsule in Athel teal and amber">
        <g transform="rotate(-18 160 80)">
          <path d="M160 40 H100 a40 40 0 0 0 0 80 H160 Z" fill="#01a19f" />
          <path d="M160 40 H220 a40 40 0 0 1 0 80 H160 Z" fill="#e8972b" />
          <path d="M96 56 H200" stroke="#fff" strokeOpacity=".45" strokeWidth="8" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  )
}
