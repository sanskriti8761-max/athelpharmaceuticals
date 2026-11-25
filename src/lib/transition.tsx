import { createContext, forwardRef, useCallback, useContext, useEffect, useRef, type MouseEvent, type ReactNode } from 'react'
import { Link, createPath, useLocation, useNavigate, useNavigationType, type LinkProps } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from './motion'

/*
 * PAGE TRANSITIONS
 * Clicking an internal link grows a "liquid" circle out of the click point in
 * the destination's colour, scatters the molecule's nodes across it, swaps the
 * page underneath, then wipes away. The Legacy page gets a quiet veil instead.
 * The URL always changes through React Router, so back / forward / refresh and
 * direct links keep working. Back and forward skip the animation on purpose.
 */
type Origin = { x: number; y: number }
const Ctx = createContext<{ go: (to: string, origin?: Origin) => void }>({ go: () => {} })
export const usePageTransition = () => useContext(Ctx)

function styleFor(to: string): { kind: 'liquid' | 'veil'; bg: string } {
  if (to.startsWith('/legacy')) return { kind: 'veil', bg: '#fbf7ee' }
  if (to.startsWith('/products')) return { kind: 'liquid', bg: 'radial-gradient(circle at 30% 20%, #0f5a56, #062624 70%)' }
  if (to.startsWith('/explorer')) return { kind: 'liquid', bg: 'radial-gradient(circle at 70% 30%, #f2c14e, #e08a22 75%)' }
  if (to.startsWith('/about')) return { kind: 'liquid', bg: 'radial-gradient(circle at 30% 70%, #e4eedb, #b9d3bf 80%)' }
  if (to.startsWith('/contact')) return { kind: 'liquid', bg: 'radial-gradient(circle at 60% 60%, #18b7b2, #02716f 75%)' }
  return { kind: 'liquid', bg: 'radial-gradient(circle at 50% 40%, #0f5a56, #062624 70%)' }
}

export function TransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const navType = useNavigationType()
  const overlay = useRef<HTMLDivElement>(null)
  const busy = useRef(false)
  const here = useRef('')
  here.current = location.pathname + location.search

  const go = useCallback(
    (to: string, origin?: Origin) => {
      if (to === here.current) return window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
      const el = overlay.current
      // rapid clicking, reduced motion, or anything odd: just navigate
      if (!el || busy.current || prefersReducedMotion()) return navigate(to)
      busy.current = true
      const { kind, bg } = styleFor(to)
      const x = origin?.x ?? innerWidth / 2
      const y = origin?.y ?? innerHeight / 2
      const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 40
      const nodes = el.querySelectorAll('.pt-node')
      el.style.background = bg
      const done = () => { busy.current = false; gsap.set(el, { display: 'none' }) }
      const tl = gsap.timeline({ onComplete: done, onInterrupt: done })
      if (kind === 'veil') {
        gsap.set(el, { display: 'block', clipPath: 'none', opacity: 0 })
        tl.to(el, { opacity: 1, duration: 0.55, ease: 'power2.inOut' })
      } else {
        gsap.set(el, { display: 'block', opacity: 1, clipPath: `circle(0px at ${x}px ${y}px)` })
        tl.to(el, { clipPath: `circle(${r}px at ${x}px ${y}px)`, duration: 0.55, ease: 'power3.inOut' })
        tl.fromTo(
          nodes,
          { x: x - innerWidth / 2, y: y - innerHeight / 2, scale: 0, opacity: 0 },
          { x: (i) => [0, -86, 96, -44, 150, -170][i] ?? 0, y: (i) => [0, -66, -26, 92, 70, 40][i] ?? 0, scale: 1, opacity: 1, duration: 0.5, stagger: 0.03, ease: 'power3.out' },
          0.12,
        )
      }
      tl.add(() => { navigate(to); window.scrollTo(0, 0) })
      if (kind === 'veil') tl.to(el, { opacity: 0, duration: 0.7, ease: 'power2.inOut' }, '+=0.15')
      else {
        tl.to(nodes, { scale: 0, opacity: 0, duration: 0.28, stagger: 0.02, ease: 'power2.in' }, '+=0.1')
        tl.set(el, { clipPath: 'inset(0% 0% 0% 0%)' })
        tl.to(el, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.5, ease: 'power3.inOut' })
      }
    },
    [navigate],
  )

  // new page: top of page, recalculated scroll animations, focus for keyboard users
  useEffect(() => {
    if (navType !== 'POP') window.scrollTo(0, 0)
    const id = setTimeout(() => ScrollTrigger.refresh(), 350)
    return () => clearTimeout(id)
  }, [location.pathname, navType])

  return (
    <Ctx.Provider value={{ go }}>
      {children}
      <div ref={overlay} className="pt-overlay" aria-hidden="true">
        <span className="pt-node pt-node--core" />
        <span className="pt-node pt-node--a" />
        <span className="pt-node pt-node--b" />
        <span className="pt-node pt-node--c" />
        <span className="pt-node pt-node--d" />
        <span className="pt-node pt-node--e" />
      </div>
    </Ctx.Provider>
  )
}

/** Use this instead of <a> for every internal link so the transition plays. */
export const TLink = forwardRef<HTMLAnchorElement, LinkProps>(function TLink({ to, onClick, ...rest }, ref) {
  const { go } = usePageTransition()
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    let origin = { x: e.clientX, y: e.clientY }
    if (!origin.x && !origin.y) {
      const r = e.currentTarget.getBoundingClientRect() // keyboard "click"
      origin = { x: r.left + r.width / 2, y: r.top + r.height / 2 }
    }
    go(typeof to === 'string' ? to : createPath(to), origin)
  }
  return <Link ref={ref} to={to} onClick={handle} {...rest} />
})
