import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { isSmallScreen, pointer, prefersReducedMotion } from '../lib/motion'

/*
 * 3D CAPSULE (Three.js) — an artistic object, not a depiction of any medicine
 * or of how one works. It floats, turns toward the cursor, can be dragged,
 * and opens into drifting particles when clicked.
 * Loaded only when scrolled near (see Home.tsx); renders only while visible.
 * If WebGL is unavailable this component throws and the page shows the
 * static SVG capsule instead (CapsuleFallback).
 */
export default function Capsule3D() {
  const mount = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const openRef = useRef(open)
  openRef.current = open
  const [failed, setFailed] = useState(false)
  if (failed) throw new Error('WebGL unavailable')

  useEffect(() => {
    const el = mount.current!
    const reduced = prefersReducedMotion()
    const small = isSmallScreen()
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: !small, alpha: true, powerPreference: 'low-power' })
    } catch { setFailed(true); return }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, small ? 1.5 : 2))
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50)
    camera.position.set(0, 0, 9)
    scene.add(new THREE.HemisphereLight(0xfff6df, 0x0a3d3a, 1.1))
    const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(3, 5, 6); scene.add(key)
    const rim = new THREE.DirectionalLight(0xa9c532, 1.1); rim.position.set(-5, -2, -3); scene.add(rim)
    const follow = new THREE.PointLight(0xffd58a, 14, 14); follow.position.set(0, 0, 4); scene.add(follow) // follows the cursor

    const seg = small ? 28 : 48
    const R = 0.78, H = 1.25
    const mat = (color: number) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.22, metalness: 0.02, clearcoat: 1, clearcoatRoughness: 0.12, sheen: 0.4 })
    const half = (color: number, dir: 1 | -1) => {
      const g = new THREE.Group()
      const m = mat(color)
      const body = new THREE.Mesh(new THREE.CylinderGeometry(R, R, H, seg, 1, true), m)
      body.rotation.z = Math.PI / 2
      body.position.x = (dir * H) / 2
      const cap = new THREE.Mesh(new THREE.SphereGeometry(R, seg, seg / 2, 0, Math.PI * 2, 0, Math.PI / 2), m)
      cap.rotation.z = dir === 1 ? -Math.PI / 2 : Math.PI / 2
      cap.position.x = dir * H
      const inner = new THREE.Mesh(new THREE.CircleGeometry(R * 0.96, seg), new THREE.MeshStandardMaterial({ color: 0xfbf7ee, roughness: 0.9, side: THREE.DoubleSide }))
      inner.rotation.y = Math.PI / 2
      inner.position.x = dir * 0.02
      g.add(body, cap, inner)
      return g
    }
    const capsule = new THREE.Group()
    const a = half(0x01a19f, -1) // Athel teal
    const b = half(0xe8972b, 1) // Athel amber
    capsule.add(a, b)
    capsule.rotation.z = 0.5
    scene.add(capsule)

    // particles that drift out when the capsule opens
    const N = small ? 34 : 70
    const pGeo = new THREE.SphereGeometry(1, 10, 10)
    const pMat = new THREE.MeshStandardMaterial({ roughness: 0.35, emissive: 0x332200, emissiveIntensity: 0.6 })
    const parts = new THREE.InstancedMesh(pGeo, pMat, N)
    const colors = [0xa9c532, 0xe5a323, 0xf2c14e, 0x7db93b, 0x01a19f].map((c) => new THREE.Color(c))
    const seeds = Array.from({ length: N }, (_, i) => {
      parts.setColorAt(i, colors[i % colors.length])
      const u = Math.random() * Math.PI * 2, v = Math.acos(2 * Math.random() - 1), d = 0.5 + Math.random() * 1.9
      return { x: Math.sin(v) * Math.cos(u) * d * 1.3, y: Math.sin(v) * Math.sin(u) * d, z: Math.cos(v) * d * 0.9, s: 0.03 + Math.random() * (i < 6 ? 0.16 : 0.06), ph: Math.random() * 6 }
    })
    if (parts.instanceColor) parts.instanceColor.needsUpdate = true
    capsule.add(parts)
    const dummy = new THREE.Object3D()

    let k = 0 // 0 closed -> 1 open
    let rx = 0.15, ry = -0.5, vx = 0, vy = 0
    let dragging = false, moved = 0, lx = 0, ly = 0, hover = false
    const size = () => {
      const w = el.clientWidth, h = el.clientHeight
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.position.z = w < 480 ? 11.5 : 9
      camera.updateProjectionMatrix()
    }
    size()

    const render = (t: number) => {
      const target = openRef.current ? 1 : 0
      k = reduced ? target : k + (target - k) * 0.07
      a.position.x = -k * 1.35
      b.position.x = k * 1.35
      a.rotation.x = k * 0.5
      b.rotation.x = -k * 0.5
      if (!dragging && !reduced) {
        ry += 0.0035 + vy; rx += vx
        vx *= 0.94; vy *= 0.94
        // lean gently toward the cursor
        const r = el.getBoundingClientRect()
        const nx = (pointer.x - (r.left + r.width / 2)) / window.innerWidth
        const ny = (pointer.y - (r.top + r.height / 2)) / window.innerHeight
        if (pointer.active) { capsule.position.x += (nx * 0.5 - capsule.position.x) * 0.04; follow.position.set(nx * 8, -ny * 8, 4) }
      }
      capsule.rotation.y = ry
      capsule.rotation.x = rx
      capsule.position.y = reduced ? 0 : Math.sin(t * 0.0009) * 0.12
      seeds.forEach((s, i) => {
        const w = reduced ? 0 : Math.sin(t * 0.001 + s.ph) * 0.08
        dummy.position.set(s.x * k + w * k, s.y * k + w * k, s.z * k)
        dummy.scale.setScalar(s.s * k)
        dummy.updateMatrix()
        parts.setMatrixAt(i, dummy.matrix)
      })
      parts.instanceMatrix.needsUpdate = true
      renderer.render(scene, camera)
    }

    let raf = 0, visible = false
    const loop = (t: number) => { render(t); raf = visible && !document.hidden && !reduced ? requestAnimationFrame(loop) : 0 }
    const kick = () => { if (reduced) render(0); else if (!raf) raf = requestAnimationFrame(loop) }
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick() })
    io.observe(el)
    const ro = new ResizeObserver(() => { size(); kick() })
    ro.observe(el)
    document.addEventListener('visibilitychange', kick)
    ;(el as any).__kick = kick

    const down = (e: PointerEvent) => { dragging = true; moved = 0; lx = e.clientX; ly = e.clientY; el.setPointerCapture(e.pointerId) }
    const move = (e: PointerEvent) => {
      if (!dragging) return
      const dx = e.clientX - lx, dy = e.clientY - ly
      moved += Math.abs(dx) + Math.abs(dy)
      ry += dx * 0.01; rx += dy * 0.01
      vy = dx * 0.002; vx = dy * 0.002
      lx = e.clientX; ly = e.clientY
      if (reduced) render(0)
    }
    const up = () => { if (dragging && moved < 6) setOpen((o) => !o); dragging = false }
    void hover
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', () => (dragging = false))

    return () => {
      cancelAnimationFrame(raf); io.disconnect(); ro.disconnect()
      document.removeEventListener('visibilitychange', kick)
      el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up)
      scene.traverse((o) => { const m = o as THREE.Mesh; m.geometry?.dispose?.(); const mm = m.material as THREE.Material | undefined; mm?.dispose?.() })
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  // under reduced motion nothing loops, so redraw once when the state changes
  useEffect(() => { (mount.current as any)?.__kick?.() }, [open])

  return (
    <div className="capsule">
      <div ref={mount} className="capsule-stage" data-cursor="DRAG" aria-hidden="true" />
      <button className="btn btn--ghost capsule-btn" onClick={() => setOpen((o) => !o)} aria-pressed={open}>
        <span className="btn-in">{open ? 'Reassemble the capsule' : 'Open the capsule'}</span>
      </button>
    </div>
  )
}
