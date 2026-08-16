import { useCallback, useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import '../intro.css'

type IntroExperienceProps = {
  onComplete: () => void
  posterSrc: string
}

const travelStickers = [
  {
    icon: '🎂',
    eyebrow: 'AUG 27',
    label: 'BIRTHDAY',
    tone: 'red',
    tilt: -3,
  },
  {
    icon: '🏰',
    eyebrow: 'MAGIC DAY',
    label: 'DISNEY',
    tone: 'yellow',
    tilt: 2,
  },
  {
    icon: '🚌',
    eyebrow: 'NIGHT TOUR',
    label: 'H2K',
    tone: 'cream',
    tilt: -2,
  },
  {
    icon: '🥧',
    eyebrow: 'LAST BITE',
    label: '蛋撻 · 點心',
    tone: 'green',
    tilt: 3,
  },
] as const

/**
 * A self-contained opening sequence. The parent should render it inside
 * AnimatePresence so the outer exit animation can finish before unmounting.
 */
export default function IntroExperience({
  onComplete,
  posterSrc,
}: IntroExperienceProps) {
  const prefersReducedMotion = useReducedMotion() ?? false
  const onCompleteRef = useRef(onComplete)
  const hasCompletedRef = useRef(false)
  const timerRef = useRef<number | null>(null)
  const skipButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  const completeIntro = useCallback(() => {
    if (hasCompletedRef.current) return

    hasCompletedRef.current = true

    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }

    onCompleteRef.current()
  }, [])

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') completeIntro()
      if (event.key === 'Tab') {
        event.preventDefault()
        skipButtonRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    timerRef.current = window.setTimeout(
      completeIntro,
      prefersReducedMotion ? 900 : 7200,
    )

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousBodyOverflow

      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [completeIntro, prefersReducedMotion])

  return (
    <motion.div
      className={`intro-experience${prefersReducedMotion ? ' intro-experience--reduced' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="台灣飛往香港的生日旅行開場動畫"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: prefersReducedMotion ? 0.12 : 0.35, ease: 'easeOut' }}
    >
      <button
        ref={skipButtonRef}
        className="intro-skip"
        type="button"
        onClick={completeIntro}
        autoFocus
        aria-label="略過開場動畫"
      >
        <span>略過動畫</span>
        <span className="intro-skip__arrow" aria-hidden="true">
          →
        </span>
      </button>

      <div className="intro-texture" aria-hidden="true" />
      <div className="intro-sun" aria-hidden="true" />
      <div className="intro-star intro-star--one" aria-hidden="true">
        ✦
      </div>
      <div className="intro-star intro-star--two" aria-hidden="true">
        ✦
      </div>

      <div className="intro-shell" aria-hidden="true">
        <motion.header
          className="intro-heading"
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0.12 : 0.5,
            delay: prefersReducedMotion ? 0 : 0.18,
            ease: 'easeOut',
          }}
        >
          <p className="intro-kicker">AUG 26—29 · 2026</p>
          <h1 className="intro-title">
            <span>TAIWAN</span>
            <span className="intro-title__spark">✦</span>
            <span>HONG KONG</span>
          </h1>
          <p className="intro-subtitle">A LITTLE BIRTHDAY GETAWAY</p>
        </motion.header>

        <div className="intro-flight-stage">
          <div className="intro-cloud intro-cloud--one" />
          <div className="intro-cloud intro-cloud--two" />

          <div className="intro-location intro-location--origin">
            <span className="intro-location__code">TPE</span>
            <span className="intro-location__city">台灣·TAIWAN</span>
            <span className="intro-location__dot" />
          </div>

          <div className="intro-flight-track">
            <div className="intro-route-arc" />
            <div className="intro-plane-carrier">
              <span className="intro-plane">✈</span>
            </div>
          </div>

          <div className="intro-location intro-location--destination">
            <span className="intro-location__code">HKG</span>
            <span className="intro-location__city">香港·HONG KONG</span>
            <span className="intro-location__dot" />
          </div>
        </div>

        <div className="intro-stickers">
          {travelStickers.map((sticker, index) => (
            <motion.div
              className={`intro-sticker intro-sticker--${sticker.tone}`}
              key={sticker.label}
              initial={{
                opacity: 0,
                y: prefersReducedMotion ? 0 : 18,
                scale: prefersReducedMotion ? 1 : 0.78,
                rotate: prefersReducedMotion ? 0 : sticker.tilt * 2,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                rotate: sticker.tilt,
              }}
              transition={{
                duration: prefersReducedMotion ? 0.12 : 0.48,
                delay: prefersReducedMotion ? 0.04 : 4.25 + index * 0.14,
                ease: 'easeOut',
              }}
            >
              <span className="intro-sticker__icon">{sticker.icon}</span>
              <span className="intro-sticker__copy">
                <small>{sticker.eyebrow}</small>
                <strong>{sticker.label}</strong>
              </span>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="intro-arrival"
          initial={{
            opacity: 0,
            y: prefersReducedMotion ? 0 : 22,
            scale: prefersReducedMotion ? 1 : 0.96,
            filter: prefersReducedMotion ? 'blur(0px)' : 'blur(7px)',
          }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          transition={{
            duration: prefersReducedMotion ? 0.16 : 0.7,
            delay: prefersReducedMotion ? 0.08 : 5.05,
            ease: 'easeOut',
          }}
        >
          <div className="intro-poster-frame">
            <img
              className="intro-poster"
              src={posterSrc}
              alt=""
              loading="eager"
              fetchPriority="high"
              draggable={false}
            />
            <span className="intro-poster-frame__tape" />
          </div>

          <div className="intro-arrival__copy">
            <p>ARRIVED · HONG KONG</p>
            <h2>香港生日旅行</h2>
            <span>Next stop: good food, bright lights &amp; a little magic.</span>
          </div>
        </motion.div>
      </div>

      <div className="intro-progress" aria-hidden="true">
        <span />
      </div>
    </motion.div>
  )
}
