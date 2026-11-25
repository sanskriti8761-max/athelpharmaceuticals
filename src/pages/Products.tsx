import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Images, LayoutGrid, Orbit, Search, X, ZoomIn } from 'lucide-react'
import { CATEGORIES, FORM_GROUPS, INGREDIENTS, PRODUCTS, categoryById, searchText, type CategoryId, type Product } from '../data/products'
import { useDocumentTitle } from '../lib/motion'
import { useScrollStory } from '../lib/scroll'
import { TLink, usePageTransition } from '../lib/transition'
import { Btn, Eyebrow } from '../components/ui'
import { Split } from '../components/Split'
import { Molecule } from '../components/Molecule'
import { ProductCard } from '../components/ProductCard'
import { Modal } from '../components/Modal'
import { GraphCanvas, type GLink, type GNode } from '../components/GraphCanvas'

type View = 'catalogue' | 'universe' | 'packaging'
const SORTS = { az: 'Name A–Z', za: 'Name Z–A', category: 'Category', simple: 'Fewest ingredients', complex: 'Most ingredients' } as const
type Sort = keyof typeof SORTS

export default function Products() {
  useDocumentTitle('Products', `Browse all ${PRODUCTS.length} Athel products by name, composition, category and dosage form.`)
  const root = useRef<HTMLDivElement>(null)
  useScrollStory(root)
  const [params, setParams] = useSearchParams()
  const view = (params.get('view') as View) || 'catalogue'
  const q = params.get('q') ?? ''
  const cats = (params.get('cat')?.split(',').filter(Boolean) ?? []) as CategoryId[]
  const form = params.get('form') ?? ''
  const ing = params.get('ing') ?? ''
  const sort = (params.get('sort') as Sort) || 'az'

  // every control writes to the address bar, so a filtered view can be shared or bookmarked
  const set = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(patch)) v ? next.set(k, v) : next.delete(k)
    setParams(next, { replace: true })
  }
  const toggleCat = (id: CategoryId) => set({ cat: (cats.includes(id) ? cats.filter((c) => c !== id) : [...cats, id]).join(',') })
  const clear = () => set({ q: '', cat: '', form: '', ing: '', sort: '' })
  const filtered = !!(q || cats.length || form || ing)

  const results = useMemo(() => {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean)
    const list = PRODUCTS.filter((p) => {
      if (cats.length && !cats.includes(p.category)) return false
      if (form && p.formGroup !== form) return false
      if (ing && !p.ingredients.some((i) => i.name === ing)) return false
      const hay = searchText(p)
      return terms.every((t) => hay.includes(t))
    })
    const by: Record<Sort, (a: Product, b: Product) => number> = {
      az: (a, b) => a.name.localeCompare(b.name),
      za: (a, b) => b.name.localeCompare(a.name),
      category: (a, b) => categoryById(a.category).name.localeCompare(categoryById(b.category).name) || a.name.localeCompare(b.name),
      simple: (a, b) => a.ingredients.length - b.ingredients.length || a.name.localeCompare(b.name),
      complex: (a, b) => b.ingredients.length - a.ingredients.length || a.name.localeCompare(b.name),
    }
    return list.sort(by[sort] ?? by.az)
  }, [q, params.get('cat'), form, ing, sort]) // eslint-disable-line react-hooks/exhaustive-deps

  // suggestions appear only when the typed text really matches a composition or category
  const suggestions = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (s.length < 2) return []
    return INGREDIENTS.filter((i) => i.name.toLowerCase().includes(s) && i.name.toLowerCase() !== s).slice(0, 4)
  }, [q])

  /* ----- compare (up to three) ----- */
  const [compare, setCompare] = useState<string[]>([])
  const [showCompare, setShowCompare] = useState(false)
  const toggleCompare = (p: Product) => setCompare((c) => (c.includes(p.id) ? c.filter((x) => x !== p.id) : c.length < 3 ? [...c, p.id] : c))
  const compared = compare.map((id) => PRODUCTS.find((p) => p.id === id)!).filter(Boolean)

  const groups = sort === 'category' ? CATEGORIES.map((c) => ({ c, items: results.filter((p) => p.category === c.id) })).filter((g) => g.items.length) : null

  return (
    <div ref={root} className="page products">
      <header className="page-head wrap">
        <Molecule state="product-universe" className="page-head-mol" />
        <Eyebrow>Product portfolio</Eyebrow>
        <h1 className="h1"><Split text="The Athel Product Universe" /></h1>
        <p className="lead" data-reveal="up">{PRODUCTS.length} products and {INGREDIENTS.length} compositions. Browse them as a catalogue, travel through them as a connected universe, or look at the packs.</p>
        <div className="seg" role="tablist" aria-label="Choose a view" data-reveal="up">
          {([['catalogue', 'Catalogue View', LayoutGrid], ['universe', 'Universe View', Orbit], ['packaging', 'Packaging', Images]] as const).map(([id, label, Icon]) => (
            <button key={id} role="tab" aria-selected={view === id} className={`seg-btn ${view === id ? 'is-on' : ''}`} onClick={() => set({ view: id === 'catalogue' ? '' : id })}>
              <Icon size={16} aria-hidden="true" /> {label}
            </button>
          ))}
        </div>
      </header>

      {view !== 'packaging' && (
        <div className="wrap toolbar">
          <label className="search">
            <Search size={18} aria-hidden="true" />
            <span className="sr-only">Search products</span>
            <input type="search" value={q} onChange={(e) => set({ q: e.target.value })} placeholder="Search name, salt, category or form…" autoComplete="off" spellCheck={false} />
            {q && <button className="search-x" onClick={() => set({ q: '' })} aria-label="Clear search"><X size={16} /></button>}
          </label>
          {suggestions.length > 0 && (
            <div className="suggest" aria-label="Matching compositions">
              <span>Composition:</span>
              {suggestions.map((s) => <button key={s.id} className="chip chip--sm" onClick={() => set({ q: '', ing: s.name })}>{s.name} <em>{s.products.length}</em></button>)}
            </div>
          )}
          <div className="chips" role="group" aria-label="Filter by category">
            {CATEGORIES.map((c) => (
              <button key={c.id} className={`chip ${cats.includes(c.id) ? 'is-on' : ''}`} aria-pressed={cats.includes(c.id)} onClick={() => toggleCat(c.id)} style={{ '--cat': c.color } as CSSProperties}>
                <span className="chip-dot" aria-hidden="true" />{c.name}
              </button>
            ))}
          </div>
          {view === 'catalogue' && (
            <div className="selects">
              <label className="select"><span>Dosage form</span>
                <select value={form} onChange={(e) => set({ form: e.target.value })}><option value="">All forms</option>{FORM_GROUPS.map((f) => <option key={f}>{f}</option>)}</select>
              </label>
              <label className="select"><span>Composition</span>
                <select value={ing} onChange={(e) => set({ ing: e.target.value })}><option value="">Any ingredient</option>{INGREDIENTS.map((i) => <option key={i.id}>{i.name}</option>)}</select>
              </label>
              <label className="select"><span>Sort by</span>
                <select value={sort} onChange={(e) => set({ sort: e.target.value === 'az' ? '' : e.target.value })}>{Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
              </label>
            </div>
          )}
          <div className="result-bar" aria-live="polite">
            <span><strong>{results.length}</strong> of {PRODUCTS.length} products</span>
            {filtered && <button className="ulink" onClick={clear}>Clear all filters</button>}
          </div>
        </div>
      )}

      {view === 'catalogue' && (
        <section className="wrap" aria-label="Catalogue">
          {results.length === 0 ? (
            <Empty onReset={clear} q={q} />
          ) : groups ? (
            groups.map((g) => (
              <div key={g.c.id} className="pgroup">
                <h2 className="pgroup-h" style={{ '--cat': g.c.color } as CSSProperties}><span className="chip-dot" aria-hidden="true" />{g.c.name} <em>{g.items.length}</em></h2>
                <div className="pgrid">{g.items.map((p, i) => <ProductCard key={p.id} product={p} q={q} index={i} compared={compare.includes(p.id)} onCompare={toggleCompare} compareDisabled={compare.length >= 3} />)}</div>
              </div>
            ))
          ) : (
            <div className="pgrid">{results.map((p, i) => <ProductCard key={p.id} product={p} q={q} index={i} compared={compare.includes(p.id)} onCompare={toggleCompare} compareDisabled={compare.length >= 3} />)}</div>
          )}
        </section>
      )}

      {view === 'universe' && <Universe results={results} cats={cats} filtered={!!(q || form || ing)} onCat={(id) => set({ cat: cats.length === 1 && cats[0] === id ? '' : id })} onReset={clear} />}
      {view === 'packaging' && <Packaging />}

      {compared.length > 0 && view === 'catalogue' && (
        <div className="tray" role="region" aria-label="Compare products">
          <span className="tray-label">Compare</span>
          <ul>{compared.map((p) => <li key={p.id}><button className="chip chip--sm is-on" onClick={() => toggleCompare(p)} aria-label={`Remove ${p.name} from comparison`}>{p.name} <X size={12} /></button></li>)}</ul>
          <Btn onClick={() => setShowCompare(true)} disabled={compared.length < 2} magnetic={false}>{compared.length < 2 ? 'Pick one more' : `Compare ${compared.length}`}</Btn>
          <button className="ulink" onClick={() => setCompare([])}>Clear</button>
        </div>
      )}
      {showCompare && (
        <Modal title="Product comparison" onClose={() => setShowCompare(false)} wide>
          <div className="cmp-scroll">
            <table className="cmp">
              <thead><tr><th scope="col">Field</th>{compared.map((p) => <th key={p.id} scope="col"><TLink to={`/products/${p.slug}`} className="ulink">{p.name}</TLink></th>)}</tr></thead>
              <tbody>
                <tr><th scope="row">Category</th>{compared.map((p) => <td key={p.id}>{categoryById(p.category).name}</td>)}</tr>
                <tr><th scope="row">Dosage form</th>{compared.map((p) => <td key={p.id}>{p.form}</td>)}</tr>
                <tr><th scope="row">Composition &amp; strength</th>{compared.map((p) => <td key={p.id}><ul>{p.ingredients.map((i) => <li key={i.name}>{i.name}{i.note ? ` (${i.note})` : ''}{i.strength ? ` — ${i.strength}` : ''}</li>)}</ul></td>)}</tr>
                <tr><th scope="row">Pack</th>{compared.map((p) => <td key={p.id}>{p.packSize ?? <span className="muted">Not supplied</span>}</td>)}</tr>
              </tbody>
            </table>
          </div>
          <p className="fine">A side-by-side view of portfolio information only. It is not a recommendation of one product over another.</p>
        </Modal>
      )}
    </div>
  )
}

function Empty({ onReset, q }: { onReset: () => void; q: string }) {
  return (
    <div className="empty">
      <Molecule state="disassemble" className="empty-mol" />
      <h2 className="h3">Nothing matches{q ? ` “${q}”` : ' those filters'}.</h2>
      <p>Try a product name such as “Trine”, a salt such as “Folic Acid”, or a form such as “capsule”.</p>
      <Btn onClick={onReset} variant="ghost">Reset search and filters</Btn>
    </div>
  )
}

/* ───────── MODE B · THE PRODUCT UNIVERSE ───────── */
function Universe({ results, cats, filtered, onCat, onReset }: { results: Product[]; cats: CategoryId[]; filtered: boolean; onCat: (id: CategoryId) => void; onReset: () => void }) {
  const { go } = usePageTransition()
  const focusCat = cats.length === 1 ? cats[0] : null
  // a category opens when it is selected, or when a search matches something inside it
  const openCats = useMemo(() => new Set<CategoryId>(filtered ? results.map((p) => p.category) : cats), [results, filtered, cats.join(',')]) // eslint-disable-line react-hooks/exhaustive-deps

  const { nodes, links } = useMemo(() => {
    const nodes: GNode[] = [{ id: 'hub', type: 'hub', label: 'Athel', r: 26, showLabel: true, sub: 'Show all categories' }]
    const links: GLink[] = []
    for (const c of CATEGORIES) {
      const all = PRODUCTS.filter((p) => p.category === c.id)
      nodes.push({ id: 'cat:' + c.id, type: 'category', label: c.name, sub: `${all.length} products`, color: c.color, r: 17 + all.length * 1.6, showLabel: true })
      links.push({ source: 'hub', target: 'cat:' + c.id })
      if (openCats.has(c.id))
        for (const p of results.filter((p) => p.category === c.id)) {
          nodes.push({ id: 'p:' + p.id, type: 'product', label: p.name, sub: p.composition, color: c.color, r: 9, showLabel: true })
          links.push({ source: 'cat:' + c.id, target: 'p:' + p.id })
        }
    }
    return { nodes, links }
  }, [results, openCats])

  const select = (n: GNode) => {
    if (n.type === 'hub') return onReset()
    if (n.type === 'category') return onCat(n.id.slice(4) as CategoryId)
    go(`/products/${n.id.slice(2)}`)
  }
  const cat = focusCat ? categoryById(focusCat) : null
  const list = cat ? results.filter((p) => p.category === cat.id) : filtered ? results : []

  return (
    <section className="wrap universe" style={{ '--cat': cat?.color ?? 'var(--teal)' } as CSSProperties} aria-label="Product Universe">
      <div className="universe-stage">
        <GraphCanvas nodes={nodes} links={links} focusId={focusCat ? 'cat:' + focusCat : null} onSelect={select} ariaLabel="Product Universe: categories and their products" resetKey={focusCat} />
      </div>
      <aside className="side" aria-live="polite">
        {cat || filtered ? (
          <>
            <Eyebrow>{cat ? 'Category in focus' : 'Search results'}</Eyebrow>
            <h2 className="h3">{cat ? cat.name : `${results.length} matching`}</h2>
            {list.length === 0 && <p className="muted">No products match here. <button className="ulink" onClick={onReset}>Reset</button></p>}
            <ul className="side-list">
              {list.map((p) => <li key={p.id}><TLink to={`/products/${p.slug}`} className="side-item"><strong>{p.name}</strong><span>{p.composition}</span></TLink></li>)}
            </ul>
            <button className="ulink" onClick={onReset}>Show the whole universe</button>
          </>
        ) : (
          <>
            <Eyebrow>How to explore</Eyebrow>
            <h2 className="h3">Pick a category to open it.</h2>
            <p className="muted">Each large node is a group of products. Select one and its products unfold around it; select a product to open its page.</p>
            <ul className="side-list side-list--cats">
              {CATEGORIES.map((c) => <li key={c.id}><button className="side-item" onClick={() => onCat(c.id)} style={{ '--cat': c.color } as CSSProperties}><strong><span className="chip-dot" aria-hidden="true" />{c.name}</strong><span>{PRODUCTS.filter((p) => p.category === c.id).length} products</span></button></li>)}
            </ul>
          </>
        )}
        <p className="fine">Groupings are a navigation aid. Positions and lines are a visual arrangement only.</p>
      </aside>
    </section>
  )
}

/* ───────── PACKAGING GALLERY (real pack photographs from the company PDF) ───────── */
function Packaging() {
  const packs = PRODUCTS.filter((p) => p.image)
  const [cat, setCat] = useState<CategoryId | ''>('')
  const shown = packs.filter((p) => !cat || p.category === cat)
  const [open, setOpen] = useState<number | null>(null)
  const [zoomed, setZoomed] = useState(false)
  const cur = open === null ? null : shown[open]
  const step = (d: number) => { setZoomed(false); setOpen((o) => (o === null ? o : (o + d + shown.length) % shown.length)) }
  useEffect(() => {
    if (open === null) return
    const key = (e: KeyboardEvent) => { if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1) }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  })
  const usedCats = CATEGORIES.filter((c) => packs.some((p) => p.category === c.id))
  return (
    <section className="wrap packs" aria-label="Packaging gallery">
      <div className="chips" role="group" aria-label="Filter packs by category">
        <button className={`chip ${!cat ? 'is-on' : ''}`} aria-pressed={!cat} onClick={() => setCat('')}>All packs</button>
        {usedCats.map((c) => <button key={c.id} className={`chip ${cat === c.id ? 'is-on' : ''}`} aria-pressed={cat === c.id} onClick={() => setCat(c.id)} style={{ '--cat': c.color } as CSSProperties}><span className="chip-dot" aria-hidden="true" />{c.name}</button>)}
      </div>
      <div className="packs-grid">
        {shown.map((p, i) => (
          <button key={p.id} className="pack" onClick={() => { setOpen(i); setZoomed(false) }} data-cursor="OPEN" style={{ '--i': i, '--cat': categoryById(p.category).color } as CSSProperties}>
            <span className="pack-img"><img src={p.image} alt={`${p.name} pack photograph`} loading="lazy" /></span>
            <span className="pack-name">{p.name}</span>
            <span className="pack-meta">{p.packSize}</span>
          </button>
        ))}
      </div>
      <p className="fine">Pack photographs are taken from Athel's own product literature and shown unaltered. {PRODUCTS.length - packs.length} products do not yet have a photograph here; add one by setting <code>image</code> in <code>src/data/products.ts</code>.</p>
      {cur && (
        <Modal title={`${cur.name} — pack`} onClose={() => setOpen(null)} wide>
          <div className={`lightbox ${zoomed ? 'is-zoomed' : ''}`}>
            {shown.length > 1 && <button className="icon-btn lightbox-nav" onClick={() => step(-1)} aria-label="Previous pack"><ChevronLeft size={20} /></button>}
            <button className="lightbox-img" onClick={() => setZoomed((z) => !z)} aria-label={zoomed ? 'Zoom out' : 'Zoom in'} data-cursor={zoomed ? 'OUT' : 'ZOOM'}>
              <img src={cur.image} alt={`${cur.name} pack photograph`} />
            </button>
            {shown.length > 1 && <button className="icon-btn lightbox-nav" onClick={() => step(1)} aria-label="Next pack"><ChevronRight size={20} /></button>}
          </div>
          <div className="lightbox-foot">
            <span><ZoomIn size={14} aria-hidden="true" /> Click the image to zoom</span>
            <TLink to={`/products/${cur.slug}`} className="ulink" onClick={() => setOpen(null)}>Open {cur.name}</TLink>
          </div>
        </Modal>
      )}
    </section>
  )
}
