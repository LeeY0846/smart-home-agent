import { useStore } from '#/store/smartHomeStore'
import type { Device } from '#/store/smartHomeStore'
import { DeviceIcon, accentFor } from './PixelIcons'

const SHORT_LABEL: Record<string, string> = {
  'kitchen-light': 'LIGHT',
  'kitchen-fridge': 'FRDGE',
  'kitchen-exhaust': 'FAN',
  'living-room-ac': 'A/C',
  'living-room-tv': 'TV',
  'living-room-speaker': 'SPKR',
  'master-bedroom-ac': 'A/C',
  'master-bedroom-light': 'LAMP',
  'master-bedroom-fan': 'FAN',
}

function roomGlow(devices: Device[]): string | undefined {
  const hasLight = devices.some((d) => d.type === 'light' && d.power === 'on')
  const hasAc = devices.some((d) => d.type === 'ac' && d.power === 'on')
  const hasTv = devices.some((d) => d.type === 'tv' && d.power === 'on')

  if (hasLight && hasAc) {
    return [
      'inset 0 0 50px 16px rgba(255,232,124,0.18)',
      'inset 0 0 16px 6px rgba(255,232,124,0.12)',
      'inset 0 0 50px 16px rgba(126,200,227,0.14)',
    ].join(',')
  }
  if (hasLight) {
    return [
      'inset 0 0 50px 16px rgba(255,232,124,0.22)',
      'inset 0 0 16px 6px rgba(255,232,124,0.16)',
    ].join(',')
  }
  if (hasAc) {
    return [
      'inset 0 0 50px 16px rgba(126,200,227,0.18)',
      'inset 0 0 16px 6px rgba(126,200,227,0.12)',
    ].join(',')
  }
  if (hasTv) {
    return [
      'inset 0 0 50px 16px rgba(96,165,250,0.12)',
      'inset 0 0 16px 6px rgba(96,165,250,0.08)',
    ].join(',')
  }
  return undefined
}

export default function HouseView() {
  const devices = useStore((s) => s.devices)

  const byRoom = {
    kitchen: devices.filter((d) => d.room === 'kitchen'),
    'living-room': devices.filter((d) => d.room === 'living-room'),
    'master-bedroom': devices.filter((d) => d.room === 'master-bedroom'),
  }

  const activeCount = devices.filter((d) => d.power === 'on').length

  return (
    <div
      className="flex h-full flex-col"
      style={{ backgroundColor: 'var(--px-bg)', color: 'var(--px-text)' }}
    >
      {/* Title bar */}
      <div
        className="font-pixel flex shrink-0 items-center justify-between px-4 py-3"
        style={{ borderBottom: '2px solid var(--px-border)', fontSize: 'var(--px-size-lg)' }}
      >
        <span>{'>'} PIXEL HOME</span>
        <span style={{ color: 'var(--px-text-dim)', fontSize: 'var(--px-size-base)' }}>
          {activeCount}/{devices.length} ACTIVE
        </span>
      </div>

      {/* House grid */}
      <div
        className="flex-1 px-house-grid"
        style={{
          padding: '10px',
          gap: '3px',
        }}
      >
        <Room area="kitchen" label="KITCHEN" devices={byRoom['kitchen']} />
        <Room area="master" label="MASTER BED" devices={byRoom['master-bedroom']} />
        <Room area="living" label="LIVING ROOM" devices={byRoom['living-room']} />
      </div>

      {/* Legend */}
      <div
        className="font-pixel shrink-0 flex flex-wrap gap-x-4 gap-y-1 px-4 py-2"
        style={{
          borderTop: '2px solid var(--px-border)',
          fontSize: 'var(--px-size-sm)',
          color: 'var(--px-text-dim)',
        }}
      >
        {(['light', 'ac', 'fan', 'tv', 'fridge', 'speaker'] as const).map((type) => (
          <span key={type}>
            <span style={{ color: accentFor(type) }}>■</span> {type.toUpperCase()}
          </span>
        ))}
      </div>
    </div>
  )
}

interface RoomProps {
  area: string
  label: string
  devices: Device[]
}

function Room({ area, label, devices }: RoomProps) {
  const glow = roomGlow(devices)
  const anyOn = devices.some((d) => d.power === 'on')

  return (
    <div
      className="px-floor relative flex flex-col"
      style={{
        gridArea: area,
        border: `2px solid ${anyOn ? 'var(--px-border-bright)' : 'var(--px-border)'}`,
        padding: '8px',
        boxShadow: glow,
      }}
    >
      {/* Room label */}
      <span
        className="font-pixel"
        style={{
          fontSize: 'var(--px-size-base)',
          color: anyOn ? 'var(--px-text)' : 'var(--px-text-dim)',
          letterSpacing: '0.08em',
          marginBottom: '4px',
        }}
      >
        {label}
      </span>

      {/* Device icons row */}
      <div className="flex flex-1 items-center justify-around" style={{ gap: '4px' }}>
        {devices.map((device) => {
          const isOn = device.power === 'on'
          const accent = accentFor(device.type)
          return (
            <div
              key={device.name}
              className="flex flex-col items-center"
              style={{ gap: '4px', flex: 1 }}
            >
              <div className="relative flex items-center justify-center">
                <div className={isOn ? 'px-pulse' : ''}>
                  <DeviceIcon
                    type={device.type}
                    on={isOn}
                    size={20}
                    className="px-icon-room"
                  />
                </div>
                <div
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    width: '4px',
                    height: '4px',
                    backgroundColor: isOn ? accent : 'var(--px-border)',
                    boxShadow: isOn ? `0 0 4px ${accent}` : 'none',
                  }}
                />
              </div>

              <div className="flex flex-col items-center" style={{ gap: '2px' }}>
                <span
                  className="font-pixel"
                  style={{
                    fontSize: 'var(--px-size-xs)',
                    color: isOn ? accent : 'var(--px-text-dim)',
                    letterSpacing: '0.04em',
                    textAlign: 'center',
                  }}
                >
                  {SHORT_LABEL[device.name] ?? device.type.toUpperCase()}
                </span>
                {isOn && device.value !== undefined && (
                  <span
                    className="font-pixel"
                    style={{ fontSize: 'var(--px-size-xs)', color: 'var(--px-text-dim)' }}
                  >
                    {device.type === 'ac' || device.type === 'fridge'
                      ? `${device.value}\u00b0C`
                      : device.type === 'fan'
                        ? `SPD${device.value}`
                        : device.type === 'speaker'
                          ? `V${device.value}`
                          : device.value}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
