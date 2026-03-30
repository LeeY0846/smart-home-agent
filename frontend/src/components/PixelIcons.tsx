import type { DeviceType } from '#/store/smartHomeStore'

type PixelMap = readonly string[]

interface PixelIconProps {
  map: PixelMap
  color: string
  size?: number
  className?: string
}

function PixelIcon({ map, color, size = 16, className }: PixelIconProps) {
  const rows = map.length
  const cols = Math.max(...map.map((r) => r.length))
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${cols} ${rows}`}
      className={className}
      style={{ imageRendering: 'pixelated', display: 'block', flexShrink: 0 }}
      aria-hidden="true"
    >
      {map.map((row, y) =>
        row.split('').map((cell, x) =>
          cell === '#' ? (
            <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={color} />
          ) : null,
        ),
      )}
    </svg>
  )
}

// ── Pixel maps (8×8) ─────────────────────────────────────────

const BULB_MAP = [
  '..####..',
  '.######.',
  '.######.',
  '.######.',
  '..####..',
  '...##...',
  '..####..',
  '...##...',
] as const

const SNOW_MAP = [
  '...#....',
  '.#.#.#..',
  '..###...',
  '#######.',
  '..###...',
  '.#.#.#..',
  '...#....',
  '........',
] as const

// Ceiling fan — four-blade top-down view
const FAN_MAP = [
  '...##...',
  '..####..',
  '.##..#..',
  '##....#.',
  '.#....##',
  '..#..##.',
  '..####..',
  '...##...',
] as const

// TV — wide screen with stand
const TV_MAP = [
  '########',
  '#......#',
  '#......#',
  '#......#',
  '#......#',
  '########',
  '...##...',
  '..####..',
] as const

// Refrigerator — tall box with door split and handle
const FRIDGE_MAP = [
  '.######.',
  '.#....#.',
  '.#.##.#.',
  '.#....#.',
  '.######.',
  '.#....#.',
  '.#....#.',
  '.######.',
] as const

// Speaker — circle grille with cabinet
const SPEAKER_MAP = [
  '..####..',
  '.######.',
  '##.##.##',
  '#.####.#',
  '#.####.#',
  '##.##.##',
  '.######.',
  '..####..',
] as const

// House — for chat empty state
const HOUSE_MAP = [
  '...##...',
  '..####..',
  '.######.',
  '########',
  '##.##.##',
  '##.##.##',
  '########',
  '###..###',
] as const

// ── Color map per device type ─────────────────────────────────

const ACCENT: Record<DeviceType, string> = {
  light: '#fbbf24',
  ac: '#7ec8e3',
  fan: '#a78bfa',
  tv: '#60a5fa',
  fridge: '#34d399',
  speaker: '#f472b6',
}

const MAP_FOR: Record<DeviceType, PixelMap> = {
  light: BULB_MAP,
  ac: SNOW_MAP,
  fan: FAN_MAP,
  tv: TV_MAP,
  fridge: FRIDGE_MAP,
  speaker: SPEAKER_MAP,
}

const DIM = '#3a3a5c'

// ── Exported components ───────────────────────────────────────

export function DeviceIcon({
  type,
  on,
  size = 16,
  className,
}: {
  type: DeviceType
  on: boolean
  size?: number
  className?: string
}) {
  return <PixelIcon map={MAP_FOR[type]} color={on ? ACCENT[type] : DIM} size={size} className={className} />
}

export function accentFor(type: DeviceType): string {
  return ACCENT[type]
}

export function LightBulbIcon({ size = 16, on = true }: { size?: number; on?: boolean }) {
  return <PixelIcon map={BULB_MAP} color={on ? ACCENT.light : DIM} size={size} />
}

export function SnowflakeIcon({ size = 16, on = true }: { size?: number; on?: boolean }) {
  return <PixelIcon map={SNOW_MAP} color={on ? ACCENT.ac : DIM} size={size} />
}

export function HouseIcon({ size = 16, color = DIM }: { size?: number; color?: string }) {
  return <PixelIcon map={HOUSE_MAP} color={color} size={size} />
}
