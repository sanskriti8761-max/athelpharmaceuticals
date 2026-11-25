/*
 * ATHEL PRODUCT DATABASE
 * ------------------------------------------------------------------
 * Every entry below is transcribed from the Athel visual-aid PDF.
 * Names, salts and strengths are reproduced as printed. Nothing has
 * been added: no indications, claims or dosage advice.
 *
 * TO ADD A PRODUCT: copy one block, change the values, save.
 * The catalogue, product page, Universe and Composition Explorer
 * all rebuild themselves from this one list.
 *
 * NOTE ON CATEGORIES: the PDF does not print portfolio categories.
 * The seven groupings below are a navigation aid chosen from the
 * compositions. Rename or regroup them freely in CATEGORIES.
 */
import biletune from '../assets/packs/biletune.jpg'
import calcithel from '../assets/packs/calcithel.jpg'
import ferronorm from '../assets/packs/ferronorm-lf.jpg'
import lcq10 from '../assets/packs/lcq-10.jpg'
import letrothel from '../assets/packs/letrothel.jpg'
import laxona from '../assets/packs/laxona.jpg'

export type CategoryId = 'gastro' | 'antiinfective' | 'pain' | 'women' | 'haematinic' | 'nutrition' | 'allergy'

export interface Category {
  id: CategoryId
  name: string
  /** accent colour used for this category's visual theme */
  color: string
  /** purely artistic motif name, used for the ambient pattern */
  motif: 'flow' | 'grid' | 'ripple' | 'petal' | 'cell' | 'ray' | 'air'
}

export const CATEGORIES: Category[] = [
  { id: 'gastro', name: 'Gastro & Liver Care', color: '#4f9a6a', motif: 'flow' },
  { id: 'antiinfective', name: 'Anti-infectives', color: '#2f7f9c', motif: 'grid' },
  { id: 'pain', name: 'Pain & Inflammation', color: '#d9694a', motif: 'ripple' },
  { id: 'women', name: "Women's Health", color: '#c2517a', motif: 'petal' },
  { id: 'haematinic', name: 'Iron & Haematinics', color: '#a8323a', motif: 'cell' },
  { id: 'nutrition', name: 'Vitamins & Nutrition', color: '#dc9a1c', motif: 'ray' },
  { id: 'allergy', name: 'Allergy & Respiratory', color: '#86ad36', motif: 'air' },
]

export interface Ingredient {
  /** salt / ingredient name exactly as printed */
  name: string
  /** strength exactly as printed, if printed */
  strength?: string
  /** printed qualifier such as EC or S.R. */
  note?: string
}

export interface Product {
  id: string
  name: string
  slug: string
  category: CategoryId
  /** dosage form as printed */
  form: string
  /** grouped form used by filters */
  formGroup: 'Tablet' | 'Capsule' | 'Syrup' | 'Powder'
  /** full composition line as printed in the PDF */
  composition: string
  ingredients: Ingredient[]
  /** pack size, only where it is legible on the pack shot */
  packSize?: string
  /** pack photograph cropped from the PDF, where one exists */
  image?: string
  /** page of the source PDF, for checking */
  sourcePage: number
}

export const PRODUCTS: Product[] = [
  {
    id: 'athrab-dsr', name: 'Athrab-DSR', slug: 'athrab-dsr', category: 'gastro',
    form: 'Sustained Release Capsule', formGroup: 'Capsule',
    composition: 'Rabeprazole Sodium (EC) 20 mg + Domperidone (S.R.) 30 mg',
    ingredients: [
      { name: 'Rabeprazole Sodium', strength: '20 mg', note: 'EC' },
      { name: 'Domperidone', strength: '30 mg', note: 'S.R.' },
    ],
    sourcePage: 2,
  },
  {
    id: 'andronorm', name: 'AndroNorm', slug: 'andronorm', category: 'women',
    form: 'Tablets', formGroup: 'Tablet',
    composition: 'Chromium Picolinate 400mcg + D-Chiro-Inositol 27.6mg + Myo-Inositol 1.1g + Vitamin D2 400IU',
    ingredients: [
      { name: 'Chromium Picolinate', strength: '400mcg' },
      { name: 'D-Chiro-Inositol', strength: '27.6mg' },
      { name: 'Myo-Inositol', strength: '1.1g' },
      { name: 'Vitamin D2', strength: '400IU' },
    ],
    sourcePage: 3,
  },
  {
    id: 'athflox-oz', name: 'Athflox-OZ', slug: 'athflox-oz', category: 'antiinfective',
    form: 'Tablets', formGroup: 'Tablet',
    composition: 'Ofloxacin 200mg + Ornidazole 500mg',
    ingredients: [
      { name: 'Ofloxacin', strength: '200mg' },
      { name: 'Ornidazole', strength: '500mg' },
    ],
    sourcePage: 4,
  },
  {
    id: 'athflox', name: 'Athflox', slug: 'athflox', category: 'antiinfective',
    form: 'Tablets', formGroup: 'Tablet',
    composition: 'Ofloxacin 200mg',
    ingredients: [{ name: 'Ofloxacin', strength: '200mg' }],
    sourcePage: 4,
  },
  {
    id: 'athspas', name: 'Athspas', slug: 'athspas', category: 'pain',
    form: 'Tablets', formGroup: 'Tablet',
    composition: 'Mefenamic Acid 250mg + Dicyclomine 10mg + Activated dimethicone 25mg',
    ingredients: [
      { name: 'Mefenamic Acid', strength: '250mg' },
      { name: 'Dicyclomine', strength: '10mg' },
      { name: 'Activated dimethicone', strength: '25mg' },
    ],
    sourcePage: 5,
  },
  {
    id: 'athcort-6', name: 'Athcort-6', slug: 'athcort-6', category: 'pain',
    form: 'Tablets', formGroup: 'Tablet',
    composition: 'Deflazacort 6mg',
    ingredients: [{ name: 'Deflazacort', strength: '6mg' }],
    sourcePage: 6,
  },
  {
    id: 'biletune', name: 'BileTune', slug: 'biletune', category: 'gastro',
    form: 'Tablets', formGroup: 'Tablet',
    composition: 'Ursodeoxycholic Acid 300mg',
    ingredients: [{ name: 'Ursodeoxycholic Acid', strength: '300mg' }],
    packSize: '10x1x15 Tablets', image: biletune,
    sourcePage: 7,
  },
  {
    id: 'bnine', name: 'Bnine', slug: 'bnine', category: 'nutrition',
    form: 'Tablets', formGroup: 'Tablet',
    composition: 'L-Methylfolate 1mg + Methylcobalamin 1500mcg + Pyridoxal 5 Phosphate 5mg',
    ingredients: [
      { name: 'L-Methylfolate', strength: '1mg' },
      { name: 'Methylcobalamin', strength: '1500mcg' },
      { name: 'Pyridoxal 5 Phosphate', strength: '5mg' },
    ],
    sourcePage: 8,
  },
  {
    id: 'calcithel', name: 'Calcithel', slug: 'calcithel', category: 'nutrition',
    form: 'Tablets', formGroup: 'Tablet',
    composition: 'Calcium Citrate 1000mg + Magnesium 100mg + Zinc 4mg + Vitamin D3 200IU',
    ingredients: [
      { name: 'Calcium Citrate', strength: '1000mg' },
      { name: 'Magnesium', strength: '100mg' },
      { name: 'Zinc', strength: '4mg' },
      { name: 'Vitamin D3', strength: '200IU' },
    ],
    packSize: '10X15 Tablets', image: calcithel,
    sourcePage: 9,
  },
  {
    id: 'clog-mf', name: 'Clog-MF', slug: 'clog-mf', category: 'women',
    form: 'Tablets', formGroup: 'Tablet',
    composition: 'Tranexamic Acid 500mg + Mefenamic Acid 250mg',
    ingredients: [
      { name: 'Tranexamic Acid', strength: '500mg' },
      { name: 'Mefenamic Acid', strength: '250mg' },
    ],
    sourcePage: 10,
  },
  {
    id: 'clog-500', name: 'Clog 500', slug: 'clog-500', category: 'women',
    form: 'Tablets', formGroup: 'Tablet',
    composition: 'Tranexamic Acid 500mg',
    ingredients: [{ name: 'Tranexamic Acid', strength: '500mg' }],
    sourcePage: 10,
  },
  {
    id: 'doxithel-lb', name: 'Doxithel-LB', slug: 'doxithel-lb', category: 'antiinfective',
    form: 'Capsules', formGroup: 'Capsule',
    composition: 'Doxycycline 100mg + Lactic Acid Bacillus',
    ingredients: [
      { name: 'Doxycycline', strength: '100mg' },
      { name: 'Lactic Acid Bacillus' },
    ],
    sourcePage: 11,
  },
  {
    id: 'elpra-m', name: 'Elpra-M', slug: 'elpra-m', category: 'allergy',
    form: 'Tablets', formGroup: 'Tablet',
    composition: 'Montelukast Sodium 10mg + Levocetirizine 5mg',
    ingredients: [
      { name: 'Montelukast Sodium', strength: '10mg' },
      { name: 'Levocetirizine', strength: '5mg' },
    ],
    sourcePage: 12,
  },
  {
    id: 'elpra', name: 'Elpra', slug: 'elpra', category: 'allergy',
    form: 'Tablets', formGroup: 'Tablet',
    composition: 'Levocetirizine 5mg',
    ingredients: [{ name: 'Levocetirizine', strength: '5mg' }],
    sourcePage: 12,
  },
  {
    id: 'ferronorm-lf', name: 'FerroNorm-LF', slug: 'ferronorm-lf', category: 'haematinic',
    form: 'Tablets', formGroup: 'Tablet',
    composition: 'Iron Bisglycinate 25mg + Lactoferrin 30mg + Vitamin C 50mg + Folic Acid 400mcg + Cyanocobalamin 2.2mcg',
    ingredients: [
      { name: 'Iron Bisglycinate', strength: '25mg' },
      { name: 'Lactoferrin', strength: '30mg' },
      { name: 'Vitamin C', strength: '50mg' },
      { name: 'Folic Acid', strength: '400mcg' },
      { name: 'Cyanocobalamin', strength: '2.2mcg' },
    ],
    packSize: '10x1x15 Tablets', image: ferronorm,
    sourcePage: 13,
  },
  {
    id: 'glarose', name: 'GlaRose', slug: 'glarose', category: 'nutrition',
    form: 'Soft Gel Capsules', formGroup: 'Capsule',
    composition: 'Evening Primrose Oil 1000mg',
    ingredients: [{ name: 'Evening Primrose Oil', strength: '1000mg' }],
    sourcePage: 14,
  },
  {
    id: 'grovel', name: 'Grovel', slug: 'grovel', category: 'nutrition',
    form: 'Capsules', formGroup: 'Capsule',
    composition: 'Calcium Ascorbate 50mg + Lycopene 5000mcg + Mixed Carotene 10.33mg + Wheat Germ oil 25mg + Zinc 27.45mg + Selenium Dioxide 75mcg',
    ingredients: [
      { name: 'Calcium Ascorbate', strength: '50mg' },
      { name: 'Lycopene', strength: '5000mcg' },
      { name: 'Mixed Carotene', strength: '10.33mg' },
      { name: 'Wheat Germ oil', strength: '25mg' },
      { name: 'Zinc', strength: '27.45mg' },
      { name: 'Selenium Dioxide', strength: '75mcg' },
    ],
    sourcePage: 15,
  },
  {
    id: 'lcq-10', name: 'LCQ-10', slug: 'lcq-10', category: 'nutrition',
    form: 'Tablets', formGroup: 'Tablet',
    composition: 'Co-enzyme Q10 100mg + L-Carnitine L-Tartrate 500mg + L-Glutathione 10mg + Omega-3 Fatty Acid 500mg (EPA 90mg + DHA 60mg) + L-Arginine 100mg',
    ingredients: [
      { name: 'Co-enzyme Q10', strength: '100mg' },
      { name: 'L-Carnitine L-Tartrate', strength: '500mg' },
      { name: 'L-Glutathione', strength: '10mg' },
      { name: 'Omega-3 Fatty Acid', strength: '500mg', note: 'EPA 90mg + DHA 60mg' },
      { name: 'L-Arginine', strength: '100mg' },
    ],
    packSize: '10x1x10 Tablets', image: lcq10,
    sourcePage: 16,
  },
  {
    id: 'letrothel', name: 'Letrothel', slug: 'letrothel', category: 'women',
    form: 'Tablets', formGroup: 'Tablet',
    composition: 'Letrozole 2.5mg',
    ingredients: [{ name: 'Letrozole', strength: '2.5mg' }],
    packSize: '10x1x10 Tablets', image: letrothel,
    sourcePage: 18,
  },
  {
    id: 'laxona', name: 'Laxona', slug: 'laxona', category: 'gastro',
    form: 'Capsules', formGroup: 'Capsule',
    composition: 'Lactobacillus Acidophilus 0.48 billion + Lactobacillus Rhamnosus 0.48 billion + Bifidobacterium longum 0.48 billion + Bifidobacterium bifidum 0.48 billion + Streptococcus thermophilus 0.48 billion + Saccharomyces boulardii 0.10 billion + FOS 300mg',
    ingredients: [
      { name: 'Lactobacillus Acidophilus', strength: '0.48 billion' },
      { name: 'Lactobacillus Rhamnosus', strength: '0.48 billion' },
      { name: 'Bifidobacterium longum', strength: '0.48 billion' },
      { name: 'Bifidobacterium bifidum', strength: '0.48 billion' },
      { name: 'Streptococcus thermophilus', strength: '0.48 billion' },
      { name: 'Saccharomyces boulardii', strength: '0.10 billion' },
      { name: 'FOS', strength: '300mg' },
    ],
    packSize: '10 x 10 Capsules', image: laxona,
    sourcePage: 19,
  },
  {
    id: 'nutriment', name: 'Nutriment', slug: 'nutriment', category: 'nutrition',
    form: 'Protein Powder', formGroup: 'Powder',
    composition: 'Protein, Vitamins, Minerals with DHA',
    ingredients: [{ name: 'Protein' }, { name: 'Vitamins' }, { name: 'Minerals' }, { name: 'DHA' }],
    sourcePage: 20,
  },
  {
    id: 'rejig-xt-syrup', name: 'Rejig-XT Syrup', slug: 'rejig-xt-syrup', category: 'haematinic',
    form: 'Syrup', formGroup: 'Syrup',
    composition: 'Ferrous Ascorbate 30 mg + Folic Acid 550 mcg / 5ml',
    ingredients: [
      { name: 'Ferrous Ascorbate', strength: '30 mg / 5ml' },
      { name: 'Folic Acid', strength: '550 mcg / 5ml' },
    ],
    sourcePage: 21,
  },
  {
    id: 'rejig-xt-tablets', name: 'Rejig-XT Tablets', slug: 'rejig-xt-tablets', category: 'haematinic',
    form: 'Tablets', formGroup: 'Tablet',
    composition: 'Ferrous Ascorbate 100 mg + Folic Acid 1.5 mg + Zinc Sulphate 22.5 mg',
    ingredients: [
      { name: 'Ferrous Ascorbate', strength: '100 mg' },
      { name: 'Folic Acid', strength: '1.5 mg' },
      { name: 'Zinc Sulphate', strength: '22.5 mg' },
    ],
    sourcePage: 21,
  },
  {
    id: 'srd-50', name: 'SRD-50', slug: 'srd-50', category: 'pain',
    form: 'Tablets', formGroup: 'Tablet',
    composition: 'Diclofenac Potassium 50mg + Serratiopeptidase 10mg',
    ingredients: [
      { name: 'Diclofenac Potassium', strength: '50mg' },
      { name: 'Serratiopeptidase', strength: '10mg' },
    ],
    sourcePage: 22,
  },
  {
    id: 'trine', name: 'Trine', slug: 'trine', category: 'pain',
    form: 'Tablets', formGroup: 'Tablet',
    composition: 'Trypsin 48mg + Bromelain 90mg + Rutoside Trihydrate 100mg',
    ingredients: [
      { name: 'Trypsin', strength: '48mg' },
      { name: 'Bromelain', strength: '90mg' },
      { name: 'Rutoside Trihydrate', strength: '100mg' },
    ],
    sourcePage: 23,
  },
  {
    id: 'trine-d', name: 'Trine-D', slug: 'trine-d', category: 'pain',
    form: 'Tablets', formGroup: 'Tablet',
    composition: 'Trypsin 48mg + Bromelain 90mg + Rutoside Trihydrate 100mg + Diclofenac Sodium 50mg',
    ingredients: [
      { name: 'Trypsin', strength: '48mg' },
      { name: 'Bromelain', strength: '90mg' },
      { name: 'Rutoside Trihydrate', strength: '100mg' },
      { name: 'Diclofenac Sodium', strength: '50mg' },
    ],
    sourcePage: 24,
  },
]

/* ---------- helpers: everything below is derived automatically ---------- */

export const categoryById = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)!
export const productBySlug = (slug?: string) => PRODUCTS.find((p) => p.slug === slug)
export const ingredientId = (name: string) => 'ing:' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

export interface IngredientEntry { id: string; name: string; products: Product[] }

/** every distinct salt / ingredient, with the products that contain it */
export const INGREDIENTS: IngredientEntry[] = (() => {
  const map = new Map<string, IngredientEntry>()
  for (const p of PRODUCTS)
    for (const i of p.ingredients) {
      const id = ingredientId(i.name)
      if (!map.has(id)) map.set(id, { id, name: i.name, products: [] })
      map.get(id)!.products.push(p)
    }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name))
})()

export const FORM_GROUPS = ['Tablet', 'Capsule', 'Syrup', 'Powder'] as const

/** products that share at least one ingredient, then same-category products */
export function relatedProducts(p: Product, max = 4): Product[] {
  const names = new Set(p.ingredients.map((i) => i.name))
  const shared = PRODUCTS.filter((q) => q.id !== p.id && q.ingredients.some((i) => names.has(i.name)))
  const sameCat = PRODUCTS.filter((q) => q.id !== p.id && q.category === p.category && !shared.includes(q))
  return [...shared, ...sameCat].slice(0, max)
}

/** one lower-case string per product that search runs against */
export const searchText = (p: Product) =>
  [p.name, p.composition, categoryById(p.category).name, p.form, p.formGroup, p.packSize ?? ''].join(' ').toLowerCase()
