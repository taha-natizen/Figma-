"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "motion/react"

// ─── Timing (ms) ──────────────────────────────────────────────────────────────
const COUNTER_START_MS = 0
const COUNTER_MS       = 1800
const HOLD_MS          = 6000
const FADE_MS          = 900

// ─── Helpers ──────────────────────────────────────────────────────────────────
function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t)
}

function fmtCount(v: number): string {
  return `$${Math.floor(v / 1_000_000)}M+`
}

const WATER: [number, number, number, number] = [0.16, 1, 0.3, 1]

type Phase = "enter" | "counter" | "done"

export function BannerLoopscale() {
  const [phase,       setPhase]       = useState<Phase>("enter")
  const [showCounter, setShowCounter] = useState(false)
  const [counterVal,  setCounterVal]  = useState(0)
  const [fading,      setFading]      = useState(false)
  const [cycle,       setCycle]       = useState(0)

  const rafRef   = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)

  // enter → show counter + start counting
  useEffect(() => {
    if (phase !== "enter") return
    const id = setTimeout(() => {
      setShowCounter(true)
      setPhase("counter")
    }, COUNTER_START_MS)
    return () => clearTimeout(id)
  }, [phase, cycle])

  // counter rAF
  useEffect(() => {
    if (phase !== "counter") return
    startRef.current = null
    const tick = (ts: number) => {
      if (startRef.current === null) startRef.current = ts
      const p = Math.min((ts - startRef.current) / COUNTER_MS, 1)
      setCounterVal(Math.round(easeOutQuad(p) * 20_000_000))
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setCounterVal(20_000_000)
        setPhase("done")
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current) }
  }, [phase])

  // done → fade → reset
  useEffect(() => {
    if (phase !== "done") return
    const t1 = setTimeout(() => setFading(true), HOLD_MS - FADE_MS)
    const t2 = setTimeout(() => {
      setShowCounter(false)
      setCounterVal(0)
      setPhase("enter")
      setCycle(c => c + 1)
      requestAnimationFrame(() => setFading(false))
    }, HOLD_MS)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [phase])

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ maxWidth: 1600, aspectRatio: "16 / 9" }}
    >

      {/* ── Background ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(130deg, #f59e50 0%, #f4a868 22%, #f09ac8 54%, #d8b4e8 80%, #ccb2ea 100%)",
        }}
      />

      {/* ── Wireframe ring — large, centered, gravitates ── */}
      <motion.img
        src="/banner/wireframe-right.svg"
        alt=""
        aria-hidden
        className="absolute pointer-events-none select-none"
        style={{
          left: "8%",
          top: "-8%",
          width: "84%",
          height: "116%",
          opacity: 0.68,
        }}
        animate={{ y: [0, -58, 0], x: [0, 10, 0] }}
        transition={{
          duration: 4.8,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "loop",
        }}
      />

      {/* ── Main content ── */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{
          paddingBottom: "6%",
          opacity: fading ? 0 : 1,
          transition: fading ? `opacity ${FADE_MS}ms ease` : "none",
        }}
      >

        {/* $20M+ */}
        <div style={{ position: "relative", textAlign: "center", lineHeight: 0.92 }}>
          {/* Ghost keeps layout height */}
          <p
            className="m-0 font-extrabold"
            style={{
              fontSize: "clamp(52px, 16vw, 256px)",
              letterSpacing: "-0.03em",
              lineHeight: 0.92,
              visibility: "hidden",
              whiteSpace: "nowrap",
            }}
          >
            $20M+
          </p>

          {/* Counter — only appears when showCounter fires */}
          {showCounter && (
            <motion.p
              key={`counter-${cycle}`}
              className="m-0 font-extrabold text-white"
              style={{
                fontSize: "clamp(52px, 16vw, 256px)",
                letterSpacing: "-0.03em",
                lineHeight: 0.92,
                position: "absolute",
                top: 0, left: 0, right: 0,
                whiteSpace: "nowrap",
              }}
              initial={{ opacity: 0, x: -70, filter: "blur(24px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.0, ease: WATER }}
            >
              {fmtCount(counterVal)}
            </motion.p>
          )}
        </div>

        {/* ON LOOPSCALE */}
        <motion.p
          key={`sub-${cycle}`}
          className="m-0 font-extrabold uppercase text-[#010458]"
          style={{
            fontSize: "clamp(28px, 9.5vw, 152px)",
            letterSpacing: "-0.02em",
            lineHeight: 1.0,
            textAlign: "center",
            whiteSpace: "nowrap",
          }}
          initial={{ opacity: 0, x: -80, filter: "blur(28px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.05, delay: 0.28, ease: WATER }}
        >
          ON LOOPSCALE
        </motion.p>

      </div>

      {/* ── Logos — always visible ── */}
      <div
        className="absolute flex items-center justify-center"
        style={{
          bottom: "10%",
          left: 0,
          right: 0,
          gap: "clamp(28px, 5.5vw, 88px)",
        }}
      >
        {/* Solstice */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/banner/logo.png"
          alt="Solstice"
          style={{
            height: "clamp(20px, 4.4vw, 70px)",
            width: "auto",
            display: "block",
          }}
        />

        {/* Loopscale — exact SVG from brand assets */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/banner7/loopscale-logo.svg"
          alt="Loopscale"
          style={{
            height: "clamp(16px, 3.2vw, 52px)",
            width: "auto",
            display: "block",
          }}
        />
      </div>

    </div>
  )
}
