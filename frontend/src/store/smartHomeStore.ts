import { create } from 'zustand'

export type DeviceType = 'light' | 'ac' | 'fan' | 'tv' | 'fridge' | 'speaker'

export interface Device {
  name: string
  label: string
  room: 'kitchen' | 'living-room' | 'master-bedroom'
  type: DeviceType
  power: 'on' | 'off'
  /** temperature (°C) for ac/fridge, speed (1-3) for fan, volume (0-100) for speaker */
  value?: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'agent'
  content: string
  status: 'streaming' | 'done'
}

const VALUE_RANGE: Partial<Record<DeviceType, [number, number]>> = {
  ac: [16, 30],
  fridge: [1, 10],
  fan: [1, 3],
  speaker: [0, 100],
}

interface State {
  devices: Device[]
  messages: ChatMessage[]
  isStreaming: boolean
  toggleDevice: (name: string) => void
  adjustValue: (name: string, delta: number) => void
  addMessage: (msg: ChatMessage) => void
  appendContent: (id: string, chunk: string) => void
  setStatus: (id: string, status: ChatMessage['status']) => void
  setStreaming: (v: boolean) => void
}

const INITIAL_DEVICES: Device[] = [
  // Kitchen
  { name: 'kitchen-light', label: 'Ceiling Light', room: 'kitchen', type: 'light', power: 'on' },
  { name: 'kitchen-fridge', label: 'Refrigerator', room: 'kitchen', type: 'fridge', power: 'on', value: 4 },
  { name: 'kitchen-exhaust', label: 'Exhaust Fan', room: 'kitchen', type: 'fan', power: 'off', value: 1 },

  // Living Room
  { name: 'living-room-ac', label: 'Air Conditioner', room: 'living-room', type: 'ac', power: 'off', value: 21 },
  { name: 'living-room-tv', label: 'Smart TV', room: 'living-room', type: 'tv', power: 'on' },
  { name: 'living-room-speaker', label: 'Speaker', room: 'living-room', type: 'speaker', power: 'on', value: 40 },

  // Master Bedroom
  { name: 'master-bedroom-ac', label: 'Air Conditioner', room: 'master-bedroom', type: 'ac', power: 'on', value: 19 },
  { name: 'master-bedroom-light', label: 'Bedside Lamp', room: 'master-bedroom', type: 'light', power: 'off' },
  { name: 'master-bedroom-fan', label: 'Ceiling Fan', room: 'master-bedroom', type: 'fan', power: 'on', value: 2 },
]

export const useStore = create<State>((set) => ({
  devices: INITIAL_DEVICES,
  messages: [],
  isStreaming: false,

  toggleDevice: (name) =>
    set((s) => ({
      devices: s.devices.map((d) =>
        d.name === name ? { ...d, power: d.power === 'on' ? 'off' : 'on' } : d,
      ),
    })),

  adjustValue: (name, delta) =>
    set((s) => ({
      devices: s.devices.map((d) => {
        if (d.name !== name || d.value === undefined) return d
        const range = VALUE_RANGE[d.type]
        if (!range) return d
        const [min, max] = range
        return { ...d, value: Math.min(max, Math.max(min, d.value + delta)) }
      }),
    })),

  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),

  appendContent: (id, chunk) =>
    set((s) => ({
      messages: s.messages.map((m) => (m.id === id ? { ...m, content: m.content + chunk } : m)),
    })),

  setStatus: (id, status) =>
    set((s) => ({
      messages: s.messages.map((m) => (m.id === id ? { ...m, status } : m)),
    })),

  setStreaming: (v) => set({ isStreaming: v }),
}))
