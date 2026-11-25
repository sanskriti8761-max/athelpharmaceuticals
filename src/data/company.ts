/*
 * ATHEL COMPANY INFORMATION — the one file to edit for all site text.
 * ------------------------------------------------------------------
 * Anything left as an empty string '' shows on the site as a clearly
 * labelled placeholder. Fill a value in and the placeholder disappears.
 * Nothing here is invented: the tagline, the three values and the
 * closing line come from the Athel visual-aid PDF.
 */
export const COMPANY = {
  name: 'Athel Pharmaceutical',
  /** printed on the PDF cover */
  tagline: 'A Noble Effort Towards Good Health',
  /** printed on the PDF back cover */
  values: ['Dedication', 'Innovation', 'Compassion'],
  closingLine: 'Thank you, Doctor',
  business: 'Pharmaceutical trading company',

  /* ---- contact: fill these in ---- */
  address: '4 New Katra, Lala Lajpat Rai Road, Prayagraj, Uttar Pradesh', // regional office — confirm before publishing
  phone: '', // e.g. '+91 98765 43210'
  email: '', // e.g. 'info@yourdomain.com' — the contact form needs this
  whatsapp: '', // digits only with country code, e.g. '919876543210'
  socials: [] as { label: string; url: string }[],

  /* ---- story: fill these in ---- */
  story: '', // a few sentences on how the business began
  mission: '',
  vision: '',
  founded: '', // year, only if you want it shown

  /* ---- people: fill these in. To add a photo, put the image file in the
         public/people/ folder, then write its name here, for example
         photo: './people/father.jpg'   (see README, "Adding photographs") ---- */
  owner: { name: '', role: '', intro: '', journey: '', philosophy: '', photo: '' },
  uncle: { name: '', years: '', tribute: '', photo: '' },

  /* ---- timeline: replace with real milestones ---- */
  milestones: [] as { year: string; title: string; text: string }[],
}

/** set in a .env file — see README "Contact form" */
export const FORM_ENDPOINT: string = import.meta.env.VITE_FORM_ENDPOINT ?? ''

export const DISCLAIMER =
  'This website is a company and product-portfolio reference for healthcare professionals and trade partners. Product names and compositions are reproduced from company literature. Nothing here is medical advice, a recommendation or a dosage instruction. Medicines should be used only on the advice of a registered medical practitioner.'
