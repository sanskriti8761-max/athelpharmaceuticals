import { useRef } from 'react'
import { COMPANY } from '../data/company'
import { useDocumentTitle } from '../lib/motion'
import { useScrollStory } from '../lib/scroll'
import { Btn, Eyebrow, Fill, Portrait } from '../components/ui'
import { Split } from '../components/Split'
import { Molecule } from '../components/Molecule'
import { Timeline } from '../components/Timeline'

/* A quieter page. Motion here is slow and sparse on purpose. */
export default function Legacy() {
  useDocumentTitle('Our People & Legacy', `The people behind ${COMPANY.name}.`)
  const root = useRef<HTMLDivElement>(null)
  useScrollStory(root)
  const o = COMPANY.owner, u = COMPANY.uncle
  return (
    <div ref={root} className="page legacy">
      <header className="page-head page-head--tall wrap">
        <Eyebrow>Our people &amp; legacy</Eyebrow>
        <h1 className="h-display"><Split text="Built by family. Carried forward with care." /></h1>
      </header>

      <section className="wrap leader" aria-labelledby="leader-h">
        <div data-reveal="mask"><Portrait src={o.photo} name={o.name || 'the owner'} file="company.ts → owner.photo" /></div>
        <div className="leader-body">
          <Eyebrow>Leadership</Eyebrow>
          <h2 id="leader-h" className="h1"><Fill value={o.name} where="company.ts → owner.name">Owner's name</Fill></h2>
          <p className="leader-role"><Fill value={o.role} where="company.ts → owner.role">Role / title</Fill></p>
          <p className="lead" data-reveal="up"><Fill value={o.intro} where="company.ts → owner.intro">A short introduction.</Fill></p>
          <div className="leader-cols" data-reveal="stagger">
            <article><h3 className="h3">Business journey</h3><p><Fill value={o.journey} where="company.ts → owner.journey">How he built the business.</Fill></p></article>
            <article><h3 className="h3">Leadership philosophy</h3><p><Fill value={o.philosophy} where="company.ts → owner.philosophy">What he believes about running it.</Fill></p></article>
          </div>
          <div data-reveal="up"><Btn to="/contact" variant="ghost">Contact the business</Btn></div>
        </div>
      </section>

      {/* In remembrance — no parallax, no particles, one slow reveal */}
      <section className="tribute" aria-labelledby="tribute-h">
        <Molecule state="legacy" className="tribute-mark" />
        <div className="wrap tribute-in">
          <p className="tribute-eyebrow" data-reveal="slow">In loving memory</p>
          <div className="tribute-photo" data-reveal="slow"><Portrait src={u.photo} name={u.name || 'our late uncle'} file="company.ts → uncle.photo" /></div>
          <h2 id="tribute-h" className="h1 tribute-name" data-reveal="slow"><Fill value={u.name} where="company.ts → uncle.name">Name</Fill></h2>
          <p className="tribute-years" data-reveal="slow"><Fill value={u.years} where="company.ts → uncle.years">Years</Fill></p>
          <p className="tribute-text" data-reveal="slow"><Fill value={u.tribute} where="company.ts → uncle.tribute">A few sentences of tribute, in the family's own words, will appear here.</Fill></p>
          <span className="tribute-rule" aria-hidden="true" />
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <Eyebrow>Legacy timeline</Eyebrow>
          <Split as="h2" className="h2" text="The years that shaped Athel" />
          <Timeline />
        </div>
      </section>
    </div>
  )
}
