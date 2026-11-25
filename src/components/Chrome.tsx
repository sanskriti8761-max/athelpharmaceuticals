import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ArrowUp, Mail, MapPin, Menu, Moon, Phone, Sun, X } from 'lucide-react'
import gsap from 'gsap'
import { COMPANY, DISCLAIMER } from '../data/company'
import { TLink } from '../lib/transition'
import { useApp } from '../lib/app'
import { prefersReducedMotion } from '../lib/motion'
import { Fill, Logo } from './ui'
import { Molecule } from './Molecule'

export const NAV = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/explorer', label: 'Composition Explorer' },
  { to: '/about', label: 'About' },
  { to: '/legacy', label: 'Legacy' },
  { to: '/contact', label: 'Contact' },
]
const isActive = (path: string, to: string) => (to === '/' ? path === '/' : path.startsWith(to))

/* ---------- theme ---------- */
function useTheme() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'light')
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    const html = document.documentElement
    html.classList.add('theme-switching') // turns on smooth colour transitions briefly
    html.dataset.theme = next
    setTheme(next)
    try { localStorage.setItem('athel-theme', next) } catch { /* private mode: just don't persist */ }
    setTimeout(() => html.classList.remove('theme-switching'), 700)
  }
  return { theme, toggle }
}

/* ---------- main navigation ---------- */
export function Nav() {
  const { pathname } = useLocation()
  const { theme, toggle } = useTheme()
  const { egg } = useApp()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const clicks = useRef<number[]>([])
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', open)
    if (!open) return
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', key)
    if (!prefersReducedMotion() && panel.current)
      gsap.from(panel.current.querySelectorAll('.mnav-link'), { y: 30, opacity: 0, duration: 0.6, ease: 'power3.out', stagger: 0.05, delay: 0.1 })
    panel.current?.querySelector<HTMLElement>('a')?.focus()
    return () => window.removeEventListener('keydown', key)
  }, [open])

  // Easter egg: five quick clicks on the logo
  const logoClick = () => {
    const now = Date.now()
    clicks.current = [...clicks.current.filter((t) => now - t < 2200), now]
    if (clicks.current.length >= 5) { clicks.current = []; egg() }
  }

  return (
    <header className={`nav ${scrolled ? 'is-scrolled' : ''} ${open ? 'is-open' : ''}`}>
      <a className="skip-link" href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus() }}>Skip to content</a>
      <div className="nav-in">
        <TLink to="/" className="nav-logo" aria-label="Athel Pharmaceutical — home" onClick={logoClick}><Logo /></TLink>
        <nav className="nav-links" aria-label="Main">
          {NAV.map((n) => (
            <TLink key={n.to} to={n.to} className={`nav-link ${isActive(pathname, n.to) ? 'is-active' : ''}`} aria-current={isActive(pathname, n.to) ? 'page' : undefined}>
              {n.label}
            </TLink>
          ))}
        </nav>
        <div className="nav-tools">
          <button className="icon-btn" onClick={toggle} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            <span className="theme-ic" data-theme-ic={theme}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</span>
          </button>
          <button className="icon-btn nav-burger" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'Close menu' : 'Open menu'}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      <div ref={panel} id="mobile-menu" className="mnav" hidden={!open}>
        <nav aria-label="Mobile">
          {NAV.map((n, i) => (
            <TLink key={n.to} to={n.to} className={`mnav-link ${isActive(pathname, n.to) ? 'is-active' : ''}`}>
              <span className="mnav-num">0{i + 1}</span>{n.label}
            </TLink>
          ))}
        </nav>
        <Molecule state="idle" className="mnav-mol" />
      </div>
    </header>
  )
}

/* ---------- footer ---------- */
export function Footer() {
  const ref = useRef<HTMLElement>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { threshold: 0.25 })
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  return (
    <footer ref={ref} className="footer">
      <div className="wrap footer-top">
        <div className="footer-brand">
          <Logo className="footer-logo" />
          <p className="footer-tag">{COMPANY.tagline}</p>
          <p className="footer-values">{COMPANY.values.join(' · ')}</p>
        </div>
        {/* the molecule drifts apart off-screen and reassembles as the footer arrives */}
        <Molecule state={seen ? 'idle' : 'disassemble'} className="footer-mol" />
      </div>
      <div className="wrap footer-grid">
        <nav aria-label="Footer">
          <h2 className="footer-h">Explore</h2>
          <ul>{NAV.map((n) => <li key={n.to}><TLink to={n.to} className="ulink">{n.label}</TLink></li>)}</ul>
        </nav>
        <div>
          <h2 className="footer-h">Business</h2>
          <ul>
            <li>{COMPANY.business}</li>
            <li><TLink to="/contact?type=partnership" className="ulink">Partnership enquiries</TLink></li>
            <li><TLink to="/contact?type=portfolio" className="ulink">Portfolio enquiries</TLink></li>
          </ul>
        </div>
        <div>
          <h2 className="footer-h">Contact</h2>
          <ul className="footer-contact">
            <li><MapPin size={15} aria-hidden="true" /><span><Fill value={COMPANY.address} where="company.ts → address">Office address</Fill></span></li>
            <li><Phone size={15} aria-hidden="true" /><span>{COMPANY.phone ? <a className="ulink" href={`tel:${COMPANY.phone.replace(/\s/g, '')}`}>{COMPANY.phone}</a> : <Fill where="company.ts → phone">Phone number</Fill>}</span></li>
            <li><Mail size={15} aria-hidden="true" /><span>{COMPANY.email ? <a className="ulink" href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> : <Fill where="company.ts → email">Email address</Fill>}</span></li>
          </ul>
          {COMPANY.socials.length > 0 && <ul className="footer-social">{COMPANY.socials.map((s) => <li key={s.url}><a className="ulink" href={s.url} target="_blank" rel="noreferrer">{s.label}</a></li>)}</ul>}
        </div>
      </div>
      <div className="wrap footer-base">
        <p className="footer-disc">{DISCLAIMER}</p>
        <p>© {new Date().getFullYear()} {COMPANY.name}. All rights reserved.</p>
      </div>
    </footer>
  )
}

/* ---------- floating shortcut orb ---------- */
export function Orb() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [show, setShow] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    const on = () => setShow(window.scrollY > 500)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  useEffect(() => {
    if (!open) return
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const out = (e: PointerEvent) => !box.current?.contains(e.target as Node) && setOpen(false)
    window.addEventListener('keydown', key)
    window.addEventListener('pointerdown', out)
    if (!prefersReducedMotion() && box.current)
      gsap.from(box.current.querySelectorAll('.orb-item'), { y: 14, opacity: 0, scale: 0.9, duration: 0.4, ease: 'power3.out', stagger: { each: 0.035, from: 'end' } })
    return () => { window.removeEventListener('keydown', key); window.removeEventListener('pointerdown', out) }
  }, [open])
  const top = () => { window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' }); setOpen(false) }
  return (
    <div ref={box} className={`orb ${show || open ? 'is-on' : ''} ${open ? 'is-open' : ''}`}>
      {open && (
        <ul id="orb-menu" className="orb-menu">
          {NAV.map((n) => <li key={n.to} className="orb-item"><TLink to={n.to} className={isActive(pathname, n.to) ? 'is-active' : ''}>{n.label}</TLink></li>)}
          <li className="orb-item"><button onClick={top}><ArrowUp size={14} aria-hidden="true" /> Back to top</button></li>
        </ul>
      )}
      <button className="orb-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="orb-menu" aria-label={open ? 'Close quick menu' : 'Open quick menu'} tabIndex={show || open ? 0 : -1}>
        {/* closed: the molecule; open: it drifts apart into the menu */}
        <Molecule state={open ? 'disassemble' : 'idle'} className="orb-mol" />
      </button>
    </div>
  )
}

/* ---------- the easter egg (five quick clicks on the logo) ---------- */
export function Egg({ onClose }: { onClose: () => void }) {
  const [state, setState] = useState<'transition' | 'idle'>('transition')
  useEffect(() => {
    const a = setTimeout(() => setState('idle'), 700)
    const b = setTimeout(onClose, 5200)
    const key = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', key)
    return () => { clearTimeout(a); clearTimeout(b); window.removeEventListener('keydown', key) }
  }, [onClose])
  return (
    <div className="egg" role="status" aria-live="polite" onClick={onClose}>
      <div className="egg-card">
        <Molecule state={state} className="egg-mol" />
        <p className="egg-line">{COMPANY.closingLine}.</p>
        <p className="egg-sub">{COMPANY.values.join(' · ')}</p>
      </div>
    </div>
  )
}
