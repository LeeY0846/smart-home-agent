import { useStore } from '#/store/smartHomeStore'
import DeviceCard from './DeviceCard'
import ChatPanel from './ChatPanel'

const ROOMS: { id: 'kitchen' | 'living-room' | 'master-bedroom'; label: string }[] = [
  { id: 'kitchen', label: 'KITCHEN' },
  { id: 'living-room', label: 'LIVING ROOM' },
  { id: 'master-bedroom', label: 'MASTER BED' },
]

export default function ControlPanel() {
  const devices = useStore((s) => s.devices)

  return (
    <div
      className="flex h-full flex-col"
      style={{ backgroundColor: 'var(--px-panel)', color: 'var(--px-text)' }}
    >
      {/* Header */}
      <div
        className="font-pixel shrink-0 flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '2px solid var(--px-border)', fontSize: 'var(--px-size-lg)' }}
      >
        <span>{'>'} CONTROL PANEL</span>
        <span style={{ fontSize: 'var(--px-size-sm)', color: 'var(--px-text-dim)' }}>v1.0</span>
      </div>

      {/* Device groups — capped at 55% so chat panel has room */}
      <div
        className="px-scroll shrink-0 overflow-y-auto"
        style={{ borderBottom: '2px solid var(--px-border)', maxHeight: '55%' }}
      >
        {ROOMS.map(({ id, label }) => {
          const roomDevices = devices.filter((d) => d.room === id)
          const onCount = roomDevices.filter((d) => d.power === 'on').length
          return (
            <div key={id} style={{ borderBottom: '1px solid var(--px-border)' }}>
              <div
                className="font-pixel flex items-center justify-between px-4 py-2"
                style={{
                  fontSize: 'var(--px-size-sm)',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                }}
              >
                <span style={{ color: 'var(--px-text-dim)' }}>
                  [{label}]
                </span>
                <span
                  style={{ color: onCount > 0 ? 'var(--px-green)' : 'var(--px-text-dim)' }}
                >
                  {onCount}/{roomDevices.length}
                </span>
              </div>
              <div className="flex flex-col gap-1 px-3 pb-2">
                {roomDevices.map((d) => (
                  <DeviceCard key={d.name} device={d} />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Chat */}
      <ChatPanel />
    </div>
  )
}
