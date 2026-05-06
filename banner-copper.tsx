"use client"

import { useEffect, useState } from "react"
import { motion } from "motion/react"

// ─── Content ──────────────────────────────────────────────────────────────────
const LINES = ["SOLSTICE POWERS", "THE HIGHEST YIELD", "ON COPPER"]

// ─── Timing (ms) ──────────────────────────────────────────────────────────────
const ENTER_DONE_MS = 1000
const HOLD_MS       = 5500
const EXIT_MS       = 800

type Phase = "enter" | "hold" | "exit"

const EASE_OUT: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94]

export function BannerCopper() {
  const [phase, setPhase] = useState<Phase>("enter")
  const [cycle, setCycle] = useState(0)

  useEffect(() => {
    if (phase === "enter") {
      const id = setTimeout(() => setPhase("hold"), ENTER_DONE_MS)
      return () => clearTimeout(id)
    }
    if (phase === "hold") {
      const id = setTimeout(() => setPhase("exit"), HOLD_MS)
      return () => clearTimeout(id)
    }
    if (phase === "exit") {
      const id = setTimeout(() => {
        setCycle(c => c + 1)
        setPhase("enter")
      }, EXIT_MS + 100)
      return () => clearTimeout(id)
    }
  }, [phase])

  const show = phase === "enter" || phase === "hold"
  const exitTransition = { duration: EXIT_MS / 1000, ease: "easeIn" as const }

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ maxWidth: 1600, aspectRatio: "16 / 9" }}
    >
      {/* ── Background — fades in once, stays permanently ── */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: EASE_OUT }}
        style={{
          background:
            "linear-gradient(135deg, #f8a830 0%, #f5b068 18%, #f098be 52%, #ceb4ec 78%, #c2b0ee 100%)",
        }}
      />

      {/* ── Solstice ring — white, blurred, shimmer ── */}
      <motion.img
        src="/banner/solstice-ring.svg"
        alt=""
        aria-hidden
        className="absolute pointer-events-none select-none"
        style={{
          right: "-8%",
          top: "-10%",
          width: "65%",
          height: "120%",
          filter: "blur(6px) brightness(10)",
        }}
        animate={{
          opacity: [0.10, 0.20, 0.12, 0.22, 0.10],
          scale:   [1,    1.018, 0.996, 1.014, 1],
        }}
        transition={{ duration: 11, ease: "easeInOut", repeat: Infinity, repeatType: "loop" }}
      />

      {/* ── Logo — fades in and out with content ── */}
      <motion.div
        key={`logo-${cycle}`}
        className="absolute flex items-center justify-center"
        style={{ top: "9%", left: 0, right: 0 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: show ? 1 : 0 }}
        transition={show
          ? { duration: 0.55, delay: 0.25, ease: EASE_OUT }
          : exitTransition
        }
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/banner/logo.png"
          alt="Solstice"
          style={{
            height: "clamp(24px, 4.5vw, 72px)",
            width: "auto",
            display: "block",
          }}
        />
      </motion.div>

      {/* ── Headline — slides in from left, line by line ── */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ paddingTop: "6%" }}
      >
        {LINES.map((line, i) => (
          <motion.p
            key={`${i}-${cycle}`}
            className={`m-0 font-extrabold uppercase text-center ${i === 1 ? "text-white" : "text-[#010458]"}`}
            style={{
              fontSize: "clamp(28px, 7.5vw, 120px)",
              letterSpacing: "-0.01em",
              lineHeight: 1.15,
            }}
            initial={{ x: -70, opacity: 0 }}
            animate={
              show
                ? { x: 0, opacity: 1 }
                : { x: -40, opacity: 0 }
            }
            transition={
              show
                ? { duration: 0.55, delay: 0.08 + i * 0.16, ease: EASE_OUT }
                : { duration: EXIT_MS / 1000, ease: "easeIn" }
            }
          >
            {line}
          </motion.p>
        ))}
      </div>
    </div>
  )
}
