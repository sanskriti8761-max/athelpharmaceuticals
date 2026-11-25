import { useRef } from 'react'
import { ArrowRight } from 'lucide-react'
import { CATEGORIES, FORM_GROUPS, INGREDIENTS, PRODUCTS } from '../data/products'
import { COMPANY } from '../data/company'
import { useDocumentTitle } from '../lib/motion'
import { useScrollStory } from '../lib/scroll'
import { Btn, Eyebrow, Fill, Logo } from '../components/ui'
import { Split } from '../components/Split'
import { Molecule } from '../components/Molecule'
import { Ecosystem } from '../components/Ecosystem'
import { Timeline } from '../components/Timeline'

const PALETTE = [
  ['Athel teal', '#01a19f', 'The wordmark'], ['Deep teal', '#02716f', 'Text and links'], ['Forest', '#0a3d3a', 'Depth'],
  ['Lime', '#a9c532', 'The core sphere'], ['Green', '#7db93b', 'The stem node'], ['Amber', '#e5a323', 'The core sphere'],
  ['Orange', '#e8872b', '“Pharmaceutical”'], ['Warm ivory', '#fbf7ee', 'Breathing space'],
]

export default function About() {
  useDocumentTitle('About', `About ${COMPANY.name}, a pharmaceutical trading company: who we are, what we do and what we stand for.`)
  const root = useRef<HTMLDivElement>(null)
  useScrollStory(root)
  return (
    <div ref={root} className="page about">
      <header className="page-head page-head--tall wrap">
        <Eyebrow>About Athel</Eyebrow>
        <h1 className="h-display"><Split text="A noble effort, carried out carefully." /></h1>
        <p className="lead" data-reveal="up">{COMPANY.name} is a pharmaceutical trading company. Our tagline is our brief: <em>{COMPANY.tagline}</em>.</p>
      </header>

      <section className="wrap about-split">
        <div className="about-art" data-reveal="mask">
          <Molecule state="interactive" className="about-mol" />
        </div>
        <div>
          <Eyebrow>What we do</Eyebrow>
          <Split as="h2" className="h2" text="We trade in medicines and nutrition. We do not make them." />
          <p data-reveal="up">Athel markets a portfolio of {PRODUCTS.length} branded products to healthcare professionals, hospitals, pharmacies and distribution partners. The range spans {CATEGORIES.length} groups and {FORM_GROUPS.length} dosage forms, built from {INGREDIENTS.length} distinct salts and ingredients.</p>
          <p data-reveal="up"><Fill value={COMPANY.story} where="company.ts → story">The story of how the business began, in your own words, will appear here.</Fill></p>
          <ul className="stats" data-reveal="stagger">
            <li><strong>{PRODUCTS.length}</strong><span>Products in the portfolio</span></li>
            <li><strong>{INGREDIENTS.length}</strong><span>Salts and ingredients</span></li>
            <li><strong>{CATEGORIES.length}</strong><span>Portfolio groups</span></li>
            <li><strong>{FORM_GROUPS.length}</strong><span>Dosage forms</span></li>
          </ul>
          <p className="fine">Figures are counted directly from the product list on this website.</p>
        </div>
      </section>

      <section className="section section--tint">
        <div className="wrap">
          <Eyebrow>What we stand for</Eyebrow>
          <Split as="h2" className="h1 narrow" text="Three words, printed on our literature." />
          <ul className="values values--big" data-reveal="stagger">
            {COMPANY.values.map((v, i) => <li key={v} className="value"><span className="value-n">0{i + 1}</span><span className="value-t">{v}</span></li>)}
          </ul>
          <div className="mv" data-reveal="stagger">
            <article><h3 className="h3">Mission</h3><p><Fill value={COMPANY.mission} where="company.ts → mission">Your mission statement.</Fill></p></article>
            <article><h3 className="h3">Vision</h3><p><Fill value={COMPANY.vision} where="company.ts → vision">Your vision statement.</Fill></p></article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <Eyebrow>Business model</Eyebrow>
          <Split as="h2" className="h2 narrow" text="How a trading company connects the chain." />
          <div data-reveal="up"><Ecosystem /></div>
        </div>
      </section>

      <section className="section section--tint">
        <div className="wrap about-split about-split--rev">
          <div>
            <Eyebrow>Brand identity</Eyebrow>
            <Split as="h2" className="h2" text="A molecule, a wordmark, eight colours." />
            <p data-reveal="up">Everything on this website is drawn from the Athel logo: the teal of the wordmark, the lime-to-amber sphere, the orange satellites and the green node on its stem.</p>
            <ul className="swatches" data-reveal="stagger">
              {PALETTE.map(([n, hex, use]) => <li key={hex}><span className="sw" style={{ background: hex }} /><strong>{n}</strong><code>{hex}</code><em>{use}</em></li>)}
            </ul>
          </div>
          <div className="brand-plate" data-reveal="mask"><Logo /></div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <Eyebrow>Our journey</Eyebrow>
          <Split as="h2" className="h2" text="Milestones" />
          <Timeline />
        </div>
      </section>

      <section className="section closing">
        <div className="wrap closing-in">
          <Split as="h2" className="h1" text="Meet the people behind Athel." />
          <div className="hero-cta" data-reveal="up">
            <Btn to="/legacy">Our people &amp; legacy <ArrowRight size={16} aria-hidden="true" /></Btn>
            <Btn to="/contact" variant="ghost">Get in touch</Btn>
          </div>
        </div>
      </section>
    </div>
  )
}
