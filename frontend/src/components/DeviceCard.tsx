import { useCallback, useRef } from 'react'
import type { Device } from '#/store/smartHomeStore'
import { useStore } from '#/store/smartHomeStore'
import { DeviceIcon, accentFor } from './PixelIcons'

interface Props {
  device: Device
}

function useHoldRepeat(onTick: () => void) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const start = useCallback(() => {
    onTick()
    intervalRef.current = setInterval(onTick, 120)
  }, [onTick])

  const stop = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  return { start, stop }
}

function valueLabel(device: Device): string | null {
  if (device.value === undefined) return null
  switch (device.type) {
    case 'ac':
    case 'fridge':
      return `${device.value}\u00b0C`
    case 'fan':
      return `SPD ${device.value}`
    case 'speaker':
      return `VOL ${device.value}`
    default:
      return null
  }
}

export default function DeviceCard({ device }: Props) {
  const toggleDevice = useStore((s) => s.toggleDevice)
  const adjustValue = useStore((s) => s.adjustValue)
  const isOn = device.power === 'on'
  const accent = accentFor(device.type)

  const decrement = useCallback(() => adjustValue(device.name, -1), [adjustValue, device.name])
  const increment = useCallback(() => adjustValue(device.name, +1), [adjustValue, device.name])
  const dec = useHoldRepeat(decrement)
  const inc = useHoldRepeat(increment)

  return (
    <div
      className="px-shadow-sm flex items-center justify-between"
      style={{
        backgroundColor: 'var(--px-card)',
        border: `2px solid ${isOn ? accent : 'var(--px-border)'}`,
        padding: '8px 10px',
        minHeight: '44px',
      }}
    >
      {/* Icon + info */}
      <div className="flex items-center gap-3">
        <div style={{ opacity: isOn ? 1 : 0.3 }}>
          <DeviceIcon type={device.type} on={isOn} size={16} className="px-icon-card" />
        </div>

        <div className="flex flex-col gap-1">
          <span
            className="font-pixel"
            style={{ fontSize: 'var(--px-size-base)', color: 'var(--px-text)' }}
          >
            {device.label}
          </span>
          <div className="flex items-center gap-2">
            <span
              style={{
                display: 'inline-block',
                width: '4px',
                height: '4px',
                backgroundColor: isOn ? 'var(--px-green)' : 'var(--px-red)',
                boxShadow: isOn ? '0 0 4px var(--px-green)' : 'none',
              }}
            />
            <span
              className="font-pixel"
              style={{
                fontSize: 'var(--px-size-sm)',
                color: isOn ? 'var(--px-green)' : 'var(--px-red)',
              }}
            >
              {isOn ? 'ON' : 'OFF'}
            </span>
            {isOn && valueLabel(device) && (
              <>
                <span
                  className="font-pixel"
                  style={{ fontSize: 'var(--px-size-sm)', color: accent, marginLeft: '2px' }}
                >
                  {valueLabel(device)}
                </span>
                <button
                  className="px-btn"
                  onMouseDown={dec.start}
                  onMouseUp={dec.stop}
                  onMouseLeave={dec.stop}
                  style={{ padding: '2px 5px', fontSize: 'var(--px-size-sm)', lineHeight: 1 }}
                >
                  -
                </button>
                <button
                  className="px-btn"
                  onMouseDown={inc.start}
                  onMouseUp={inc.stop}
                  onMouseLeave={inc.stop}
                  style={{ padding: '2px 5px', fontSize: 'var(--px-size-sm)', lineHeight: 1 }}
                >
                  +
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Toggle */}
      <button
        className="px-btn"
        onClick={() => toggleDevice(device.name)}
        style={{
          backgroundColor: isOn ? '#1a1a2e' : accent,
          color: isOn ? 'var(--px-text-dim)' : '#0d0d1a',
          width: '4.5em',
          textAlign: 'center',
        }}
      >
        {isOn ? 'OFF' : 'ON'}
      </button>
    </div>
  )
}
