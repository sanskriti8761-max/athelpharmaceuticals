# Athel Pharmaceutical — website

A multi-page, animated website for Athel Pharmaceutical, built with React, Vite and TypeScript.
Everything on it comes from the Athel visual-aid PDF: the logo, the colours, and all 26 products with their compositions.

---

## 1. See it on your own computer

You need one free program first: **Node.js**.

1. Go to <https://nodejs.org>, download the version marked **LTS**, and install it like any other program.
2. Unzip this project. You will get a folder called `athel-pharmaceutical`.
3. Open a terminal **inside that folder**:
   - **Windows:** open the folder in File Explorer, click the address bar, type `cmd`, press Enter.
   - **Mac:** open the *Terminal* app, type `cd ` (with a space), drag the folder onto the Terminal window, press Enter.
4. Type this and press Enter. It downloads the building blocks the site needs (about a minute, only needed once):
   ```
   npm install
   ```
   **You should see:** a line like `added 150 packages`. Yellow "warn" lines are fine.
5. Type this and press Enter:
   ```
   npm run dev
   ```
   **You should see:** `Local: http://localhost:5173/`
6. Open that address in your browser. The site is running. Leave the terminal open while you work; when you save a file the browser updates by itself. Press `Ctrl + C` in the terminal to stop.

**If it did not work**

| What you see | What to do |
| --- | --- |
| `'npm' is not recognized` / `command not found: npm` | Node.js is not installed, or the terminal was open before you installed it. Install it, close the terminal, open a new one. |
| `ENOENT ... package.json` | The terminal is not inside the project folder. Repeat step 3. |
| The page is blank | Look at the terminal for red text. It names the file and line with the problem — usually a missing quote or comma in something you just edited. |

---

## 2. Change the content (no coding needed)

You only ever need two files. Open them in any text editor (VS Code is free and good).

### `src/data/company.ts` — everything about the company
Phone, email, WhatsApp, the company story, mission, vision, your father's profile, your uncle's tribute and the timeline.
Anything left as `''` shows on the site inside a yellow **PLACEHOLDER** label that also tells you which line to edit. Type your text between the quotes, save, and the label disappears.

> The office address is filled in with the Prayagraj regional office. Check it is the one you want public.

### `src/data/products.ts` — every product
To add a product, copy one `{ ... }` block, paste it below, and change the values. The catalogue, the product page, the Universe and the Composition Explorer all rebuild themselves from this list — including the lines between products that share a salt.

Rules the site follows, and that you should keep to:
- write the composition **exactly as printed** on the product literature;
- leave out anything you do not have (`packSize` and `image` are optional);
- do not add medical claims.

The seven categories are a navigation aid I chose from the compositions (the PDF does not print categories). Rename or regroup them in the `CATEGORIES` list at the top of the same file.

### Adding photographs
1. Put the picture in the `public/people/` folder, for example `public/people/father.jpg`.
2. In `company.ts` write its name: `photo: './people/father.jpg'`.

Until you do, the site shows an empty frame marked "Photograph to be added". It never uses stock photos.

### Pack photographs
Six packs (Biletune, Calcithel, Ferronorm-LF, LCQ-10, Letrothel, Laxona) were cropped from the PDF, so they are small and a little soft. For sharper ones, replace the files in `src/assets/packs/` with better photographs **keeping the same file names**. To add a pack for another product, put the image in that folder and follow the pattern at the top of `products.ts`.

### The logo
`src/assets/athel-logo.png` was also cropped from the PDF. If you have the original logo file (PNG with a transparent background), save it over that file for a crisper result. The logo is never redrawn or recoloured by the site.

### Colours and fonts
`src/styles/tokens.css` holds every colour, size, radius, shadow and animation speed. Change a value there and the whole site follows.

---

## 3. Contact form

The form is honest about what it does, and it tells the visitor too.

| Situation | What the button does |
| --- | --- |
| Nothing set up (how it ships) | Says it is not connected, and copies the visitor's message so they can paste it elsewhere. It never claims to have sent anything. |
| You fill in `email` in `company.ts` | Opens the visitor's own email app with the message filled in. They press Send there. |
| You connect a form service (best) | Sends the message straight to your inbox and confirms it only if the service accepts it. |

**To connect a form service (free):**
1. Create an account at <https://formspree.io> and make a new form. It gives you an address like `https://formspree.io/f/abcdwxyz`.
2. In the project folder, make a copy of the file `.env.example` and name the copy `.env`.
3. Open `.env` and paste your address after the `=` sign: `VITE_FORM_ENDPOINT=https://formspree.io/f/abcdwxyz`
4. Stop the site (`Ctrl + C`) and start it again (`npm run dev`).

For the live site on GitHub, also add it there: repository → **Settings → Secrets and variables → Actions → Variables → New repository variable**, name `VITE_FORM_ENDPOINT`, and add these two lines under `- run: npm run build` in `.github/workflows/deploy.yml`:
```
        env:
          VITE_FORM_ENDPOINT: ${{ vars.VITE_FORM_ENDPOINT }}
```

---

## 4. Put it on the internet with GitHub Pages (free)

1. Make a free account at <https://github.com>.
2. Install **GitHub Desktop** from <https://desktop.github.com> and sign in.
3. In GitHub Desktop: **File → Add local repository →** choose the `athel-pharmaceutical` folder. It will say the folder is not a repository yet — click **create a repository**, then **Create repository**.
4. Click **Publish repository** (top right). Untick "Keep this code private" (free GitHub Pages needs a public repository). Click **Publish**.
5. On github.com open your new repository → **Settings → Pages**. Under **Build and deployment → Source** choose **GitHub Actions**.
6. Open the **Actions** tab. A job called "Deploy to GitHub Pages" will be running (if not, click it, then **Run workflow**). In about two minutes it turns green.
7. Go back to **Settings → Pages**. Your address is shown at the top: `https://YOUR-USERNAME.github.io/athel-pharmaceutical/`

From now on, whenever you change something: open GitHub Desktop, type a short note in the box at the bottom left, click **Commit to main**, then **Push origin**. The live site updates itself in about two minutes.

**If it did not work**
- *The Actions job is red:* click it and read the red step. Almost always it is a typo in a file you edited — the message names the file and line.
- *The site is a blank white page:* make sure step 5 says **GitHub Actions**, not "Deploy from a branch".
- *Works locally but a photo is missing online:* file names are case-sensitive online. `Father.JPG` and `father.jpg` are different.

**Why addresses contain `#`** — pages look like `…/#/products`. That is deliberate: it is what lets every page, refresh and shared link work on GitHub Pages without any server set-up. The trade-off is that search engines index the site mostly as one page. If you later move to Netlify or Vercel, change `HashRouter` to `BrowserRouter` in `src/App.tsx` to get plain addresses.

To check the finished site before publishing: `npm run build` (makes the `dist` folder) then `npm run preview`.

---

## 5. What is in the site

| Page | Address | What it does |
| --- | --- | --- |
| Home | `/` | Opening sequence, mouse-reactive molecule, scroll story in seven chapters, pinned sideways portfolio strip, category constellation, business ecosystem, 3D capsule |
| Products | `/products` | **Catalogue** (search, category chips, dosage-form / composition filters, five sort orders, compare up to three), **Universe** (interactive node map), **Packaging** (gallery with lightbox and zoom) |
| Product | `/products/<name>` | One template for every product: composition table, strengths, pack, related products, links into the Explorer, enquiry button |
| Composition Explorer | `/explorer` | Every salt and product as a connected network; search, focus, pan, zoom, drag, mind-map mode, optional dosage-form and category nodes |
| About | `/about` | Company, values, business model, brand palette, timeline |
| Legacy | `/legacy` | Leadership profile, a quiet tribute section, timeline |
| Contact | `/contact` | Contact cards and a validated enquiry form |
| Anything else | | A branded "page not found" |

Also: custom cursor (desktop only), ambient particles and cursor spotlight, page transitions, floating quick-menu orb (appears after scrolling), light and dark themes (remembered), magnetic buttons, and one easter egg — click the logo five times quickly.

**Accessibility:** keyboard navigation everywhere including graph nodes, visible focus rings, skip link, labelled forms, dialogs that trap and return focus, and full `prefers-reduced-motion` support (no intro, no cursor, no particles drift, no scroll animation, static 3D — all content still there).

### How the code is organised
```
src/
  data/        products.ts, company.ts      <- the content you edit
  styles/      tokens.css (design system), global.css
  components/  Molecule, Intro, Cursor, Ambient, GraphCanvas, Capsule3D, ProductCard, ...
  pages/       Home, Products, ProductDetail, Explorer, About, Legacy, Contact, NotFound
  lib/         transition (page transitions), scroll (scroll story), motion (helpers)
public/        favicon, robots.txt, people/ (your photographs)
```

### Libraries, and why
- **React + Vite + TypeScript** — structure and fast builds
- **React Router** — real pages with real addresses, back and forward
- **GSAP + ScrollTrigger** — intro, page transitions, scroll storytelling
- **D3 (force, zoom, drag)** — the Universe and the Composition Explorer
- **Three.js** — the 3D capsule only; downloaded only when you scroll near it, with a flat SVG fallback if 3D is unavailable
- **Lucide** — icons

Deliberately left out, to keep the site light: Framer Motion (GSAP already covers it), Lenis smooth-scroll (native scrolling is kept so nothing is hijacked), Lottie and React Three Fiber (not needed for one 3D object).

### What was tested
In headless Chrome at desktop and phone sizes: every navigation link, back / forward, direct links, intro and skip, search, each filter, each sort, compare, product pages, related products, product-not-found, packaging lightbox, Universe expand / zoom / pan / open product, Explorer node and line counts against the data, search, focus, mind map, reset, form validation, theme switch and persistence, easter egg, orb menu, 404, reduced motion, and no sideways overflow on any page at 390 px. No console errors.

Not tested: real phones and Safari, a live GitHub Pages deployment, and form delivery through a real form service.

---

## 6. A note on content

This is a company and portfolio website for healthcare professionals and trade partners. It shows product names, compositions, strengths, dosage forms and pack sizes only. The promotional claims and indications in the visual aid were intentionally **not** copied onto the site. The footer carries a disclaimer; edit it in `src/data/company.ts`.
