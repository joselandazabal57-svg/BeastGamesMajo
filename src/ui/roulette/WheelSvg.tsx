/**
 * WheelSvg — the Ruleta Bestial wheel (T04 §B.5.3).
 *
 * - 8 EQUAL 45° wedges (probability lives in spin(), not in wedge size).
 * - Outer 10px gold ring with 16 marquee bulbs (off when no spins).
 * - Fixed gold needle at 12 o'clock pointing down — the WHEEL rotates.
 * - 64px center medallion (Bengala 🐯 placeholder).
 * - Dimmed to 60% when no spins are available.
 *
 * The rotation is controlled by the parent: the outcome is decided BEFORE
 * animating and the wheel lands exactly on the winning segment.
 */

'use client';

import { motion } from 'framer-motion';
import { SEGMENTS } from '@/domain/roulette/wheel';

const SIZE = 400; // viewBox
const CX = SIZE / 2;
const CY = SIZE / 2;
const WEDGE_R = 172;
const RING_R = 183;
const BULB_R = 4; // 8px diameter
const SWEEP = 360 / SEGMENTS.length; // 45°

/** Point on a circle: angle in degrees clockwise from 12 o'clock. */
function polar(r: number, deg: number): { x: number; y: number } {
  const rad = (deg * Math.PI) / 180;
  return { x: CX + r * Math.sin(rad), y: CY - r * Math.cos(rad) };
}

function wedgePath(index: number): string {
  const start = index * SWEEP;
  const end = start + SWEEP;
  const p1 = polar(WEDGE_R, start);
  const p2 = polar(WEDGE_R, end);
  return `M ${CX} ${CY} L ${p1.x} ${p1.y} A ${WEDGE_R} ${WEDGE_R} 0 0 1 ${p2.x} ${p2.y} Z`;
}

interface WheelSvgProps {
  /** Cumulative rotation in degrees (animated by framer-motion). */
  rotation: number;
  /** True while the spin animation runs. */
  spinning: boolean;
  /** True when there are no spins: 60% dim, bulbs off. */
  dimmed: boolean;
  /** Called when the rotation animation completes. */
  onSpinEnd?: () => void;
}

export function WheelSvg({ rotation, spinning, dimmed, onSpinEnd }: WheelSvgProps) {
  return (
    <div
      className="relative mx-auto select-none"
      style={{
        width: 'min(82vw, 380px)',
        height: 'min(82vw, 380px)',
        opacity: dimmed ? 0.6 : 1,
        transition: 'opacity .3s',
      }}
    >
      {/* Fixed needle — 28px gold triangle at top, pointing down. Does NOT rotate. */}
      <div
        className="absolute left-1/2 -translate-x-1/2 z-10"
        style={{ top: '-6px', filter: 'drop-shadow(0 3px 0 rgba(0,0,0,.6))' }}
        aria-hidden
      >
        <svg width="28" height="28" viewBox="0 0 28 28">
          <path d="M2 2 L26 2 L14 26 Z" fill="var(--color-gold)" stroke="#B35E00" strokeWidth="2" />
        </svg>
      </div>

      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-full" role="img" aria-label="Ruleta de premios">
        <defs>
          <linearGradient id="bestialGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFC300" />
            <stop offset="100%" stopColor="#FF9500" />
          </linearGradient>
        </defs>

        {/* Outer gold ring (static) */}
        <circle cx={CX} cy={CY} r={RING_R} fill="none" stroke="var(--color-gold)" strokeWidth="10" />

        {/* 16 marquee bulbs (static positions; alternate blink via two groups) */}
        {!dimmed ? (
          <>
            <motion.g
              animate={{ opacity: [1, 0.25, 1] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
            >
              {Array.from({ length: 8 }, (_, i) => {
                const p = polar(RING_R, i * 45);
                return <circle key={`a${i}`} cx={p.x} cy={p.y} r={BULB_R} fill="#FFF6D8" />;
              })}
            </motion.g>
            <motion.g
              animate={{ opacity: [0.25, 1, 0.25] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
            >
              {Array.from({ length: 8 }, (_, i) => {
                const p = polar(RING_R, i * 45 + 22.5);
                return <circle key={`b${i}`} cx={p.x} cy={p.y} r={BULB_R} fill="#FFF6D8" />;
              })}
            </motion.g>
          </>
        ) : (
          Array.from({ length: 16 }, (_, i) => {
            const p = polar(RING_R, i * 22.5);
            return <circle key={i} cx={p.x} cy={p.y} r={BULB_R} fill="#FFF6D8" opacity={0.15} />;
          })
        )}

        {/* Rotating wheel */}
        <motion.g
          style={{ transformOrigin: `${CX}px ${CY}px` }}
          animate={{ rotate: rotation }}
          transition={
            spinning
              ? { duration: 3.5, ease: [0.12, 0.8, 0.2, 1] }
              : { duration: 0 }
          }
          onAnimationComplete={() => {
            if (spinning) onSpinEnd?.();
          }}
        >
          {SEGMENTS.map((seg, i) => (
            <path
              key={seg.id}
              d={wedgePath(i)}
              fill={seg.color}
              stroke="#0a0814"
              strokeWidth="2"
            />
          ))}

          {/* Wedge content: emoji + short label, rotated to face the center */}
          {SEGMENTS.map((seg, i) => {
            const centerAngle = i * SWEEP + SWEEP / 2;
            const emojiPos = polar(132, centerAngle);
            const labelPos = polar(92, centerAngle);
            return (
              <g key={`t-${seg.id}`}>
                <text
                  x={emojiPos.x}
                  y={emojiPos.y}
                  fontSize="28"
                  textAnchor="middle"
                  dominantBaseline="central"
                  transform={`rotate(${centerAngle} ${emojiPos.x} ${emojiPos.y})`}
                >
                  {seg.emoji}
                </text>
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  fontSize="13"
                  fontWeight="700"
                  fill="#ffffff"
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{
                    fontFamily: 'var(--font-body), system-ui, sans-serif',
                    paintOrder: 'stroke',
                    stroke: 'rgba(0,0,0,.55)',
                    strokeWidth: 3,
                  }}
                  transform={`rotate(${centerAngle} ${labelPos.x} ${labelPos.y})`}
                >
                  {seg.label}
                </text>
              </g>
            );
          })}
        </motion.g>

        {/* Center medallion — Bengala placeholder (static, above the wheel) */}
        <circle cx={CX} cy={CY} r={36} fill="var(--color-panel)" stroke="var(--color-gold)" strokeWidth="4" />
        <text x={CX} y={CY} fontSize="34" textAnchor="middle" dominantBaseline="central">
          🐯
        </text>
      </svg>
    </div>
  );
}
