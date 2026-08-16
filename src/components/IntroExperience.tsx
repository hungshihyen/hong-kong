import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Plane } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import '../intro.css'

type IntroExperienceProps = {
  onComplete: () => void
  mapSrc: string
}

type Point = [number, number]
type FlightPath = {
  start: Point
  controlOne: Point
  controlTwo: Point
  end: Point
}
type MapLayout = { width: number; height: number; path: FlightPath }

const MAP_WIDTH = 1521
const MAP_HEIGHT = 732
const TAIWAN_MAP_POINT: Point = [1162, 244]
const HONG_KONG_MAP_POINT: Point = [250, 504]
const INTRO_MS = 7000
const REDUCED_MS = 900
const travelTags = [
  ['🎂', 'Birthday'],
  ['🏰', 'Disney'],
  ['🚌', 'H2K'],
  ['🥧', 'Egg tart'],
] as const

function createFlightPath(start: Point, end: Point, mapHeight: number): FlightPath {
  const dx = end[0] - start[0]
  const dy = end[1] - start[1]
  const distance = Math.hypot(dx, dy) || 1
  const normal: Point = [-dy / distance, dx / distance]
  const arc = Math.min(distance * 0.25, mapHeight * 0.32)
  return {
    start,
    controlOne: [
      start[0] + dx * 0.3 + normal[0] * arc,
      start[1] + dy * 0.3 + normal[1] * arc,
    ],
    controlTwo: [
      start[0] + dx * 0.72 + normal[0] * arc,
      start[1] + dy * 0.72 + normal[1] * arc,
    ],
    end,
  }
}

function createMapLayout(width: number, height: number): MapLayout {
  const scale = Math.min(width / MAP_WIDTH, height / MAP_HEIGHT)
  const renderedWidth = MAP_WIDTH * scale
  const renderedHeight = MAP_HEIGHT * scale
  const offsetX = (width - renderedWidth) / 2
  const offsetY = (height - renderedHeight) / 2
  const project = ([x, y]: Point): Point => [
    offsetX + x * scale,
    offsetY + y * scale,
  ]
  return {
    width,
    height,
    path: createFlightPath(
      project(TAIWAN_MAP_POINT),
      project(HONG_KONG_MAP_POINT),
      renderedHeight,
    ),
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

function createFlightFrames(path: FlightPath) {
  const x: number[] = []
  const y: number[] = []
  const rotate: number[] = []
  for (let index = 0; index <= 84; index += 1) {
    const linear = index / 84
    const progress = linear * linear * (3 - 2 * linear)
    const point = pointOnPath(path, progress)
    x.push(point[0])
    y.push(point[1])
    rotate.push(angleOnPath(path, progress))
  }
  return { x, y, rotate }
}

function pathData(path: FlightPath) {
  return [
    `M ${path.start[0]} ${path.start[1]}`,
    `C ${path.controlOne[0]} ${path.controlOne[1]}`,
    `${path.controlTwo[0]} ${path.controlTwo[1]}`,
    `${path.end[0]} ${path.end[1]}`,
  ].join(' ')
}

export default function IntroExperience({ onComplete, mapSrc }: IntroExperienceProps) {
  const reducedMotion = useReducedMotion() ?? false
  const onCompleteRef = useRef(onComplete)
  const completedRef = useRef(false)
  const timerRef = useRef<number | null>(null)
  const skipRef = useRef<HTMLButtonElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)
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
    if (!stage) return
    const render = () => {
      const bounds = stage.getBoundingClientRect()
      const next = createMapLayout(
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
  const route = useMemo(() => layout && pathData(layout.path), [layout])

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
          initial={{ opacity: 0, scale: reducedMotion ? 1 : 1.035 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reducedMotion ? 0.1 : 0.9, delay: reducedMotion ? 0 : 0.28 }}
        >
          <div ref={stageRef} className="intro-map-stage">
            <img className="intro-map-backdrop" src={mapSrc} alt="" />
            <img className="intro-map-image" src={mapSrc} alt="" />
            <div className="intro-map-compass"><span>N</span><i /></div>
            <span className="intro-map-scale">TAIWAN · HONG KONG</span>

            {layout && route && (
              <>
                <svg
                  className="intro-flight-route"
                  width={layout.width}
                  height={layout.height}
                  viewBox={`0 0 ${layout.width} ${layout.height}`}
                >
                  <path className="intro-flight-route__shadow" d={route} />
                  <motion.path
                    className="intro-flight-route__line"
                    d={route}
                    initial={{ pathLength: reducedMotion ? 1 : 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: reducedMotion ? 0.1 : 3.7, delay: reducedMotion ? 0.05 : 1.2, ease: 'easeInOut' }}
                  />
                </svg>

                <motion.div
                  className="intro-airport intro-airport--origin"
                  style={{ left: layout.path.start[0], top: layout.path.start[1] }}
                  initial={{ opacity: 0, scale: 0.72 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: reducedMotion ? 0.05 : 0.92 }}
                >
                  <span className="intro-airport__pulse" />
                  <span className="intro-airport__dot" />
                  <span className="intro-airport__label">
                    <strong>Taiwan</strong>
                    <small>出發 · 25.0777° N</small>
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
                    <strong>Hong Kong</strong>
                    <small>抵達 · 22.3080° N</small>
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
                      x: { duration: 3.7, delay: 1.2, ease: 'linear' },
                      y: { duration: 3.7, delay: 1.2, ease: 'linear' },
                      rotate: { duration: 3.7, delay: 1.2, ease: 'linear' },
                      opacity: { duration: 3.7, delay: 1.2 },
                      scale: { duration: 3.7, delay: 1.2 },
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
