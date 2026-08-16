import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  geoGraticule,
  geoMercator,
  geoPath,
  type GeoPermissibleObjects,
  type GeoProjection,
} from 'd3-geo'
import { Plane } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { feature } from 'topojson-client'
import worldAtlas from 'world-atlas/land-110m.json'
import '../intro.css'

type IntroExperienceProps = {
  onComplete: () => void
  posterSrc: string
}

type Point = [number, number]
type FlightPath = {
  start: Point
  controlOne: Point
  controlTwo: Point
  end: Point
}
type MapLayout = { width: number; height: number; path: FlightPath }

const TPE: Point = [121.2328, 25.0777]
const HKG: Point = [113.9185, 22.308]
const INTRO_MS = 7000
const REDUCED_MS = 900
const viewport = {
  type: 'Feature',
  properties: null,
  geometry: {
    type: 'Polygon',
    coordinates: [[
      [111.1, 20.45],
      [111.1, 27.15],
      [123.55, 27.15],
      [123.55, 20.45],
      [111.1, 20.45],
    ]],
  },
} as const

const topology = worldAtlas as unknown as Parameters<typeof feature>[0]
const landObject = (
  worldAtlas as unknown as { objects: { land: unknown } }
).objects.land
const land = feature(topology, landObject as never)
const travelTags = [
  ['🎂', 'Birthday'],
  ['🏰', 'Disney'],
  ['🚌', 'H2K'],
  ['🥧', 'Egg tart'],
] as const

function projectPoint(projection: GeoProjection, point: Point): Point {
  const projected = projection(point)
  return projected ? [projected[0], projected[1]] : [0, 0]
}

function createFlightPath(start: Point, end: Point, height: number): FlightPath {
  const dx = end[0] - start[0]
  const dy = end[1] - start[1]
  const distance = Math.hypot(dx, dy) || 1
  const normal: Point = [-dy / distance, dx / distance]
  const arc = Math.min(distance * 0.3, height * 0.19)
  return {
    start,
    controlOne: [
      start[0] + dx * 0.28 + normal[0] * arc,
      start[1] + dy * 0.28 + normal[1] * arc,
    ],
    controlTwo: [
      start[0] + dx * 0.7 + normal[0] * arc,
      start[1] + dy * 0.7 + normal[1] * arc,
    ],
    end,
  }
}

function pointOnPath(path: FlightPath, t: number): Point {
  const u = 1 - t
  return [
    u ** 3 * path.start[0] +
      3 * u ** 2 * t * path.controlOne[0] +
      3 * u * t ** 2 * path.controlTwo[0] +
      t ** 3 * path.end[0],
    u ** 3 * path.start[1] +
      3 * u ** 2 * t * path.controlOne[1] +
      3 * u * t ** 2 * path.controlTwo[1] +
      t ** 3 * path.end[1],
  ]
}

function angleOnPath(path: FlightPath, t: number) {
  const u = 1 - t
  const dx =
    3 * u ** 2 * (path.controlOne[0] - path.start[0]) +
    6 * u * t * (path.controlTwo[0] - path.controlOne[0]) +
    3 * t ** 2 * (path.end[0] - path.controlTwo[0])
  const dy =
    3 * u ** 2 * (path.controlOne[1] - path.start[1]) +
    6 * u * t * (path.controlTwo[1] - path.controlOne[1]) +
    3 * t ** 2 * (path.end[1] - path.controlTwo[1])
  return Math.atan2(dy, dx) * 180 / Math.PI
}

function drawLabel(
  context: CanvasRenderingContext2D,
  projection: GeoProjection,
  label: string,
  coordinates: Point,
  land = false,
) {
  const position = projection(coordinates)
  if (!position) return
  context.save()
  context.fillStyle = land
    ? 'rgba(31, 51, 48, .58)'
    : 'rgba(220, 230, 221, .48)'
  context.font = `${land ? '' : 'italic '}600 9px Inter, system-ui, sans-serif`
  context.textAlign = 'center'
  context.fillText(label, position[0], position[1])
  context.restore()
}

function paintMap(canvas: HTMLCanvasElement, width: number, height: number): MapLayout {
  const dpr = Math.min(window.devicePixelRatio || 1, 2.5)
  canvas.width = Math.max(1, Math.round(width * dpr))
  canvas.height = Math.max(1, Math.round(height * dpr))
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`

  const insetX = Math.max(18, Math.min(54, width * 0.055))
  const insetY = Math.max(18, Math.min(48, height * 0.09))
  const projection = geoMercator()
    .fitExtent(
      [[insetX, insetY], [width - insetX, height - insetY]],
      viewport as unknown as GeoPermissibleObjects,
    )
    .clipExtent([[0, 0], [width, height]])
  const flightPath = createFlightPath(
    projectPoint(projection, TPE),
    projectPoint(projection, HKG),
    height,
  )
  const context = canvas.getContext('2d')
  if (!context) return { width, height, path: flightPath }

  context.setTransform(dpr, 0, 0, dpr, 0, 0)
  context.clearRect(0, 0, width, height)
  const ocean = context.createLinearGradient(0, 0, width, height)
  ocean.addColorStop(0, '#0c2f42')
  ocean.addColorStop(1, '#071d2c')
  context.fillStyle = ocean
  context.fillRect(0, 0, width, height)

  const path = geoPath(projection, context)
  const graticule = geoGraticule()
    .extent([[111, 20], [124, 28]])
    .step([2, 2])()
  context.beginPath()
  path(graticule)
  context.strokeStyle = 'rgba(172, 201, 205, .14)'
  context.lineWidth = 0.7
  context.setLineDash([2, 5])
  context.stroke()

  context.beginPath()
  path(land)
  context.fillStyle = '#d9d4bd'
  context.fill()
  context.strokeStyle = 'rgba(252, 244, 218, .55)'
  context.lineWidth = 0.75
  context.setLineDash([])
  context.stroke()

  drawLabel(context, projection, 'GUANGDONG', [113.5, 24.4], true)
  drawLabel(context, projection, 'TAIWAN', [121.05, 23.65], true)
  drawLabel(context, projection, 'TAIWAN STRAIT', [118.2, 23.35])
  drawLabel(context, projection, 'SOUTH CHINA SEA', [116.3, 20.9])

  context.beginPath()
  context.moveTo(flightPath.start[0], flightPath.start[1])
  context.bezierCurveTo(
    flightPath.controlOne[0],
    flightPath.controlOne[1],
    flightPath.controlTwo[0],
    flightPath.controlTwo[1],
    flightPath.end[0],
    flightPath.end[1],
  )
  context.strokeStyle = 'rgba(255, 231, 172, .5)'
  context.lineWidth = width < 520 ? 1.25 : 1.6
  context.lineCap = 'round'
  context.setLineDash(width < 520 ? [3, 6] : [4, 8])
  context.stroke()

  return { width, height, path: flightPath }
}

function createFlightFrames(path: FlightPath) {
  const x: number[] = []
  const y: number[] = []
  const rotate: number[] = []
  for (let index = 0; index <= 72; index += 1) {
    const linear = index / 72
    const progress = linear * linear * (3 - 2 * linear)
    const point = pointOnPath(path, progress)
    x.push(point[0])
    y.push(point[1])
    rotate.push(angleOnPath(path, progress))
  }
  return { x, y, rotate }
}

export default function IntroExperience({ onComplete }: IntroExperienceProps) {
  const reducedMotion = useReducedMotion() ?? false
  const onCompleteRef = useRef(onComplete)
  const completedRef = useRef(false)
  const timerRef = useRef<number | null>(null)
  const skipRef = useRef<HTMLButtonElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [layout, setLayout] = useState<MapLayout | null>(null)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  const complete = useCallback(() => {
    if (completedRef.current) return
    completedRef.current = true
    if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    onCompleteRef.current()
  }, [])

  useEffect(() => {
    const oldOverflow = document.body.style.overflow
    const previousFocus = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        complete()
      } else if (event.key === 'Tab') {
        event.preventDefault()
        skipRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKey)
    skipRef.current?.focus()
    timerRef.current = window.setTimeout(
      complete,
      reducedMotion ? REDUCED_MS : INTRO_MS,
    )
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = oldOverflow
      previousFocus?.focus?.()
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    }
  }, [complete, reducedMotion])

  useLayoutEffect(() => {
    const stage = stageRef.current
    const canvas = canvasRef.current
    if (!stage || !canvas) return
    const render = () => {
      const bounds = stage.getBoundingClientRect()
      const next = paintMap(
        canvas,
        Math.max(1, Math.round(bounds.width)),
        Math.max(1, Math.round(bounds.height)),
      )
      setLayout((current) =>
        current?.width === next.width && current.height === next.height
          ? current
          : next,
      )
    }
    const observer = new ResizeObserver(render)
    observer.observe(stage)
    window.addEventListener('resize', render)
    render()
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', render)
    }
  }, [])

  const frames = useMemo(() => layout && createFlightFrames(layout.path), [layout])
  const staticPlane = useMemo(
    () => layout && pointOnPath(layout.path, 0.58),
    [layout],
  )

  return (
    <motion.div
      className={`intro-experience${reducedMotion ? ' intro-experience--reduced' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="台灣飛往香港的生日旅行開場動畫"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0.12 : 0.35 }}
    >
      <button
        ref={skipRef}
        className="intro-skip"
        type="button"
        onClick={complete}
        aria-label="略過開場動畫"
      >
        略過動畫 <span aria-hidden="true">→</span>
      </button>

      <div className="intro-ambient" aria-hidden="true" />
      <div className="intro-shell" aria-hidden="true">
        <motion.header
          className="intro-heading"
          initial={{ opacity: 0, y: reducedMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0.1 : 0.55, delay: reducedMotion ? 0 : 0.14 }}
        >
          <p>AUG 26—29 · 2026</p>
          <h1>TAIWAN <span>→</span> HONG KONG</h1>
        </motion.header>

        <motion.div
          className="intro-map-panel"
          initial={{ opacity: 0, scale: reducedMotion ? 1 : 1.045 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reducedMotion ? 0.1 : 0.9, delay: reducedMotion ? 0 : 0.28 }}
        >
          <div ref={stageRef} className="intro-map-stage">
            <canvas ref={canvasRef} className="intro-map-canvas" />
            <div className="intro-map-compass"><span>N</span><i /></div>
            <span className="intro-map-scale">300 KM</span>

            {layout && (
              <>
                <motion.div
                  className="intro-airport intro-airport--origin"
                  style={{ left: layout.path.start[0], top: layout.path.start[1] }}
                  initial={{ opacity: 0, scale: 0.72 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: reducedMotion ? 0.05 : 0.95 }}
                >
                  <span className="intro-airport__pulse" />
                  <span className="intro-airport__dot" />
                  <span className="intro-airport__label">
                    <strong>Taipei / TPE</strong>
                    <small>25.0777° N · 121.2328° E</small>
                  </span>
                </motion.div>

                <motion.div
                  className="intro-airport intro-airport--destination"
                  style={{ left: layout.path.end[0], top: layout.path.end[1] }}
                  initial={{ opacity: 0, scale: 0.72 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: reducedMotion ? 0.08 : 4.82 }}
                >
                  <span className="intro-airport__pulse" />
                  <span className="intro-airport__dot" />
                  <span className="intro-airport__label">
                    <strong>Hong Kong / HKG</strong>
                    <small>22.3080° N · 113.9185° E</small>
                  </span>
                </motion.div>

                {frames && staticPlane && (
                  <motion.div
                    className="intro-plane-motion"
                    initial={{
                      x: reducedMotion ? staticPlane[0] : frames.x[0],
                      y: reducedMotion ? staticPlane[1] : frames.y[0],
                      rotate: reducedMotion ? angleOnPath(layout.path, 0.58) : frames.rotate[0],
                      opacity: 0,
                      scale: 0.82,
                    }}
                    animate={reducedMotion ? {
                      x: staticPlane[0],
                      y: staticPlane[1],
                      rotate: angleOnPath(layout.path, 0.58),
                      opacity: 1,
                      scale: 1,
                    } : {
                      x: frames.x,
                      y: frames.y,
                      rotate: frames.rotate,
                      opacity: [0, 1, 1, 1],
                      scale: [0.82, 1, 1, 0.92],
                    }}
                    transition={reducedMotion ? { duration: 0.12, delay: 0.12 } : {
                      x: { duration: 3.6, delay: 1.34, ease: 'linear' },
                      y: { duration: 3.6, delay: 1.34, ease: 'linear' },
                      rotate: { duration: 3.6, delay: 1.34, ease: 'linear' },
                      opacity: { duration: 3.6, delay: 1.34 },
                      scale: { duration: 3.6, delay: 1.34 },
                    }}
                  >
                    <span className="intro-plane__trail" />
                    <span className="intro-plane__halo" />
                    <Plane className="intro-plane__icon" size={34} strokeWidth={1.75} />
                  </motion.div>
                )}

                <div
                  className="intro-travel-tags"
                  style={{ left: layout.path.end[0], top: layout.path.end[1] }}
                >
                  {travelTags.map(([icon, label], index) => (
                    <motion.span
                      className="intro-travel-tag"
                      key={label}
                      initial={{ opacity: 0, y: reducedMotion ? 0 : 9, scale: reducedMotion ? 1 : 0.86 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: reducedMotion ? 0.08 : 0.34, delay: reducedMotion ? 0.16 : 5.18 + index * 0.11 }}
                    >
                      <span>{icon}</span>{label}
                    </motion.span>
                  ))}
                </div>
              </>
            )}
          </div>
        </motion.div>

        <motion.div
          className="intro-finale"
          initial={{ opacity: 0, y: reducedMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0.1 : 0.55, delay: reducedMotion ? 0.2 : 5.72 }}
        >
          <span>ARRIVED IN HONG KONG</span>
          <strong>香港生日旅行</strong>
        </motion.div>
      </div>

      <div className="intro-progress" aria-hidden="true"><span /></div>
    </motion.div>
  )
}
