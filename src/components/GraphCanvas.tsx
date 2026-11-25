import { useEffect, useRef, useState } from 'react'
import { select } from 'd3-selection'
import { zoom, zoomIdentity, type ZoomBehavior } from 'd3-zoom'
import { drag } from 'd3-drag'
import { forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY, type Simulation } from 'd3-force'
import { Minus, Plus, RotateCcw } from 'lucide-react'
import { prefersReducedMotion } from '../lib/motion'

/*
 * GRAPH CANVAS — the shared engine behind the Product Universe and the
 * Composition Explorer. Give it nodes and links; it lays them out with D3,
 * and handles pan, zoom, drag, hover previews, keyboard focus and dimming.
 * Pass `targets` (fixed positions) to get the tidy mind-map layout instead
 * of the free-floating network.
 */
export type GType = 'hub' | 'category' | 'product' | 'ingredient' | 'form'
export interface GNode { id: string; type: GType; label: string; sub?: string; color?: string; r: number; showLabel?: boolean }
export interface GLink { source: string; target: string }
type SNode = GNode & { x: number; y: number; fx?: number | null; fy?: number | null }

interface Props {
  nodes: GNode[]
  links: GLink[]
  focusId?: string | null
  matchIds?: Set<string> | null
  targets?: Record<string, { x: number; y: number }> | null
  onSelect: (n: GNode) => void
  ariaLabel: string
  /** change this value to re-centre the view */
  resetKey?: unknown
}

const CURSOR: Record<GType, string> = { hub: 'RESET', category: 'OPEN', product: 'VIEW', ingredient: 'OPEN', form: 'OPEN' }

export function GraphCanvas({ nodes, links, focusId, matchIds, targets, onSelect, ariaLabel, resetKey }: Props) {
  const wrap = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const gRef = useRef<SVGGElement>(null)
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown>>()
  const simRef = useRef<Simulation<SNode, undefined>>()
  const pos = useRef(new Map<string, { x: number; y: number }>())
  const cb = useRef(onSelect)
  cb.current = onSelect
  const [tip, setTip] = useState<{ x: number; y: number; n: GNode } | null>(null)

  const recentre = () => {
    const el = wrap.current, svg = svgRef.current, z = zoomRef.current
    if (!el || !svg || !z) return
    const { width, height } = el.getBoundingClientRect()
    let k = width < 640 ? 0.5 : width < 1000 ? 0.68 : 0.8
    if (targets) {
      // mind map: fit the outer ring (plus room for labels) inside the frame
      const reach = Math.max(120, ...Object.values(targets).map((t) => Math.max(Math.abs(t.x) + 150, Math.abs(t.y) + 50)))
      k = Math.min(1.25, Math.min(width, height * 1.5) / (2 * reach), height / (2 * (Math.max(...Object.values(targets).map((t) => Math.abs(t.y))) + 110)))
    }
    select(svg).call(z.transform, zoomIdentity.translate(width / 2, height / 2).scale(k))
  }
  const zoomBy = (f: number) => { const svg = svgRef.current, z = zoomRef.current; if (svg && z) select(svg).call(z.scaleBy, f) }

  // pan + zoom. Plain mouse-wheel is left alone so the page still scrolls;
  // zoom with pinch, ctrl + wheel, or the buttons.
  useEffect(() => {
    const svg = select(svgRef.current!)
    const z = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3.5])
      .filter((e: any) => (e.type === 'wheel' ? e.ctrlKey : !e.button))
      .on('zoom', (e) => { select(gRef.current).attr('transform', e.transform.toString()); svg.classed('is-zoomed', e.transform.k > 1.3) })
    svg.call(z).on('dblclick.zoom', null)
    zoomRef.current = z
    recentre()
    const ro = new ResizeObserver(() => recentre())
    ro.observe(wrap.current!)
    return () => { ro.disconnect(); svg.on('.zoom', null) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => { recentre() }, [resetKey, targets]) // eslint-disable-line react-hooks/exhaustive-deps

  // data -> DOM + simulation
  useEffect(() => {
    const reduced = prefersReducedMotion()
    const ns: SNode[] = nodes.map((n) => ({ ...n, ...(pos.current.get(n.id) ?? { x: (Math.random() - 0.5) * 60, y: (Math.random() - 0.5) * 60 }) }))
    const byId = new Map(ns.map((n) => [n.id, n]))
    const ls = links.filter((l) => byId.has(l.source) && byId.has(l.target)).map((l) => ({ source: byId.get(l.source)!, target: byId.get(l.target)! }))
    const g = select(gRef.current!)

    const link = g.select('.g-links').selectAll<SVGLineElement, (typeof ls)[number]>('line')
      .data(ls, (d) => d.source.id + '>' + d.target.id)
      .join((enter) => enter.append('line').attr('class', 'g-link').style('animation-delay', (_, i) => `${Math.min(i * 12, 600)}ms`))

    const node = g.select('.g-nodes').selectAll<SVGGElement, SNode>('g.g-node')
      .data(ns, (d) => d.id)
      .join((enter) => {
        const e = enter.append('g').attr('tabindex', 0).attr('role', 'button').style('animation-delay', (_, i) => `${Math.min(i * 18, 800)}ms`)
        e.append('circle').attr('class', 'g-halo')
        e.append('circle').attr('class', 'g-core')
        e.append('circle').attr('class', 'g-shine')
        e.append('text').attr('class', 'g-label')
        return e
      })
    node
      .attr('class', (d) => `g-node g-node--${d.type}${d.showLabel ? ' show-label' : ''}`)
      .attr('aria-label', (d) => `${d.label}${d.sub ? ', ' + d.sub : ''}`)
      .attr('data-cursor', (d) => CURSOR[d.type])
      .attr('data-id', (d) => d.id)
      .style('--c', (d) => d.color ?? null)
    node.select('.g-halo').attr('r', (d) => d.r + 9)
    node.select('.g-core').attr('r', (d) => d.r)
    node.select('.g-shine').attr('r', (d) => d.r * 0.34).attr('cx', (d) => -d.r * 0.3).attr('cy', (d) => -d.r * 0.32)
    node.select<SVGTextElement>('.g-label').text((d) => d.label).each(function (d) {
      const t = targets?.[d.id]
      const el = select(this)
      // mind-map: labels sit on the outer side of each node so they never collide with the lines
      if (t && Math.abs(t.x) > 70) el.attr('text-anchor', t.x > 0 ? 'start' : 'end').attr('x', (t.x > 0 ? 1 : -1) * (d.r + 8)).attr('y', 4)
      else el.attr('text-anchor', 'middle').attr('x', 0).attr('y', t && t.y < -20 ? -(d.r + 8) : d.r + 15)
    })
    node
      .on('click', (_, d) => cb.current(d))
      .on('keydown', (e: KeyboardEvent, d) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cb.current(d) } })
      .on('pointerenter focus', function (e: PointerEvent | FocusEvent, d) {
        const w = wrap.current!.getBoundingClientRect(), b = (this as SVGGElement).getBoundingClientRect()
        setTip({ x: b.left + b.width / 2 - w.left, y: b.top - w.top, n: d })
        void e
      })
      .on('pointerleave blur', () => setTip(null))

    const ticked = () => {
      link.attr('x1', (d) => d.source.x).attr('y1', (d) => d.source.y).attr('x2', (d) => d.target.x).attr('y2', (d) => d.target.y)
      node.attr('transform', (d) => `translate(${d.x.toFixed(1)},${d.y.toFixed(1)})`)
      for (const n of ns) pos.current.set(n.id, { x: n.x, y: n.y })
    }

    simRef.current?.stop()
    const sim = forceSimulation<SNode>(ns).alphaDecay(0.035).velocityDecay(0.45)
    if (targets) {
      sim.force('x', forceX<SNode>((d) => targets[d.id]?.x ?? 0).strength(0.22))
        .force('y', forceY<SNode>((d) => targets[d.id]?.y ?? 0).strength(0.22))
        .force('collide', forceCollide<SNode>((d) => d.r + 4))
    } else {
      sim.force('link', forceLink(ls).distance((l) => 46 + l.source.r + l.target.r).strength(0.55))
        .force('charge', forceManyBody<SNode>().strength((d) => -90 - d.r * 16))
        .force('x', forceX<SNode>(0).strength(0.06))
        .force('y', forceY<SNode>(0).strength(0.11))
        .force('collide', forceCollide<SNode>((d) => d.r + 12))
    }
    sim.on('tick', ticked)
    if (reduced) { sim.stop(); sim.tick(260); ticked() }
    simRef.current = sim

    node.call(
      drag<SVGGElement, SNode>()
        .on('start', (e, d) => { if (!e.active) sim.alphaTarget(0.25).restart(); d.fx = d.x; d.fy = d.y })
        .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; if (reduced) { d.x = e.x; d.y = e.y; ticked() } })
        .on('end', (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null }),
    )
    return () => { sim.stop() }
  }, [nodes, links, targets])

  // focus + search highlighting
  useEffect(() => {
    const g = select(gRef.current!)
    const near = new Set<string>()
    if (focusId) { near.add(focusId); for (const l of links) { if (l.source === focusId) near.add(l.target); if (l.target === focusId) near.add(l.source) } }
    g.selectAll<SVGGElement, SNode>('g.g-node')
      .classed('is-focus', (d) => d.id === focusId)
      .classed('is-near', (d) => near.has(d.id))
      .classed('is-match', (d) => !!matchIds?.has(d.id))
      .classed('is-dim', (d) => (matchIds ? !matchIds.has(d.id) : !targets && !!focusId && !near.has(d.id)))
    g.selectAll<SVGLineElement, { source: SNode; target: SNode }>('line.g-link')
      .classed('is-lit', (d) => !!focusId && (d.source.id === focusId || d.target.id === focusId))
      .classed('is-dim', (d) => (matchIds ? !(matchIds.has(d.source.id) && matchIds.has(d.target.id)) : !targets && !!focusId && d.source.id !== focusId && d.target.id !== focusId))
  }, [focusId, matchIds, nodes, links, targets])

  return (
    <div ref={wrap} className={`graph ${targets ? 'graph--map' : ''}`}>
      <svg ref={svgRef} className="graph-svg" role="group" aria-label={ariaLabel} data-cursor="DRAG">
        <g ref={gRef}>
          <g className="g-links" />
          <g className="g-nodes" />
        </g>
      </svg>
      {tip && (
        <div className="graph-tip" style={{ left: tip.x, top: tip.y }} role="tooltip">
          <strong>{tip.n.label}</strong>
          {tip.n.sub && <span>{tip.n.sub}</span>}
        </div>
      )}
      <div className="graph-ctrl">
        <button className="icon-btn" onClick={() => zoomBy(1.35)} aria-label="Zoom in"><Plus size={18} /></button>
        <button className="icon-btn" onClick={() => zoomBy(1 / 1.35)} aria-label="Zoom out"><Minus size={18} /></button>
        <button className="icon-btn" onClick={recentre} aria-label="Reset view"><RotateCcw size={16} /></button>
      </div>
      <p className="graph-hint">Drag to pan · pinch or use + / − to zoom · drag a node to move it</p>
    </div>
  )
}
