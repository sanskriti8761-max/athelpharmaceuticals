import { useDocumentTitle } from '../lib/motion'
import { Btn, Eyebrow } from '../components/ui'
import { Molecule } from '../components/Molecule'

export default function NotFound() {
  useDocumentTitle('Page not found')
  return (
    <div className="page wrap empty empty--page">
      <Molecule state="disassemble" className="empty-mol" />
      <Eyebrow>Error 404</Eyebrow>
      <h1 className="h-display">This page has drifted apart.</h1>
      <p className="lead">The address may be mistyped, or the page may have moved.</p>
      <div className="hero-cta"><Btn to="/">Back to home</Btn><Btn to="/products" variant="ghost">Browse products</Btn></div>
    </div>
  )
}
