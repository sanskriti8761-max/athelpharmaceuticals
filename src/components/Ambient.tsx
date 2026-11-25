import { useEffect, useRef } from 'react'
import { isSmallScreen, pointer, prefersReducedMotion } from '../lib/motion'

/*
 * AMBIENT LAYER
 * One canvas of a few dozen drifting particles (fewer on phones) that lean
 * gently away from the cursor and link up when they pass close, plus a soft
 * spotlight that follows the pointer. Pauses when the tab is hidden and
 * draws a single still frame under reduced motion.
 */
const COLORS = ['#01a19f', '#a9c532', '#e5a323', '#e8872b', '#7db93b']

export function Ambient() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const spot = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const c = canvas.current!
    const ctx = c.getContext('2d')
    if (!ctx) return
    const reduced = prefersReducedMotion()
    const count = isSmallScreen() ? 14 : 34
    let w = 0, h = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const resize = () => {
      w = window.innerWidth; h = window.innerHeight
      c.width = w * dpr; c.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ps = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.22,
      r: 1.2 + Math.random() * 2.6, c: COLORS[i % COLORS.length], a: 0.25 + Math.random() * 0.4,
    }))
    let sx = w / 2, sy = h / 3, raf = 0, last = 0
    const frame = (t: number) => {
      raf = requestAnimationFrame(frame)
      if (t - last < 32) return // ~30fps is plenty for slow drift
      last = t
      ctx.clearRect(0, 0, w, h)
      for (const p of ps) {
        if (!reduced) {
          const dx = p.x - pointer.x, dy = p.y - pointer.y
          const d2 = dx * dx + dy * dy
          if (pointer.active && d2 < 22000 && d2 > 1) { const d = Math.sqrt(d2); p.x += (dx / d) * 0.5; p.y += (dy / d) * 0.5 }
          p.x += p.vx; p.y += p.vy
          if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10
          if (p.y < -10) p.y = h + 10; if (p.y > h + 10) p.y = -10
        }
        ctx.globalAlpha = p.a
        ctx.fillStyle = p.c
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill()
      }
      ctx.lineWidth = 0.6
      for (let i = 0; i < ps.length; i++)
        for (let j = i + 1; j < ps.length; j++) {
          const a = ps[i], b = ps[j]
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d < 120) { ctx.globalAlpha = (1 - d / 120) * 0.16; ctx.strokeStyle = a.c; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke() }
        }
      if (spot.current && pointer.active) {
        sx += (pointer.x - sx) * 0.08; sy += (pointer.y - sy) * 0.08
        spot.current.style.setProperty('--mx', sx.toFixed(0) + 'px')
        spot.current.style.setProperty('--my', sy.toFixed(0) + 'px')
      }
      if (reduced) cancelAnimationFrame(raf)
    }
    raf = requestAnimationFrame(frame)
    const vis = () => { cancelAnimationFrame(raf); if (!document.hidden && !reduced) raf = requestAnimationFrame(frame) }
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', vis)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); document.removeEventListener('visibilitychange', vis) }
  }, [])

  return (
    <div className="ambient" aria-hidden="true">
      <div ref={spot} className="ambient-spot" />
      <canvas ref={canvas} className="ambient-canvas" />
    </div>
  )
}
