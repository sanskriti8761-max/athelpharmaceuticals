import { Suspense, lazy, useEffect, useRef, useState, type CSSProperties } from 'react'
import { ArrowDown, ArrowRight } from 'lucide-react'
import { CATEGORIES, INGREDIENTS, PRODUCTS, type CategoryId } from '../data/products'
import { COMPANY } from '../data/company'
import { useApp } from '../lib/app'
import { prefersReducedMotion, useDocumentTitle } from '../lib/motion'
import { gsap, ScrollTrigger, useScrollStory } from '../lib/scroll'
import { TLink, usePageTransition } from '../lib/transition'
import { Btn, CapsuleFallback, ErrorBoundary, Eyebrow, Fill, Loader, Portrait } from '../components/ui'
import { Molecule } from '../components/Molecule'
import { Split } from '../components/Split'
import { ProductCard } from '../components/ProductCard'
import { Ecosystem } from '../components/Ecosystem'

const Capsule3D = lazy(() => import('../components/Capsule3D'))

// the six products with pack photographs lead the homepage strip, then two more
const FEATURED = [...PRODUCTS.filter((p) => p.image), ...PRODUCTS.filter((p) => !p.image).slice(0, 2)]

export default function Home() {
  useDocumentTitle('', `${COMPANY.name} is a pharmaceutical trading company. Explore ${PRODUCTS.length} products by name, composition and dosage form.`)
  const root = useRef<HTMLDivElement>(null)
  const { introDone } = useApp()
  const { go } = usePageTransition()
  const [cat, setCat] = useState<CategoryId>('nutrition')
  const [nearCapsule, setNearCapsule] = useState(false)
  const [molHover, setMolHover] = useState(false)
  const capsuleRef = useRef<HTMLDivElement>(null)
  useScrollStory(root)

  // Chapter 1: the hero text arrives once the opening has handed over the molecule
  useEffect(() => {
    if (!introDone || prefersReducedMotion() || !root.current) return
    const ctx = gsap.context(() => {
      gsap.from('.hero .split-i', { yPercent: 115, duration: 1.1, ease: 'power4.out', stagger: 0.05 })
      gsap.from('.hero-fade', { y: 24, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.09, delay: 0.35 })
    }, root)
    return () => ctx.revert()
  }, [introDone])

  // Chapter 3: on desktop the portfolio pins and travels sideways as you scroll
  useEffect(() => {
    if (prefersReducedMotion() || !root.current) return
    const mm = gsap.matchMedia()
    mm.add('(min-width: 960px)', () => {
      const track = root.current!.querySelector<HTMLElement>('.strip-track')
      const sec = root.current!.querySelector<HTMLElement>('.strip')
      if (!track || !sec) return
      const dist = () => Math.max(0, track.scrollWidth - sec.clientWidth + 80)
      gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: sec, start: 'top top+=84', end: () => '+=' + dist(), pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1 } })
    })
    return () => mm.revert()
  }, [])

  // load the 3D capsule only when the visitor scrolls near it
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNearCapsule(true); io.disconnect() } }, { rootMargin: '500px' })
    if (capsuleRef.current) io.observe(capsuleRef.current)
    return () => io.disconnect()
  }, [])
  useEffect(() => { const t = setTimeout(() => ScrollTrigger.refresh(), 600); return () => clearTimeout(t) }, [nearCapsule])

  const active = CATEGORIES.find((c) => c.id === cat)!
  const inCat = PRODUCTS.filter((p) => p.category === cat)

  return (
    <div ref={root} className="home">
      {/* ───────── Chapter 1 · Identity ───────── */}
      <section className="hero">
        <div className="hero-light" aria-hidden="true" />
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <p className="eyebrow hero-fade"><span className="eyebrow-dot" aria-hidden="true" />{COMPANY.name} · {COMPANY.business}</p>
            <h1 className="h-display"><Split text="A noble effort towards good health." reveal={false} /></h1>
            <p className="lead hero-fade">
              {COMPANY.name} is a pharmaceutical trading company. Explore a portfolio of {PRODUCTS.length} products and {INGREDIENTS.length} compositions,
              presented plainly for healthcare professionals and business partners.
            </p>
            <div className="hero-cta hero-fade">
              <Btn to="/products">Explore our portfolio <ArrowRight size={17} aria-hidden="true" /></Btn>
              <Btn to="/about" variant="ghost">Discover Athel</Btn>
            </div>
          </div>
          <div className="hero-visual">
            <span className="hero-ring hero-ring--1" aria-hidden="true" data-parallax="0.12" />
            <span className="hero-ring hero-ring--2" aria-hidden="true" data-parallax="0.3" />
            <span className="hero-mol-wrap" onPointerEnter={() => setMolHover(true)} onPointerLeave={() => setMolHover(false)}>
              <Molecule id="hero-molecule" state={molHover ? 'hover' : 'interactive'} className="hero-mol" onActivate={() => go('/products?view=universe')} label="Athel molecule — open the Product Universe" cursor="EXPLORE" />
            </span>
            <p className="hero-hint hero-fade">Move, hover, click the molecule</p>
          </div>
        </div>
        <a className="hero-scroll hero-fade" href="#identity" onClick={(e) => { e.preventDefault(); document.getElementById('identity')?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' }) }}>
          <ArrowDown size={15} aria-hidden="true" /> Scroll
        </a>
      </section>

      {/* ───────── Chapter 2 · Purpose ───────── */}
      <section id="identity" className="section identity">
        <div className="wrap identity-grid">
          <div>
            <Eyebrow>Who we are</Eyebrow>
            <Split as="h2" className="h1" text="A trading house built around three words." />
          </div>
          <div className="identity-body">
            <p className="lead" data-reveal="up">
              Athel brings a focused range of medicines and nutritional products to the doctors, hospitals and pharmacies who need them.
              We trade; we do not manufacture. Three words from our own literature say what we stand for.
            </p>
            <ul className="values" data-reveal="stagger">
              {COMPANY.values.map((v, i) => (
                <li key={v} className="value"><span className="value-n">0{i + 1}</span><span className="value-t">{v}</span></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ───────── Chapter 3 · Portfolio (pinned horizontal strip on desktop) ───────── */}
      <section className="strip" aria-labelledby="strip-h">
        <div className="wrap strip-head">
          <div>
            <Eyebrow>Our portfolio</Eyebrow>
            <Split as="h2" className="h2" text={`${PRODUCTS.length} products, shown as they are.`} />
          </div>
          <Btn to="/products" variant="ghost">Full catalogue <ArrowRight size={16} aria-hidden="true" /></Btn>
        </div>
        <span id="strip-h" className="sr-only">Featured products</span>
        <div className="strip-view">
          <div className="strip-track">
            {FEATURED.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            <TLink to="/products" className="strip-more" data-cursor="OPEN">
              <span className="strip-more-n">{PRODUCTS.length}</span>
              <span>See every product <ArrowRight size={16} aria-hidden="true" /></span>
            </TLink>
          </div>
        </div>
      </section>

      {/* ───────── The molecule becomes a network of categories ───────── */}
      <section className="section constel" style={{ '--cat': active.color } as CSSProperties}>
        <div className="wrap constel-grid">
          <div className="constel-map" data-reveal="up">
            <svg className="constel-lines" viewBox="-200 -200 400 400" aria-hidden="true">
              {CATEGORIES.map((c, i) => {
                const a = (i / CATEGORIES.length) * Math.PI * 2 - Math.PI / 2
                return <line key={c.id} x1="0" y1="0" x2={Math.cos(a) * 160} y2={Math.sin(a) * 160} className={c.id === cat ? 'is-on' : ''} data-draw />
              })}
              <circle r="160" className="constel-orbit" />
            </svg>
            <Molecule state="product-universe" className="constel-mol" />
            {CATEGORIES.map((c, i) => {
              const a = (i / CATEGORIES.length) * Math.PI * 2 - Math.PI / 2
              return (
                <button key={c.id} className={`constel-node ${c.id === cat ? 'is-on' : ''}`} aria-pressed={c.id === cat} onClick={() => setCat(c.id)} data-cursor="OPEN"
                  style={{ '--x': Math.cos(a).toFixed(4), '--y': Math.sin(a).toFixed(4), '--c': c.color } as CSSProperties}>
                  <span className="constel-dot" aria-hidden="true" />
                  <span className="constel-name">{c.name}</span>
                </button>
              )
            })}
          </div>
          <div className="constel-panel" aria-live="polite">
            <Eyebrow>One molecule, seven groups</Eyebrow>
            <h2 className="h2" key={cat}>{active.name}</h2>
            <p className="constel-count">{inCat.length} {inCat.length === 1 ? 'product' : 'products'}</p>
            <ul className="constel-list" key={cat + '-l'}>
              {inCat.map((p) => (
                <li key={p.id}><TLink to={`/products/${p.slug}`} className="ulink">{p.name}</TLink><span>{p.form}</span></li>
              ))}
            </ul>
            <div className="hero-cta">
              <Btn to={`/products?view=universe&cat=${cat}`}>Open in the Universe</Btn>
              <Btn to="/explorer" variant="ghost">Explore by composition</Btn>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Chapter 4 · Network ───────── */}
      <section className="section section--tint">
        <div className="wrap">
          <Eyebrow>How it connects</Eyebrow>
          <Split as="h2" className="h1 narrow" text="From partner to prescription, one clear line." />
          <div data-reveal="up"><Ecosystem /></div>
        </div>
      </section>

      {/* ───────── 3D capsule ───────── */}
      <section className="section capsule-sec">
        <div className="wrap capsule-grid">
          <div>
            <Eyebrow>A closer look</Eyebrow>
            <Split as="h2" className="h2" text="Open it. Turn it. Put it back together." />
            <p className="lead" data-reveal="up">A small object in Athel's own colours. Drag to turn it, click to open it.</p>
            <p className="fine" data-reveal="up">An artistic illustration. It does not depict any Athel product or how a medicine works.</p>
          </div>
          <div ref={capsuleRef} className="capsule-slot">
            <ErrorBoundary fallback={<CapsuleFallback />}>
              {nearCapsule ? <Suspense fallback={<Loader label="Preparing 3D" />}><Capsule3D /></Suspense> : <CapsuleFallback />}
            </ErrorBoundary>
          </div>
        </div>
      </section>

      {/* ───────── Chapter 5 · People ───────── */}
      <section className="section story">
        <div className="wrap story-grid">
          <div className="story-art" data-reveal="mask">
            <Molecule state="legacy" className="story-mol" />
            <span className="story-word" aria-hidden="true" data-parallax="0.25">Athel</span>
          </div>
          <div>
            <Eyebrow>Our story</Eyebrow>
            <Split as="h2" className="h2" text="A business with a family behind it." />
            <p className="lead" data-reveal="up"><Fill value={COMPANY.story} where="company.ts → story">A few sentences on how Athel began and what it has become will appear here.</Fill></p>
            <div data-reveal="up"><Btn to="/about" variant="ghost">Read about Athel <ArrowRight size={16} aria-hidden="true" /></Btn></div>
          </div>
        </div>
      </section>

      {/* ───────── Chapter 6 · Legacy ───────── */}
      <section className="section section--tint legacy-prev">
        <div className="wrap legacy-prev-grid">
          <div>
            <Eyebrow>Our people &amp; legacy</Eyebrow>
            <Split as="h2" className="h1" text="The people who built it, and the one we remember." />
            <div data-reveal="up"><Btn to="/legacy">Meet our people <ArrowRight size={16} aria-hidden="true" /></Btn></div>
          </div>
          <div className="legacy-prev-photos" data-reveal="stagger">
            <Portrait src={COMPANY.owner.photo} name={COMPANY.owner.name || 'the owner'} file="company.ts → owner.photo" />
            <Portrait src={COMPANY.uncle.photo} name={COMPANY.uncle.name || 'our late uncle'} file="company.ts → uncle.photo" />
          </div>
        </div>
      </section>

      {/* ───────── Chapter 7 · Connection ───────── */}
      <section className="section closing">
        <div className="wrap closing-in">
          <Molecule state="contact" className="closing-mol" />
          <Split as="h2" className="h-display" text="Let's talk." />
          <p className="lead" data-reveal="up">Distribution, partnership or a question about the portfolio — we would be glad to hear from you.</p>
          <div className="hero-cta" data-reveal="up">
            <Btn to="/contact">Connect with us <ArrowRight size={17} aria-hidden="true" /></Btn>
            <Btn to="/products" variant="ghost">Browse products</Btn>
          </div>
        </div>
      </section>
    </div>
  )
}
