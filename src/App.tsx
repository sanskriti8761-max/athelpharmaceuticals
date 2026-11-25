import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react'
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom'
import { TransitionProvider } from './lib/transition'
import { AppCtx } from './lib/app'
import { prefersReducedMotion } from './lib/motion'
import { Ambient } from './components/Ambient'
import { Cursor } from './components/Cursor'
import { Egg, Footer, Nav, Orb } from './components/Chrome'
import { Intro } from './components/Intro'
import { Loader } from './components/ui'
import Home from './pages/Home'

// Each page is its own file, downloaded only when first visited.
const Products = lazy(() => import('./pages/Products'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Explorer = lazy(() => import('./pages/Explorer'))
const About = lazy(() => import('./pages/About'))
const Legacy = lazy(() => import('./pages/Legacy'))
const Contact = lazy(() => import('./pages/Contact'))
const NotFound = lazy(() => import('./pages/NotFound'))

function introAlreadySeen() {
  try { return sessionStorage.getItem('athel-intro') === '1' } catch { return false }
}

function Shell() {
  const { pathname } = useLocation()
  const [intro, setIntro] = useState(() => !prefersReducedMotion() && !introAlreadySeen())
  const [egg, setEgg] = useState(false)
  const endIntro = useCallback(() => {
    try { sessionStorage.setItem('athel-intro', '1') } catch { /* fine */ }
    setIntro(false)
  }, [])
  const closeEgg = useCallback(() => setEgg(false), [])
  const ctx = useMemo(() => ({ introDone: !intro, egg: () => setEgg(true) }), [intro])

  // move keyboard focus to the new page's content after navigation
  useEffect(() => {
    if (!intro) document.getElementById('main')?.focus({ preventScroll: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <AppCtx.Provider value={ctx}>
      <Ambient />
      <Nav />
      <main id="main" tabIndex={-1} data-route={pathname.split('/')[1] || 'home'}>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:slug" element={<ProductDetail />} />
            <Route path="/explorer" element={<Explorer />} />
            <Route path="/about" element={<About />} />
            <Route path="/legacy" element={<Legacy />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <Orb />
      {egg && <Egg onClose={closeEgg} />}
      {intro && <Intro onDone={endIntro} />}
      <Cursor />
    </AppCtx.Provider>
  )
}

/*
 * HashRouter puts the page after a # in the address (…/#/products).
 * That is what lets every page, refresh and shared link work on GitHub Pages
 * with no server configuration.
 */
export default function App() {
  return (
    <HashRouter>
      <TransitionProvider>
        <Shell />
      </TransitionProvider>
    </HashRouter>
  )
}
