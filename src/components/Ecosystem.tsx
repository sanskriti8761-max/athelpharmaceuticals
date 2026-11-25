import { useState } from 'react'
import { Building2, Handshake, Package, Stethoscope, Truck } from 'lucide-react'
import { PRODUCTS, CATEGORIES } from '../data/products'
import { COMPANY } from '../data/company'

/*
 * HOW A TRADING BUSINESS CONNECTS — an interactive outline.
 * The stages follow from Athel being a pharmaceutical trading company. The
 * wording is deliberately general: no reach, scale, partner-count or quality
 * claims. Edit the text below to describe the real arrangement.
 */
const STAGES = [
  { icon: Handshake, title: 'Business partners', text: 'The suppliers and partners whose products make up the range.', draft: true },
  { icon: Building2, title: COMPANY.name, text: 'A pharmaceutical trading company — the link between the range and the people who need it.', draft: false },
  { icon: Package, title: 'Product portfolio', text: `${PRODUCTS.length} products across ${CATEGORIES.length} groups: tablets, capsules, a syrup and a protein powder.`, draft: false },
  { icon: Truck, title: 'Distribution network', text: 'Distributors, stockists and the field team who carry the range forward.', draft: true },
  { icon: Stethoscope, title: 'Healthcare customers', text: 'Doctors, hospitals and retail pharmacies.', draft: true },
]

export function Ecosystem() {
  const [active, setActive] = useState(1)
  const s = STAGES[active]
  return (
    <div className="eco" style={{ '--p': active / (STAGES.length - 1) } as any}>
      <div className="eco-track" role="tablist" aria-label="Business ecosystem stages">
        <span className="eco-line" aria-hidden="true"><span className="eco-line-fill" /></span>
        {STAGES.map((st, i) => (
          <button key={st.title} role="tab" aria-selected={i === active} aria-controls="eco-panel" id={`eco-tab-${i}`}
            className={`eco-node ${i === active ? 'is-active' : ''} ${i < active ? 'is-done' : ''}`} onClick={() => setActive(i)} data-cursor="OPEN">
            <span className="eco-dot"><st.icon size={20} aria-hidden="true" /></span>
            <span className="eco-name">{st.title}</span>
          </button>
        ))}
      </div>
      <div id="eco-panel" role="tabpanel" aria-labelledby={`eco-tab-${active}`} className="eco-panel" key={active}>
        <p className="eco-step">Stage {active + 1} of {STAGES.length}</p>
        <h3>{s.title}</h3>
        <p>{s.text}</p>
        {s.draft && <p className="ph-inline"><span className="ph-tag">Outline</span> General wording — replace with your own in <code>src/components/Ecosystem.tsx</code>.</p>}
      </div>
    </div>
  )
}
