import { useEffect, useRef } from 'react'
import { isFinePointer, pointer, prefersReducedMotion } from '../lib/motion'

/*
 * CUSTOM CURSOR (desktop only)
 * A small teal core with a trailing ring. Add data-cursor="EXPLORE" (or OPEN,
 * DRAG...) to any element to show a label. Never shown on touch screens or
 * with reduced motion; text fields keep the normal text cursor.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!isFinePointer() || prefersReducedMotion()) return
    const d = dot.current!, r = ring.current!, l = label.current!
    document.documentElement.classList.add('has-cursor')
    let rx = -100, ry = -100, raf = 0
    const loop = () => {
      rx += (pointer.x - rx) * 0.2
      ry += (pointer.y - ry) * 0.2
      d.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0)`
      r.style.transform = `translate3d(${rx}px, ${ry}px, 0)`
      // stop the loop once the ring has caught up; pointermove restarts it
      raf = Math.abs(pointer.x - rx) + Math.abs(pointer.y - ry) > 0.2 ? requestAnimationFrame(loop) : 0
    }
    const move = () => { d.classList.add('is-on'); r.classList.add('is-on'); if (!raf) raf = requestAnimationFrame(loop) }
    const over = (e: Event) => {
      const t = e.target as Element
      if (!t.closest) return
      const field = t.closest('input:not([type=checkbox]):not([type=radio]), textarea, [contenteditable]')
      const labelled = t.closest<HTMLElement>('[data-cursor]')
      const link = t.closest('a, button, [role="button"], summary, select, label, input[type=checkbox], input[type=radio]')
      r.classList.toggle('is-text', !!field)
      d.classList.toggle('is-text', !!field)
      r.classList.toggle('is-label', !!labelled && !field)
      r.classList.toggle('is-link', !!link && !labelled && !field)
      l.textContent = labelled?.dataset.cursor ?? ''
    }
    const down = () => {
      r.classList.add('is-down')
      const rip = document.createElement('span')
      rip.className = 'cursor-ripple'
      rip.style.left = pointer.x + 'px'
      rip.style.top = pointer.y + 'px'
      document.body.appendChild(rip)
      rip.addEventListener('animationend', () => rip.remove())
    }
    const up = () => r.classList.remove('is-down')
    const leave = () => { d.classList.remove('is-on'); r.classList.remove('is-on') }
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerover', over, { passive: true })
    window.addEventListener('pointerdown', down, { passive: true })
    window.addEventListener('pointerup', up, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(raf)
      document.documentElement.classList.remove('has-cursor')
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerover', over)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      document.documentElement.removeEventListener('pointerleave', leave)
    }
  }, [])

  return (
    <div aria-hidden="true">
      <div ref={ring} className="cursor-ring"><span ref={label} className="cursor-label" /></div>
      <div ref={dot} className="cursor-dot" />
    </div>
  )
}
