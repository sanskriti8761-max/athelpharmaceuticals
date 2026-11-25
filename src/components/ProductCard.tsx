import { type CSSProperties, type ReactNode } from 'react'
import { ArrowUpRight, Check, Plus } from 'lucide-react'
import { categoryById, type Product } from '../data/products'
import { TLink } from '../lib/transition'

/** wraps every occurrence of the search text in <mark> */
export function Highlight({ text, q }: { text: string; q?: string }): ReactNode {
  const s = q?.trim()
  if (!s) return text
  const parts = text.split(new RegExp(`(${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig'))
  return parts.map((p, i) => (i % 2 ? <mark key={i}>{p}</mark> : p))
}

interface Props { product: Product; q?: string; index?: number; compared?: boolean; onCompare?: (p: Product) => void; compareDisabled?: boolean }

export function ProductCard({ product: p, q, index = 0, compared, onCompare, compareDisabled }: Props) {
  const cat = categoryById(p.category)
  const n = p.ingredients.length
  return (
    <article className={`pcard motif--${cat.motif} ${compared ? 'is-compared' : ''}`} style={{ '--cat': cat.color, '--i': index } as CSSProperties}>
      <TLink to={`/products/${p.slug}`} className="pcard-link" data-cursor="EXPLORE" aria-label={`${p.name} — ${p.composition}`}>
        <span className="pcard-sweep" aria-hidden="true" />
        <span className="pcard-top">
          <span className="pcard-cat"><Highlight text={cat.name} q={q} /></span>
          {/* a small abstract mark: one dot per ingredient. Decorative only. */}
          <svg className="pcard-mol" viewBox="-30 -30 60 60" aria-hidden="true">
            {Array.from({ length: n }, (_, i) => {
              const a = (i / n) * Math.PI * 2 - Math.PI / 2
              return <g key={i}><line x1="0" y1="0" x2={Math.cos(a) * 20} y2={Math.sin(a) * 20} /><circle cx={Math.cos(a) * 20} cy={Math.sin(a) * 20} r="4" /></g>
            })}
            <circle r="8" className="pcard-mol-core" />
          </svg>
        </span>
        {p.image && <span className="pcard-img"><img src={p.image} alt={`${p.name} pack`} loading="lazy" /></span>}
        <span className="pcard-name"><Highlight text={p.name} q={q} /></span>
        <span className="pcard-form"><Highlight text={p.form} q={q} /></span>
        <span className="pcard-comp"><Highlight text={p.composition} q={q} /></span>
        <span className="pcard-cta">View product <ArrowUpRight size={15} aria-hidden="true" /></span>
      </TLink>
      {onCompare && (
        <button className="pcard-compare" onClick={() => onCompare(p)} aria-pressed={!!compared} disabled={!compared && compareDisabled} title={!compared && compareDisabled ? 'You can compare up to three products' : undefined}>
          {compared ? <Check size={14} aria-hidden="true" /> : <Plus size={14} aria-hidden="true" />} {compared ? 'Comparing' : 'Compare'}
        </button>
      )}
    </article>
  )
}
