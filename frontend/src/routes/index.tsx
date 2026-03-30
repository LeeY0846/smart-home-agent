import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import HouseView from '#/components/HouseView'
import ControlPanel from '#/components/ControlPanel'

export const Route = createFileRoute('/')({ component: SmartHomeApp })

type Panel = 'house' | 'control'

function SmartHomeApp() {
  const [activePanel, setActivePanel] = useState<Panel>('house')

  return (
    <div
      className="flex h-screen flex-col overflow-hidden sm:flex-row"
      style={{ backgroundColor: 'var(--px-bg)' }}
    >
      {/* House panel */}
      <div
        className={`relative flex-1 flex-col sm:flex sm:w-1/2 sm:flex-none ${activePanel === 'house' ? 'flex' : 'hidden'}`}
        style={{ borderRight: '2px solid var(--px-border)' }}
      >
        {/* Scanline overlay — house only */}
        <div className="pointer-events-none absolute inset-0 z-10 px-scanlines" />
        <HouseView />
      </div>

      {/* Control panel */}
      <div
        className={`flex-1 flex-col overflow-hidden sm:flex sm:w-1/2 sm:flex-none ${activePanel === 'control' ? 'flex' : 'hidden'}`}
      >
        <ControlPanel />
      </div>

      {/* Tab bar — mobile only */}
      <TabBar active={activePanel} onChange={setActivePanel} />
    </div>
  )
}

function TabBar({
  active,
  onChange,
}: {
  active: Panel
  onChange: (p: Panel) => void
}) {
  return (
    <div
      className="sm:hidden flex shrink-0"
      style={{
        borderTop: '2px solid var(--px-border)',
        backgroundColor: 'var(--px-panel)',
        height: '52px',
      }}
    >
      <TabBtn
        label="[HOUSE]"
        isActive={active === 'house'}
        onClick={() => onChange('house')}
        accent="var(--px-amber)"
      />
      <TabBtn
        label="[CTRL]"
        isActive={active === 'control'}
        onClick={() => onChange('control')}
        accent="var(--px-blue)"
      />
    </div>
  )
}

function TabBtn({
  label,
  isActive,
  onClick,
  accent,
}: {
  label: string
  isActive: boolean
  onClick: () => void
  accent: string
}) {
  return (
    <button
      className="font-pixel flex flex-1 items-center justify-center"
      onClick={onClick}
      style={{
        fontSize: 'var(--px-size-lg)',
        backgroundColor: isActive ? accent : 'transparent',
        color: isActive ? '#0d0d1a' : 'var(--px-text-dim)',
        border: 'none',
        borderRight: '1px solid var(--px-border)',
        cursor: 'pointer',
        transition: 'none',
        boxShadow: isActive ? 'inset 0 -3px 0 rgba(0,0,0,0.3)' : 'none',
      }}
    >
      {label}
    </button>
  )
}
