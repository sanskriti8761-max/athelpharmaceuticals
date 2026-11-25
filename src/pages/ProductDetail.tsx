import { useRef, useState, type CSSProperties } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Share2, ZoomIn } from 'lucide-react'
import { INGREDIENTS, categoryById, ingredientId, productBySlug, relatedProducts } from '../data/products'
import { useDocumentTitle } from '../lib/motion'
import { useScrollStory } from '../lib/scroll'
import { TLink } from '../lib/transition'
import { Btn, Eyebrow } from '../components/ui'
import { Split } from '../components/Split'
import { Molecule } from '../components/Molecule'
import { ProductCard } from '../components/ProductCard'
import { Modal } from '../components/Modal'

/* One template renders every product from the data in products.ts. */
export default function ProductDetail() {
  const { slug } = useParams()
  const p = productBySlug(slug)
  const root = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(false)
  useDocumentTitle(p ? p.name : 'Product not found', p ? `${p.name} — ${p.composition}. ${p.form}.` : undefined)
  useScrollStory(root, [slug])

  if (!p)
    return (
      <div className="page wrap empty empty--page">
        <Molecule state="disassemble" className="empty-mol" />
        <Eyebrow>Product not found</Eyebrow>
        <h1 className="h2">We don't have a product at this address.</h1>
        <p>It may have been renamed or removed from the portfolio.</p>
        <div className="hero-cta"><Btn to="/products">Back to the catalogue</Btn><Btn to="/explorer" variant="ghost">Search by composition</Btn></div>
      </div>
    )

  const cat = categoryById(p.category)
  const related = relatedProducts(p)
  const n = p.ingredients.length
  const sharedWith = (name: string) => INGREDIENTS.find((i) => i.name === name)!.products.filter((x) => x.id !== p.id)

  return (
    <div ref={root} key={p.id} className={`page pd motif--${cat.motif}`} style={{ '--cat': cat.color } as CSSProperties}>
      <div className="pd-ambient" aria-hidden="true" />
      <div className="wrap">
        <nav className="crumbs" aria-label="Breadcrumb">
          <TLink to="/products" className="ulink"><ArrowLeft size={15} aria-hidden="true" /> Back to catalogue</TLink>
          <span aria-hidden="true">/</span>
          <TLink to={`/products?cat=${cat.id}`} className="ulink">{cat.name}</TLink>
        </nav>

        <header className="pd-head">
          <div>
            <p className="pd-cat" data-reveal="up"><span className="chip-dot" aria-hidden="true" />{cat.name}</p>
            <h1 className="h-display pd-name"><Split text={p.name} by="letters" /></h1>
            <p className="pd-form" data-reveal="up">{p.form}{p.packSize ? ` · ${p.packSize}` : ''}</p>
            <p className="lead pd-comp" data-reveal="up">{p.composition}</p>
            <div className="hero-cta" data-reveal="up">
              <Btn to={`/contact?type=portfolio&product=${encodeURIComponent(p.name)}`}>Enquire about {p.name} <ArrowRight size={16} aria-hidden="true" /></Btn>
              <Btn to={`/explorer?focus=${encodeURIComponent('p:' + p.id)}&mode=mindmap`} variant="ghost"><Share2 size={15} aria-hidden="true" /> See its connections</Btn>
            </div>
          </div>

          <div className="pd-visual">
            {p.image ? (
              <button className="pd-pack" onClick={() => setZoom(true)} data-reveal="mask" data-cursor="ZOOM" aria-label={`View ${p.name} pack photograph larger`}>
                <img src={p.image} alt={`${p.name} pack photograph`} />
                <span className="pd-pack-zoom"><ZoomIn size={14} aria-hidden="true" /> Enlarge</span>
              </button>
            ) : (
              <div className="pd-type" data-reveal="mask" aria-hidden="true"><span>{p.name}</span><small>Pack photograph not yet supplied</small></div>
            )}
          </div>
        </header>

        <section className="pd-grid" aria-labelledby="comp-h">
          <div className="pd-orbit" data-reveal="up">
            {/* an abstract map of this product's ingredients — not a molecular structure */}
            <svg viewBox="-170 -170 340 340" role="img" aria-label={`${p.name} contains ${n} listed ${n === 1 ? 'ingredient' : 'ingredients'}`}>
              <circle r="120" className="orbit-ring" />
              {p.ingredients.map((_, i) => {
                const a = (i / n) * Math.PI * 2 - Math.PI / 2
                const x = Math.cos(a) * 120, y = Math.sin(a) * 120
                return (
                  <g key={i} className="orbit-item" style={{ '--i': i } as CSSProperties}>
                    <line x1="0" y1="0" x2={x} y2={y} pathLength={1} />
                    <circle cx={x} cy={y} r="20" />
                    <text x={x} y={y + 5} textAnchor="middle">{i + 1}</text>
                  </g>
                )
              })}
              <circle r="46" className="orbit-core" />
              <text className="orbit-core-t" textAnchor="middle" y="6">{p.name.length > 9 ? p.name.slice(0, 8) + '…' : p.name}</text>
            </svg>
            <p className="fine">Artistic arrangement of the listed ingredients. Not a molecular structure or mechanism.</p>
          </div>

          <div>
            <Eyebrow>Composition</Eyebrow>
            <h2 id="comp-h" className="h2">What it contains</h2>
            <ol className="comp-list" data-reveal="stagger">
              {p.ingredients.map((i, k) => {
                const others = sharedWith(i.name)
                return (
                  <li key={i.name} className="comp-row">
                    <span className="comp-n">{k + 1}</span>
                    <span className="comp-main">
                      <strong>{i.name}{i.note ? <em> ({i.note})</em> : null}</strong>
                      {others.length > 0 && <span className="comp-also">Also in {others.map((o, j) => <span key={o.id}>{j > 0 && ', '}<TLink className="ulink" to={`/products/${o.slug}`}>{o.name}</TLink></span>)}</span>}
                    </span>
                    <span className="comp-str">{i.strength ?? <span className="muted">Strength not printed</span>}</span>
                    <TLink className="comp-go" to={`/explorer?focus=${encodeURIComponent(ingredientId(i.name))}`} aria-label={`Explore ${i.name} in the Composition Explorer`} data-cursor="OPEN"><Share2 size={15} aria-hidden="true" /></TLink>
                  </li>
                )
              })}
            </ol>
            <dl className="facts" data-reveal="up">
              <div><dt>Dosage form</dt><dd>{p.form}</dd></div>
              <div><dt>Category</dt><dd>{cat.name}</dd></div>
              <div><dt>Pack</dt><dd>{p.packSize ?? <span className="muted">Not supplied</span>}</dd></div>
              <div><dt>Source</dt><dd>Athel visual aid, page {p.sourcePage}</dd></div>
            </dl>
            <p className="fine">Name, composition and strengths are reproduced as printed in Athel's product literature. This page is portfolio information for healthcare professionals and trade partners, not medical advice.</p>
          </div>
        </section>

        {related.length > 0 && (
          <section className="pd-related" aria-labelledby="rel-h">
            <Eyebrow>Related products</Eyebrow>
            <h2 id="rel-h" className="h2">Connected in the portfolio</h2>
            <div className="pgrid" data-reveal="stagger">{related.map((r, i) => <ProductCard key={r.id} product={r} index={i} />)}</div>
          </section>
        )}
      </div>
      {zoom && p.image && (
        <Modal title={`${p.name} — pack`} onClose={() => setZoom(false)} wide>
          <div className="lightbox"><div className="lightbox-img"><img src={p.image} alt={`${p.name} pack photograph`} /></div></div>
        </Modal>
      )}
    </div>
  )
}
