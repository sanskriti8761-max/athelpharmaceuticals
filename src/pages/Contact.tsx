import { useMemo, useRef, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AlertCircle, CheckCircle2, Copy, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react'
import { COMPANY, FORM_ENDPOINT } from '../data/company'
import { useDocumentTitle } from '../lib/motion'
import { useScrollStory } from '../lib/scroll'
import { Btn, Eyebrow, Fill } from '../components/ui'
import { Split } from '../components/Split'
import { Molecule } from '../components/Molecule'

const TYPES = { general: 'General enquiry', partnership: 'Business partnership', portfolio: 'Product portfolio', distribution: 'Distribution', careers: 'Careers & internships' }
type Fields = { name: string; company: string; email: string; phone: string; type: string; message: string }
type Status = { kind: 'idle' | 'sending' | 'sent' | 'opened' | 'copied' | 'error'; text?: string }

const validate = (f: Fields) => {
  const e: Partial<Record<keyof Fields, string>> = {}
  if (f.name.trim().length < 2) e.name = 'Please enter your name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = 'Please enter a valid email address.'
  if (f.phone.trim() && !/^[+()\d\s-]{7,18}$/.test(f.phone.trim())) e.phone = 'Use digits only, with an optional + and spaces.'
  if (f.message.trim().length < 10) e.message = 'Please write at least a sentence.'
  return e
}

export default function Contact() {
  useDocumentTitle('Contact', `Contact ${COMPANY.name} for business partnership, distribution and product portfolio enquiries.`)
  const root = useRef<HTMLDivElement>(null)
  useScrollStory(root)
  const [params] = useSearchParams()
  const product = params.get('product') ?? ''
  const [f, setF] = useState<Fields>({
    name: '', company: '', email: '', phone: '',
    type: params.get('type') && params.get('type')! in TYPES ? params.get('type')! : 'general',
    message: product ? `I would like to know more about ${product}.` : '',
  })
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({})
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const errors = useMemo(() => validate(f), [f])
  const up = (k: keyof Fields) => (e: { target: { value: string } }) => setF((s) => ({ ...s, [k]: e.target.value }))
  const blur = (k: keyof Fields) => () => setTouched((t) => ({ ...t, [k]: true }))
  const err = (k: keyof Fields) => (touched[k] ? errors[k] : undefined)

  // how the form will actually deliver, stated honestly on the page
  const mode: 'service' | 'mailto' | 'none' = FORM_ENDPOINT ? 'service' : COMPANY.email ? 'mailto' : 'none'
  const body = `Name: ${f.name}\nCompany: ${f.company || '—'}\nEmail: ${f.email}\nPhone: ${f.phone || '—'}\nEnquiry type: ${TYPES[f.type as keyof typeof TYPES]}\n\n${f.message}`

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setTouched({ name: true, email: true, phone: true, message: true })
    if (Object.keys(errors).length) {
      root.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
      return setStatus({ kind: 'error', text: 'Please correct the highlighted fields.' })
    }
    if (mode === 'service') {
      setStatus({ kind: 'sending' })
      try {
        const res = await fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ ...f, type: TYPES[f.type as keyof typeof TYPES] }) })
        if (!res.ok) throw new Error(String(res.status))
        setStatus({ kind: 'sent', text: 'Your message has been sent. Thank you.' })
      } catch {
        setStatus({ kind: 'error', text: 'The message could not be sent just now. Please try again, or use the contact details on this page.' })
      }
    } else if (mode === 'mailto') {
      window.location.href = `mailto:${COMPANY.email}?subject=${encodeURIComponent(`${TYPES[f.type as keyof typeof TYPES]} — ${f.name}`)}&body=${encodeURIComponent(body)}`
      setStatus({ kind: 'opened', text: 'Your email app should now be open with this message ready. Press Send there to deliver it — nothing has been sent from this page.' })
    } else {
      try { await navigator.clipboard.writeText(body); setStatus({ kind: 'copied', text: 'Message copied. This form is not yet connected to an inbox, so please paste it into an email or message to Athel.' }) }
      catch { setStatus({ kind: 'error', text: 'This form is not yet connected to an inbox and the message could not be copied automatically. Please select and copy your message.' }) }
    }
  }

  const field = (k: keyof Fields, label: string, opts: { type?: string; required?: boolean; auto?: string } = {}) => (
    <label className={`field ${f[k] ? 'has-value' : ''} ${err(k) ? 'has-error' : ''}`}>
      <span className="field-label">{label}{opts.required ? <em aria-hidden="true"> *</em> : <small> optional</small>}</span>
      <input type={opts.type ?? 'text'} value={f[k]} onChange={up(k)} onBlur={blur(k)} required={opts.required} autoComplete={opts.auto} aria-invalid={!!err(k)} aria-describedby={err(k) ? `${k}-err` : undefined} />
      {err(k) && <span id={`${k}-err`} className="field-err"><AlertCircle size={13} aria-hidden="true" /> {err(k)}</span>}
    </label>
  )

  return (
    <div ref={root} className="page contact">
      <header className="page-head wrap">
        <Molecule state="contact" className="page-head-mol" />
        <Eyebrow>Contact &amp; business enquiries</Eyebrow>
        <h1 className="h-display"><Split text="Let's connect." /></h1>
        <p className="lead" data-reveal="up">For partnership, distribution or questions about the portfolio, write to us here.</p>
      </header>

      <div className="wrap contact-grid">
        <div className="contact-cards" data-reveal="stagger">
          <article className="ccard"><span className="ccard-ic"><MapPin size={18} aria-hidden="true" /></span><h2>Office</h2><p><Fill value={COMPANY.address} where="company.ts → address">Office address</Fill></p></article>
          <article className="ccard"><span className="ccard-ic"><Phone size={18} aria-hidden="true" /></span><h2>Phone</h2><p>{COMPANY.phone ? <a className="ulink" href={`tel:${COMPANY.phone.replace(/\s/g, '')}`}>{COMPANY.phone}</a> : <Fill where="company.ts → phone">Phone number</Fill>}</p></article>
          <article className="ccard"><span className="ccard-ic"><Mail size={18} aria-hidden="true" /></span><h2>Email</h2><p>{COMPANY.email ? <a className="ulink" href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> : <Fill where="company.ts → email">Email address</Fill>}</p></article>
          {COMPANY.whatsapp && <article className="ccard"><span className="ccard-ic"><MessageCircle size={18} aria-hidden="true" /></span><h2>WhatsApp</h2><p><a className="ulink" href={`https://wa.me/${COMPANY.whatsapp}`} target="_blank" rel="noreferrer">Message us on WhatsApp</a></p></article>}
          <article className="ccard ccard--quiet"><h2>Who should write</h2><p>Distributors, hospitals, doctors, retail pharmacies, suppliers, and people interested in working or interning with Athel.</p></article>
        </div>

        <form className="form" onSubmit={submit} noValidate aria-label="Business enquiry form" data-reveal="up">
          <div className="form-row">{field('name', 'Your name', { required: true, auto: 'name' })}{field('company', 'Company', { auto: 'organization' })}</div>
          <div className="form-row">{field('email', 'Email', { type: 'email', required: true, auto: 'email' })}{field('phone', 'Phone', { type: 'tel', auto: 'tel' })}</div>
          <label className="field has-value">
            <span className="field-label">Enquiry type</span>
            <select value={f.type} onChange={up('type')}>{Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          </label>
          <label className={`field ${f.message ? 'has-value' : ''} ${err('message') ? 'has-error' : ''}`}>
            <span className="field-label">Message<em aria-hidden="true"> *</em></span>
            <textarea rows={5} value={f.message} onChange={up('message')} onBlur={blur('message')} required aria-invalid={!!err('message')} aria-describedby={err('message') ? 'message-err' : undefined} />
            {err('message') && <span id="message-err" className="field-err"><AlertCircle size={13} aria-hidden="true" /> {err('message')}</span>}
          </label>

          <p className="form-how">
            {mode === 'service' && 'This form sends your message directly to Athel.'}
            {mode === 'mailto' && 'Pressing the button opens your own email app with the message filled in. You then press Send there.'}
            {mode === 'none' && <><span className="ph-tag">Not connected yet</span> No email address or form service is set up, so this form cannot deliver messages. For now the button copies your message so you can paste it elsewhere. See “Contact form” in the README to connect it.</>}
          </p>
          <div className="form-actions">
            <Btn type="submit" disabled={status.kind === 'sending'}>
              {mode === 'none' ? <><Copy size={16} aria-hidden="true" /> Copy my message</> : <><Send size={16} aria-hidden="true" /> {status.kind === 'sending' ? 'Sending…' : mode === 'mailto' ? 'Open in my email app' : 'Send message'}</>}
            </Btn>
          </div>
          <p className={`form-status form-status--${status.kind}`} role="status" aria-live="polite">
            {status.text && <>{status.kind === 'error' ? <AlertCircle size={16} aria-hidden="true" /> : <CheckCircle2 size={16} aria-hidden="true" />} {status.text}</>}
          </p>
        </form>
      </div>
    </div>
  )
}
