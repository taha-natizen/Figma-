"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "motion/react"

// ─── Content ──────────────────────────────────────────────────────────────────
const TITLE    = "USX KEEPS GROWING"
const SUBTITLE = "supplied on Kamino."
const COUNTER_MAX = 50_000_000

// ─── Timing ───────────────────────────────────────────────────────────────────
const CHAR_TITLE_MS   = 60    // ms per character — title
const CHAR_SUB_MS     = 48    // ms per character — subtitle
const SUBTITLE_LAG_MS = 450   // pause after title before subtitle starts
const COUNTER_LAG_MS  = 650   // pause after subtitle before counter fires
const COUNTER_MS      = 2600  // total counter run
const HOLD_MS         = 7500  // hold on final state before replay

// ─── Helpers ──────────────────────────────────────────────────────────────────
function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

function fmtCount(v: number): string {
  if (v === 0) return "0M"
  const m = v / 1_000_000
  if (m < 1)   return m.toFixed(1) + "M"
  if (m < 10)  return m.toFixed(1) + "M"
  return Math.floor(m) + "M"
}

// ─── Component ────────────────────────────────────────────────────────────────
type Phase = "title" | "subtitle" | "counter" | "done"

export function BannerGrowing() {
  const [phase,        setPhase]        = useState<Phase>("title")
  const [titleCount,   setTitleCount]   = useState(0)
  const [subCount,     setSubCount]     = useState(0)
  const [counterVal,   setCounterVal]   = useState(0)
  const [counterDone,  setCounterDone]  = useState(false)
  const [emphasize,    setEmphasize]    = useState(false)
  const [fading,       setFading]       = useState(false)
  const [blink,        setBlink]        = useState(true)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [cycle,        setCycle]        = useState(0)

  const rafRef   = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)

  // Cursor blink
  useEffect(() => {
    const id = setInterval(() => setBlink(v => !v), 530)
    return () => clearInterval(id)
  }, [])

  // Title typewriter
  useEffect(() => {
    if (phase !== "title") return
    if (titleCount < TITLE.length) {
      const id = setTimeout(() => setTitleCount(c => c + 1), CHAR_TITLE_MS)
      return () => clearTimeout(id)
    }
    const id = setTimeout(() => setPhase("subtitle"), SUBTITLE_LAG_MS)
    return () => clearTimeout(id)
  }, [phase, titleCount])

  // Subtitle typewriter
  useEffect(() => {
    if (phase !== "subtitle") return
    if (subCount < SUBTITLE.length) {
      const id = setTimeout(() => setSubCount(c => c + 1), CHAR_SUB_MS)
      return () => clearTimeout(id)
    }
    const id = setTimeout(() => setPhase("counter"), COUNTER_LAG_MS)
    return () => clearTimeout(id)
  }, [phase, subCount])

  // Counter (rAF + easeOutExpo)
  useEffect(() => {
    if (phase !== "counter") return
    startRef.current = null

    const tick = (ts: number) => {
      if (startRef.current === null) startRef.current = ts
      const p = Math.min((ts - startRef.current) / COUNTER_MS, 1)
      setCounterVal(Math.round(easeOutExpo(p) * COUNTER_MAX))
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setCounterVal(COUNTER_MAX)
        setCounterDone(true)
        setPhase("done")
        setTimeout(() => setEmphasize(true), 60)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current) }
  }, [phase])

  // Auto-replay — fade out text, then reset
  useEffect(() => {
    if (phase !== "done") return
    const t1 = setTimeout(() => setFading(true), HOLD_MS - 1000)
    const t2 = setTimeout(() => {
      // Reset while fading is still true → transition:"none" on counter → no flash
      setTitleCount(0)
      setSubCount(0)
      setCounterVal(0)
      setCounterDone(false)
      setEmphasize(false)
      setPhase("title")
      setCycle(c => c + 1)
      // Clear fading one frame later — counter is already opacity:0, no transition fires
      requestAnimationFrame(() => setFading(false))
    }, HOLD_MS)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [phase])

  // Cursor bar — colour depends on phase
  const cursorColor = phase === "title" ? "#010458" : "white"
  const blinkBar = (
    <span
      aria-hidden
      className="inline-block align-middle"
      style={{
        width: "0.04em",
        height: "0.82em",
        background: cursorColor,
        marginLeft: "0.05em",
        opacity: blink ? 1 : 0,
        transition: "opacity 60ms",
      }}
    />
  )

  const counterVisible = phase === "counter" || counterDone

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ maxWidth: 1600, aspectRatio: "16 / 9" }}
    >
      {/* ── Gradient background ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #f46208 0%, #f0922a 22%, #e8a0c0 54%, #b8b0e8 100%)",
        }}
      />

      {/* ── Blurred decorative rings (floating) ── */}
      <motion.img
        src="/banner/wireframe-right.svg"
        alt=""
        aria-hidden
        className="absolute pointer-events-none select-none"
        style={{
          right: "-5%",
          top: "-8%",
          width: "68%",
          height: "116%",
          opacity: 0.62,
          filter: "blur(1.5px)",
        }}
        animate={{ y: [0, -18, 0], x: [0, 6, 0] }}
        transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
      />

      {/* ── Centered content block ── */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ opacity: fading ? 0 : 1, transition: fading ? "opacity 0.9s ease" : "none" }}
      >

        {/* Title — ghost holds space, typed text overlays */}
        <div style={{ position: "relative", width: "100%", textAlign: "center" }}>
          <p
            className="m-0 font-extrabold uppercase text-[#010458]"
            style={{ fontSize: "clamp(22px, 5.5vw, 88px)", letterSpacing: "-0.01em", lineHeight: 1.1, visibility: "hidden", whiteSpace: "nowrap" }}
          >{TITLE}</p>
          <p
            className="m-0 font-extrabold uppercase text-[#010458]"
            style={{ fontSize: "clamp(22px, 5.5vw, 88px)", letterSpacing: "-0.01em", lineHeight: 1.1, position: "absolute", top: 0, left: 0, right: 0, whiteSpace: "nowrap" }}
          >
            {TITLE.substring(0, titleCount)}
            {phase === "title" && blinkBar}
          </p>
        </div>

        {/* Subtitle — ghost holds space, typed text overlays */}
        <div style={{ position: "relative", width: "100%", textAlign: "center" }}>
          <p
            className="m-0 font-normal text-[#010458]"
            style={{ fontSize: "clamp(14px, 3.75vw, 60px)", lineHeight: 1.3, visibility: "hidden", whiteSpace: "nowrap" }}
          >{SUBTITLE}</p>
          <p
            className="m-0 font-normal text-[#010458]"
            style={{ fontSize: "clamp(14px, 3.75vw, 60px)", lineHeight: 1.3, position: "absolute", top: 0, left: 0, right: 0, whiteSpace: "nowrap" }}
          >
            {SUBTITLE.substring(0, subCount)}
            {phase === "subtitle" && blinkBar}
          </p>
        </div>

        {/* Counter — ghost holds space, fades in */}
        <div style={{ position: "relative", width: "100%", textAlign: "center" }}>
          <p
            className="m-0 font-black text-white"
            style={{ fontSize: "clamp(52px, 16.875vw, 270px)", letterSpacing: "-0.04em", lineHeight: 0.9, visibility: "hidden", whiteSpace: "nowrap" }}
          >50M USX</p>
          <p
            className="m-0 font-black text-white"
            style={{
              fontSize: "clamp(52px, 16.875vw, 270px)",
              letterSpacing: "-0.04em",
              lineHeight: 0.9,
              position: "absolute", top: 0, left: 0, right: 0,
              whiteSpace: "nowrap",
              opacity: counterVisible ? 1 : 0,
              transition: fading ? "none" : "opacity 0.55s ease, transform 0.55s cubic-bezier(0.34,1.56,0.64,1), filter 0.55s ease",
              transform: emphasize ? "scale(1.045)" : "scale(1)",
              filter: emphasize ? "drop-shadow(0 0 50px rgba(255,255,255,0.55))" : "none",
            }}
          >
            {fmtCount(counterVal)} USX
          </p>
        </div>

      </div>

      {/* ── Logos — absolute, always static ── */}
      <div
        className="absolute flex justify-center"
        style={{
          bottom: "7%",
          left: 0,
          right: 0,
          alignItems: "center",
          gap: "clamp(20px, 3.5vw, 56px)",
          lineHeight: 1,
        }}
      >
        {/* Kamino text logo */}
        <span
          className="font-bold text-[#010458]"
          style={{
            fontSize: "clamp(16px, 3vw, 48px)",
            letterSpacing: "-0.02em",
            lineHeight: 1,
            display: "block",
            transform: "translateY(-0.12em)",
          }}
        >
          kamino
        </span>

        {/* Solstice logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/banner/logo.png"
          alt="Solstice"
          style={{
            filter: "brightness(0) invert(1)",
            height: "clamp(20px, 3.75vw, 60px)",
            width: "auto",
            display: "block",
          }}
        />
      </div>
    </div>
  )
}
