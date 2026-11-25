import { useState } from 'react'
import { COMPANY } from '../data/company'

/*
 * COMPANY TIMELINE
 * Reads real milestones from company.ts. Until those exist it shows three
 * clearly labelled sample slots so the design can be judged — no history
 * is invented.
 */
const SAMPLE = [
  { year: 'Year', title: 'First milestone', text: 'Describe how the business began.' },
  { year: 'Year', title: 'Second milestone', text: 'A moment the business grew or changed.' },
  { year: 'Year', title: 'Third milestone', text: 'Where things stand today.' },
]

export function Timeline() {
  const real = COMPANY.milestones.length > 0
  const items = real ? COMPANY.milestones : SAMPLE
  const [open, setOpen] = useState(0)
  return (
    <div className={`tl ${real ? '' : 'tl--sample'}`}>
      {!real && <p className="ph-inline"><span className="ph-tag">Placeholder timeline</span> Add real milestones in <code>src/data/company.ts → milestones</code>.</p>}
      <svg className="tl-line" viewBox="0 0 2 100" preserveAspectRatio="none" aria-hidden="true"><line x1="1" y1="0" x2="1" y2="100" data-draw /></svg>
      <ol className="tl-list">
        {items.map((m, i) => (
          <li key={i} className={`tl-item ${open === i ? 'is-open' : ''}`} data-reveal="up">
            <button className="tl-btn" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i} data-cursor="OPEN">
              <span className="tl-dot" aria-hidden="true" />
              <span className="tl-year">{m.year}</span>
              <span className="tl-title">{m.title}</span>
            </button>
            <div className="tl-body" hidden={open !== i}><p>{m.text}</p></div>
          </li>
        ))}
      </ol>
    </div>
  )
}
