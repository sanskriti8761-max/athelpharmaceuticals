import { useEffect, useState } from 'react'

const q = (s: string) => (typeof matchMedia === 'function' ? matchMedia(s) : null)

/** true when the visitor has asked their device for less animation */
export const prefersReducedMotion = () => !!q('(prefers-reduced-motion: reduce)')?.matches
/** true on mouse/trackpad devices, false on touch screens */
export const isFinePointer = () => !!q('(hover: hover) and (pointer: fine)')?.matches
export const isSmallScreen = () => !!q('(max-width: 760px)')?.matches

export function useReducedMotion() {
  const [reduced, set] = useState(prefersReducedMotion)
  useEffect(() => {
    const m = q('(prefers-reduced-motion: reduce)')
    if (!m) return
    const on = () => set(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])
  return reduced
}

/* One shared pointer tracker for the molecule, particles, spotlight and cursor,
   so the page has a single mousemove listener instead of many. */
export const pointer = { x: -100, y: -100, nx: 0, ny: 0, active: false }
if (typeof window !== 'undefined') {
  window.addEventListener(
    'pointermove',
    (e) => {
      pointer.x = e.clientX
      pointer.y = e.clientY
      pointer.nx = (e.clientX / window.innerWidth) * 2 - 1
      pointer.ny = (e.clientY / window.innerHeight) * 2 - 1
      pointer.active = true
    },
    { passive: true },
  )
}

export function useDocumentTitle(title: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} — Athel Pharmaceutical` : 'Athel Pharmaceutical — A Noble Effort Towards Good Health'
    if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description)
  }, [title, description])
}
