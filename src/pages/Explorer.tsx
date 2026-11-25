import { useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowLeft, Network, RotateCcw, Search, Waypoints, X } from 'lucide-react'
import { CATEGORIES, FORM_GROUPS, INGREDIENTS, PRODUCTS, categoryById, ingredientId } from '../data/products'
import { useDocumentTitle } from '../lib/motion'
import { useScrollStory } from '../lib/scroll'
import { TLink, usePageTransition } from '../lib/transition'
import { Eyebrow } from '../components/ui'
import { Split } from '../components/Split'
import { Molecule } from '../components/Molecule'
import { GraphCanvas, type GLink, type GNode } from '../components/GraphCanvas'

/*
 * COMPOSITION EXPLORER
 * The whole network is built automatically from products.ts:
 *   every ingredient is a node, every product is a node, and a line joins a
 *   product to each ingredient printed in its composition.
 * It shows catalogue relationships only — not chemistry, biology or clinical use.
 */
const MOST_CONNECTED = [...INGREDIENTS].sort((a, b) => b.products.length - a.products.length)[0]

function buildGraph(showForms: boolean, showCats: boolean) {
  const nodes: GNode[] = []
  const links: GLink[] = []
  for (const i of INGREDIENTS) {
    const shared = i.products.length > 1
    nodes.push({ id: i.id, type: 'ingredient', label: i.name, sub: `In ${i.products.length} ${i.products.length === 1 ? 'product' : 'products'}`, r: 7 + i.products.length * 3.5, color: shared ? '#e5a323' : '#a9c532', showLabel: shared })
  }
  for (const p of PRODUCTS) {
    nodes.push({ id: 'p:' + p.id, type: 'product', label: p.name, sub: p.composition, r: 10, color: categoryById(p.category).color, showLabel: true })
    for (const i of p.ingredients) links.push({ source: 'p:' + p.id, target: ingredientId(i.name) })
    if (showForms) links.push({ source: 'p:' + p.id, target: 'form:' + p.formGroup })
    if (showCats) links.push({ source: 'p:' + p.id, target: 'cat:' + p.category })
  }
  if (showForms) for (const f of FORM_GROUPS) nodes.push({ id: 'form:' + f, type: 'form', label: f, sub: 'Dosage form', r: 13, showLabel: true })
  if (showCats) for (const c of CATEGORIES) nodes.push({ id: 'cat:' + c.id, type: 'category', label: c.name, sub: 'Category', r: 15, color: c.color, showLabel: true })
  return { nodes, links }
}

const adjacency = (links: GLink[]) => {
  const adj = new Map<string, Set<string>>()
  const add = (a: string, b: string) => (adj.get(a) ?? adj.set(a, new Set()).get(a)!).add(b)
  for (const l of links) { add(l.source, l.target); add(l.target, l.source) }
  return adj
}

/** mind-map layout: focus in the centre, its neighbours on a ring, theirs on an outer ring */
function radial(focus: string, adj: Map<string, Set<string>>) {
  const t: Record<string, { x: number; y: number }> = { [focus]: { x: 0, y: 0 } }
  const ring1 = [...(adj.get(focus) ?? [])]
  const kids = ring1.map((id) => [...(adj.get(id) ?? [])].filter((k) => k !== focus && !ring1.includes(k)))
  const sector = (Math.PI * 2) / Math.max(ring1.length, 1)
  const spread = Math.min(sector * 0.82, 1.9)
  const maxKids = Math.max(1, ...kids.map((k) => k.length))
  const R1 = Math.max(170, ring1.length * 30)
  const R2 = Math.max(R1 + 170, (maxKids * 34) / spread)
  const seen = new Set(Object.keys(t))
  ring1.forEach((id, i) => {
    const a = -Math.PI / 2 + i * sector + (ring1.length === 2 ? Math.PI / 2 : 0)
    t[id] = { x: Math.cos(a) * R1, y: Math.sin(a) * R1 }
    seen.add(id)
    const mine = kids[i].filter((k) => !seen.has(k))
    mine.forEach((k, j) => {
      const b = a + (mine.length === 1 ? 0 : (j / (mine.length - 1) - 0.5) * spread)
      t[k] = { x: Math.cos(b) * R2, y: Math.sin(b) * R2 }
      seen.add(k)
    })
  })
  return t
}

export default function Explorer() {
  useDocumentTitle('Composition Explorer', 'Explore the Athel portfolio through its compositions: every salt and ingredient, and the products that contain it.')
  const root = useRef<HTMLDivElement>(null)
  useScrollStory(root)
  const { go } = usePageTransition()
  const [params, setParams] = useSearchParams()
  const mode = params.get('mode') === 'mindmap' ? 'mindmap' : 'network'
  const rawFocus = params.get('focus')
  const [q, setQ] = useState('')
  const [showForms, setShowForms] = useState(false)
  const [showCats, setShowCats] = useState(false)
  const [collapse, setCollapse] = useState(false)
  const [resetKey, setResetKey] = useState(0)

  const set = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(patch)) v ? next.set(k, v) : next.delete(k)
    setParams(next, { replace: true })
  }

  const full = useMemo(() => buildGraph(showForms, showCats), [showForms, showCats])
  const adj = useMemo(() => adjacency(full.links), [full])
  const valid = (id: string | null) => !!id && full.nodes.some((n) => n.id === id)
  // the mind map always needs a centre; default to the most widely used ingredient
  const focus = valid(rawFocus) ? rawFocus! : mode === 'mindmap' ? MOST_CONNECTED.id : null

  const { nodes, links, targets } = useMemo(() => {
    if (!focus || (mode === 'network' && !collapse)) return { ...full, targets: null }
    // keep the focus, its neighbours, and their neighbours
    const keep = new Set<string>([focus])
    for (const a of adj.get(focus) ?? []) { keep.add(a); for (const b of adj.get(a) ?? []) keep.add(b) }
    const nodes = full.nodes.filter((n) => keep.has(n.id)).map((n) => ({ ...n, showLabel: true }))
    const links = full.links.filter((l) => keep.has(l.source) && keep.has(l.target) && (mode === 'network' || l.source === focus || l.target === focus || adj.get(focus)!.has(l.source) || adj.get(focus)!.has(l.target)))
    return { nodes, links, targets: mode === 'mindmap' ? radial(focus, adjacency(links)) : null }
  }, [full, adj, focus, mode, collapse])

  const s = q.trim().toLowerCase()
  const matches = useMemo(() => (s ? full.nodes.filter((n) => n.label.toLowerCase().includes(s) || (n.type === 'product' && (n.sub ?? '').toLowerCase().includes(s))) : []), [s, full])
  const matchIds = useMemo(() => (s ? new Set(matches.map((m) => m.id)) : null), [s, matches])

  const select = (n: GNode) => {
    if (n.type === 'product' && (focus === n.id || mode === 'network')) return go(`/products/${n.id.slice(2)}`)
    setQ('')
    set({ focus: n.id })
  }
  const reset = () => { setQ(''); setCollapse(false); set({ focus: '', mode: '' }); setResetKey((k) => k + 1) }

  const fNode = focus ? full.nodes.find((n) => n.id === focus) : null
  const fIng = focus ? INGREDIENTS.find((i) => i.id === focus) : null
  const fProd = focus?.startsWith('p:') ? PRODUCTS.find((p) => 'p:' + p.id === focus) : null
  const fOther = fNode && !fIng && !fProd ? PRODUCTS.filter((p) => adj.get(focus!)?.has('p:' + p.id)) : null
  const alsoWith = fIng ? [...new Set(fIng.products.flatMap((p) => p.ingredients.map((i) => i.name)))].filter((nm) => nm !== fIng.name).sort() : []

  return (
    <div ref={root} className="page explorer">
      <header className="page-head wrap">
        <Molecule state="composition-network" className="page-head-mol" />
        <Eyebrow>Molecular discovery</Eyebrow>
        <h1 className="h1"><Split text="Composition Explorer" /></h1>
        <p className="lead" data-reveal="up">{INGREDIENTS.length} salts and ingredients, {PRODUCTS.length} products, and every line between them. Select a composition to see where it appears.</p>
      </header>

      <div className="wrap explorer-grid">
        <div className="explorer-stage">
          <div className="explorer-bar">
            <div className="seg" role="tablist" aria-label="Layout">
              <button role="tab" aria-selected={mode === 'network'} className={`seg-btn ${mode === 'network' ? 'is-on' : ''}`} onClick={() => set({ mode: '' })}><Network size={16} aria-hidden="true" /> Network</button>
              <button role="tab" aria-selected={mode === 'mindmap'} className={`seg-btn ${mode === 'mindmap' ? 'is-on' : ''}`} onClick={() => set({ mode: 'mindmap', focus: focus ?? MOST_CONNECTED.id })}><Waypoints size={16} aria-hidden="true" /> Mind map</button>
            </div>
            <button className="chip chip--sm" onClick={reset}><RotateCcw size={13} aria-hidden="true" /> Reset</button>
          </div>
          <GraphCanvas nodes={nodes} links={links} focusId={focus} matchIds={matchIds} targets={targets} onSelect={select}
            ariaLabel="Composition network: ingredients and the products that contain them" resetKey={`${resetKey}-${mode}-${mode === 'mindmap' ? focus : ''}`} />
          <ul className="legend" aria-label="Legend">
            <li><span className="lg lg--ing2" /> Ingredient in several products</li>
            <li><span className="lg lg--ing" /> Ingredient in one product</li>
            <li><span className="lg lg--prod" /> Product</li>
            {showForms && <li><span className="lg lg--form" /> Dosage form</li>}
            {showCats && <li><span className="lg lg--cat" /> Category</li>}
          </ul>
        </div>

        <aside className="side">
          <label className="search">
            <Search size={18} aria-hidden="true" />
            <span className="sr-only">Search the network</span>
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a salt or product…" autoComplete="off" spellCheck={false}
              onKeyDown={(e) => { if (e.key === 'Enter' && matches[0]) select(matches[0].type === 'product' ? { ...matches[0] } : matches[0]) }} />
            {q && <button className="search-x" onClick={() => setQ('')} aria-label="Clear search"><X size={16} /></button>}
          </label>

          {s ? (
            <div aria-live="polite">
              <p className="side-count">{matches.length} {matches.length === 1 ? 'match' : 'matches'}</p>
              {matches.length === 0 && <p className="muted">No salt or product matches “{q}”. Try “zinc”, “folic” or “Trine”.</p>}
              <ul className="side-list">
                {matches.slice(0, 14).map((m) => (
                  <li key={m.id}><button className="side-item" onClick={() => { setQ(''); set({ focus: m.id }) }}><strong>{m.label}</strong><span>{m.type === 'product' ? 'Product' : m.sub}</span></button></li>
                ))}
              </ul>
            </div>
          ) : fNode ? (
            <div aria-live="polite">
              <Eyebrow>{fIng ? 'Composition in focus' : fProd ? 'Product in focus' : 'In focus'}</Eyebrow>
              <h2 className="h3">{fNode.label}</h2>
              {fIng && (
                <>
                  <p className="side-count">Found in {fIng.products.length} {fIng.products.length === 1 ? 'product' : 'products'}</p>
                  <ul className="side-list">
                    {fIng.products.map((p) => {
                      const ing = p.ingredients.find((i) => i.name === fIng.name)!
                      return <li key={p.id}><TLink to={`/products/${p.slug}`} className="side-item"><strong>{p.name}</strong><span>{ing.strength ?? 'Strength not printed'} · {p.form}</span></TLink></li>
                    })}
                  </ul>
                  {alsoWith.length > 0 && (
                    <>
                      <p className="side-count">Appears alongside</p>
                      <div className="chips chips--wrap">{alsoWith.map((nm) => <button key={nm} className="chip chip--sm" onClick={() => set({ focus: ingredientId(nm) })}>{nm}</button>)}</div>
                    </>
                  )}
                </>
              )}
              {fProd && (
                <>
                  <p className="side-count">{fProd.form} · {fProd.ingredients.length} listed {fProd.ingredients.length === 1 ? 'ingredient' : 'ingredients'}</p>
                  <div className="chips chips--wrap">{fProd.ingredients.map((i) => <button key={i.name} className="chip chip--sm" onClick={() => set({ focus: ingredientId(i.name) })}>{i.name}{i.strength ? ` · ${i.strength}` : ''}</button>)}</div>
                  <p><TLink to={`/products/${fProd.slug}`} className="ulink">Open the {fProd.name} page</TLink></p>
                </>
              )}
              {fOther && <ul className="side-list">{fOther.map((p) => <li key={p.id}><TLink to={`/products/${p.slug}`} className="side-item"><strong>{p.name}</strong><span>{p.composition}</span></TLink></li>)}</ul>}
              {mode === 'network' && <label className="check"><input type="checkbox" checked={collapse} onChange={(e) => setCollapse(e.target.checked)} /> Hide unrelated nodes</label>}
            </div>
          ) : (
            <div>
              <Eyebrow>Start here</Eyebrow>
              <h2 className="h3">Shared compositions</h2>
              <p className="muted">These appear in more than one Athel product. Select one to light up its connections.</p>
              <div className="chips chips--wrap">
                {INGREDIENTS.filter((i) => i.products.length > 1).sort((a, b) => b.products.length - a.products.length).map((i) => (
                  <button key={i.id} className="chip chip--sm" onClick={() => set({ focus: i.id })}>{i.name} <em>{i.products.length}</em></button>
                ))}
              </div>
            </div>
          )}

          <fieldset className="toggles">
            <legend>Also show</legend>
            <label className="check"><input type="checkbox" checked={showForms} onChange={(e) => setShowForms(e.target.checked)} /> Dosage-form nodes</label>
            <label className="check"><input type="checkbox" checked={showCats} onChange={(e) => setShowCats(e.target.checked)} /> Category nodes</label>
          </fieldset>
          <p className="fine">This map shows which products in the Athel catalogue list the same ingredient. It is not a molecular structure, a biological pathway, a mechanism of action or a clinical relationship.</p>
          <TLink to="/products" className="ulink"><ArrowLeft size={14} aria-hidden="true" /> Return to catalogue</TLink>
        </aside>
      </div>
    </div>
  )
}
