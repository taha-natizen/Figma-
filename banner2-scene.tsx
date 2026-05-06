"use client"

import { motion, AnimatePresence } from "motion/react"
import { useEffect, useState } from "react"
import Image from "next/image" // used for logo only

// ─── Content ─────────────────────────────────────────────────────────────────

type Segment = { chars: string; color: string }

const TITLE: Segment[][] = [
  [{ chars: "YOUR ", color: "#010458" }, { chars: "USX", color: "white" }],
  [{ chars: "CAN WORK", color: "#010458" }],
  [{ chars: "FOR YOU", color: "#010458" }],
]

const SUBTITLE = [
  "LOCKING USX PROVIDES ACCESS",
  "TO DELTA-NEUTRAL STRATEGIES",
]

// ─── Pre-compute stagger indices ──────────────────────────────────────────────

type LetterDatum = { char: string; color: string; i: number; lineIdx: number }
type WordDatum   = { word: string; i: number; lineIdx: number }

const LETTERS: LetterDatum[] = (() => {
  const acc: LetterDatum[] = []
  let i = 0
  TITLE.forEach((line, lineIdx) =>
    line.forEach(({ chars, color }) =>
      chars.split("").forEach(char => acc.push({ char, color, i: i++, lineIdx }))
    )
  )
  return acc
})()
const N = LETTERS.length

const SUBTITLE_WORDS: WordDatum[] = (() => {
  const acc: WordDatum[] = []
  let i = 0
  SUBTITLE.forEach((line, lineIdx) =>
    line.split(" ").forEach(word => acc.push({ word, i: i++, lineIdx }))
  )
  return acc
})()
const NW = SUBTITLE_WORDS.length

// ─── Orbit config ─────────────────────────────────────────────────────────────

const ORBIT_N        = 6
const ORBIT_DURATION = 12   // seconds per full revolution

// ─── Timing (ms) ──────────────────────────────────────────────────────────────

const T_TEXT_EXIT   = 6000
const T_COINS_IN    = 7200
const T_COINS_OUT   = 15200
const T_NEXT_CYCLE  = 16400  // after coins fully fade (800ms transition)

// ─── Main scene ───────────────────────────────────────────────────────────────

export function Banner2Scene() {
  const [textPhase, setTextPhase] = useState<"show" | "exit" | "done">("show")
  const [showCoins, setShowCoins]  = useState(false)
  const [cycle, setCycle]          = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setTextPhase("exit"), T_TEXT_EXIT)
    const t2 = setTimeout(() => { setTextPhase("done"); setShowCoins(true) }, T_COINS_IN)
    const t3 = setTimeout(() => setShowCoins(false), T_COINS_OUT)
    const t4 = setTimeout(() => { setTextPhase("show"); setCycle(c => c + 1) }, T_NEXT_CYCLE)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [cycle])

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ maxWidth: 1600, aspectRatio: "16 / 9" }}
    >
      <Image src="/banner2/background.png" alt="" fill priority style={{ objectFit: "fill" }} />


{/* ── Animated text ── */}
      {textPhase !== "done" && (
        <TextBlock phase={textPhase} />
      )}

      {/* ── Coin orbit ── */}
      <AnimatePresence>
        {showCoins && <CoinOrbit key={cycle} />}
      </AnimatePresence>

      {/* ── Solstice logo (static top-right) ── */}
      <div
        className="absolute"
        style={{ top: "9.67%", left: "79.56%", width: "13.19%", height: "6.89%" }}
      >
        <Image
          src="/banner/logo.png"
          alt="Solstice"
          fill
          style={{ objectFit: "contain", objectPosition: "left center" }}
        />
      </div>
    </div>
  )
}

// ─── Text block ───────────────────────────────────────────────────────────────

function TextBlock({ phase }: { phase: "show" | "exit" }) {
  const entering = phase === "show"

  return (
    <div
      className="absolute flex flex-col"
      style={{ left: "7.19%", top: "50%", transform: "translateY(-50%)", width: "76.44%" }}
    >
      {/* Title — letter by letter */}
      {[0, 1, 2].map(lineIdx => (
        <div key={lineIdx} className="flex flex-wrap" style={{ lineHeight: 1.1 }}>
          {LETTERS.filter(l => l.lineIdx === lineIdx).map(({ char, color, i }) => (
            <motion.span
              key={i}
              className="inline-block"
              style={{
                color,
                whiteSpace: "pre",
                fontSize: "clamp(28px, 6.875vw, 110px)",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
              initial={{ y: 16, opacity: 0 }}
              animate={entering ? { y: 0, opacity: 1 } : { y: -16, opacity: 0 }}
              transition={
                entering
                  ? { ease: "easeOut", duration: 0.45, delay: i * 0.04 }
                  : { ease: "easeIn",  duration: 0.30, delay: (N - 1 - i) * 0.022 }
              }
            >
              {char}
            </motion.span>
          ))}
        </div>
      ))}

      {/* Subtitle — word by word */}
      <div style={{ marginTop: "0.35em" }}>
        {[0, 1].map(lineIdx => (
          <div key={lineIdx} className="flex flex-wrap" style={{ gap: "0 1.2em" }}>
            {SUBTITLE_WORDS.filter(w => w.lineIdx === lineIdx).map(({ word, i }) => (
              <motion.span
                key={i}
                className="inline-block"
                style={{
                  color: "#010458",
                  fontSize: "clamp(14px, 2.8125vw, 45px)",
                  fontWeight: 500,
                  lineHeight: 1.303,
                  textTransform: "uppercase",
                }}
                initial={{ y: 10, opacity: 0 }}
                animate={entering ? { y: 0, opacity: 1 } : { y: -10, opacity: 0 }}
                transition={
                  entering
                    ? { ease: "easeOut", duration: 0.4, delay: N * 0.04 + i * 0.06 }
                    : { ease: "easeIn",  duration: 0.25, delay: (NW - 1 - i) * 0.04 }
                }
              >
                {word}
              </motion.span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Coin orbit ───────────────────────────────────────────────────────────────

const USX_SIZE  = "12%"   // center coin diameter
const RING_SIZE = "62%"   // orbit ring diameter
const COIN_SIZE = "28%"   // eUSX coin as % of ring — no overlap for 6 coins

function CoinOrbit() {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >

      {/* eUSX — center, scales in then spins */}
      <motion.div
        className="absolute z-10"
        style={{ width: USX_SIZE, aspectRatio: "1" }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, rotate: 360 }}
        transition={{
          scale:   { duration: 0.55, ease: "backOut" },
          opacity: { duration: 0.4 },
          rotate:  { duration: 5, ease: "linear", repeat: Infinity, repeatType: "loop" },
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/banner2/eusx-coin.svg" alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      </motion.div>

      {/* Orbit ring — rotates continuously */}
      <motion.div
        className="absolute"
        style={{ width: RING_SIZE, aspectRatio: "1" }}
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: ORBIT_DURATION, ease: "linear", repeat: Infinity, repeatType: "loop" }}
      >
        {/* Dashed lines: center coin edge → orbiting coin edge */}
        <svg className="absolute inset-0" viewBox="0 0 100 100" style={{ overflow: "visible", pointerEvents: "none" }}>
          {Array.from({ length: ORBIT_N }, (_, i) => {
            const a = (i / ORBIT_N) * 2 * Math.PI
            // 9.7 = center coin radius in ring coords (12/62*100/2)
            // 19  = orbiting coin near edge (33 - 14), distance from ring center
            const x1 = 50 + 9.7 * Math.sin(a)
            const y1 = 50 - 9.7 * Math.cos(a)
            const x2 = 50 + 19  * Math.sin(a)
            const y2 = 50 - 19  * Math.cos(a)
            return (
              <motion.line
                key={i}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="white"
                strokeWidth="0.5"
                strokeDasharray="2 2"
                strokeOpacity="0.6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, strokeDashoffset: [0, -4] }}
                transition={{
                  opacity: { delay: 0.6 + i * 0.18, duration: 0.4 },
                  strokeDashoffset: { duration: 0.6, ease: "linear", repeat: Infinity, repeatType: "loop" },
                }}
              />
            )
          })}
        </svg>

        {Array.from({ length: ORBIT_N }, (_, i) => {
          const angleDeg = (i / ORBIT_N) * 360
          return (
            <motion.div
              key={i}
              className="absolute inset-0 flex justify-center"
              style={{ rotate: angleDeg, alignItems: "flex-start" }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.18, duration: 0.4, ease: "easeOut" }}
            >
              {/* Counter-rotate so coin stays upright */}
              <motion.div
                style={{ width: COIN_SIZE, aspectRatio: "1", marginTop: "3%" }}
                animate={{ rotate: -360 }}
                transition={{ duration: ORBIT_DURATION, ease: "linear", repeat: Infinity, repeatType: "loop" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/banner2/usx-coin.svg" alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </motion.div>
            </motion.div>
          )
        })}
      </motion.div>
    </motion.div>
  )
}
