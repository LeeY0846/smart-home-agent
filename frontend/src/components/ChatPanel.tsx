import { useEffect, useRef, useState } from 'react'
import { useStore } from '#/store/smartHomeStore'
import { HouseIcon } from './PixelIcons'

function mockResponse(command: string): string {
  const lower = command.toLowerCase()
  if (lower.includes('turn on') || lower.includes('switch on') || lower.includes('enable')) {
    if (lower.includes('light') || lower.includes('lamp')) return "DONE. Light is now ON."
    if (lower.includes('ac') || lower.includes('air')) return "DONE. Air conditioner activated."
    if (lower.includes('tv')) return "DONE. TV is now ON."
    if (lower.includes('fan')) return "DONE. Fan activated."
    if (lower.includes('speaker')) return "DONE. Speaker is now ON."
    return "DONE. Device is now ON."
  }
  if (lower.includes('turn off') || lower.includes('switch off') || lower.includes('disable')) {
    if (lower.includes('light') || lower.includes('lamp')) return "DONE. Light is now OFF."
    if (lower.includes('ac') || lower.includes('air')) return "DONE. Air conditioner deactivated."
    if (lower.includes('tv')) return "DONE. TV is now OFF."
    if (lower.includes('fan')) return "DONE. Fan deactivated."
    if (lower.includes('speaker')) return "DONE. Speaker is now OFF."
    return "DONE. Device is now OFF."
  }
  if (lower.includes('status') || lower.includes('state') || lower.includes('what')) {
    return "STATUS REPORT: Kitchen light ON. Fridge ON at 4C. Living room TV ON. Speaker ON at VOL 40. Master bedroom AC ON at 19C, ceiling fan ON at SPD 2."
  }
  if (lower.includes('temp') || lower.includes('cold') || lower.includes('warm')) {
    return "TEMPERATURE noted. Adjusting climate devices."
  }
  return `COMMAND RECEIVED: "${command.toUpperCase()}". Request processed.`
}

async function simulateStream(
  text: string,
  onChunk: (c: string) => void,
  onDone: () => void,
): Promise<void> {
  for (const char of text) {
    await new Promise<void>((r) => setTimeout(r, 20))
    onChunk(char)
  }
  onDone()
}

export default function ChatPanel() {
  const messages = useStore((s) => s.messages)
  const isStreaming = useStore((s) => s.isStreaming)
  const { addMessage, appendContent, setStatus, setStreaming } = useStore()

  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const submit = async () => {
    const command = input.trim()
    if (!command || isStreaming) return
    setInput('')

    const userId = crypto.randomUUID()
    addMessage({ id: userId, role: 'user', content: command, status: 'done' })

    const agentId = crypto.randomUUID()
    addMessage({ id: agentId, role: 'agent', content: '', status: 'streaming' })
    setStreaming(true)

    await simulateStream(
      mockResponse(command),
      (chunk) => appendContent(agentId, chunk),
      () => {
        setStatus(agentId, 'done')
        setStreaming(false)
      },
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div
      className="flex flex-1 flex-col overflow-hidden"
      style={{ backgroundColor: 'var(--px-panel)' }}
    >
      {/* Message list */}
      <div
        className="px-scroll flex-1 overflow-y-auto p-3"
        style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
      >
        {messages.length === 0 && (
          <div
            className="font-pixel flex flex-col items-center justify-center gap-3 py-8"
            style={{
              color: 'var(--px-text-dim)',
              fontSize: 'var(--px-size-base)',
              textAlign: 'center',
            }}
          >
            <HouseIcon size={32} color="var(--px-border)" />
            <span>AWAITING COMMAND</span>
            <div
              className="flex flex-col gap-1"
              style={{ fontSize: 'var(--px-size-sm)', opacity: 0.5 }}
            >
              <span>{'>'} TURN ON KITCHEN LIGHT</span>
              <span>{'>'} SET AC TO 20C</span>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              className={`font-pixel ${msg.role === 'agent' && msg.status === 'streaming' ? 'px-cursor' : ''}`}
              style={{
                maxWidth: '85%',
                padding: '8px 10px',
                fontSize: 'var(--px-size-base)',
                lineHeight: '1.9',
                border: `2px solid ${msg.role === 'user' ? 'var(--px-amber)' : 'var(--px-blue)'}`,
                borderTop: `4px solid ${msg.role === 'user' ? 'var(--px-amber)' : 'var(--px-blue)'}`,
                backgroundColor: 'var(--px-card)',
                color: 'var(--px-text)',
                wordBreak: 'break-word',
                boxShadow: '2px 2px 0 #000',
              }}
            >
              <div
                style={{
                  fontSize: 'var(--px-size-sm)',
                  color: msg.role === 'user' ? 'var(--px-amber)' : 'var(--px-blue)',
                  marginBottom: '5px',
                  letterSpacing: '0.1em',
                }}
              >
                {msg.role === 'user' ? '[ YOU ]' : '[ AGENT ]'}
              </div>
              {msg.content || (msg.status === 'streaming' ? '' : '...')}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 p-3" style={{ borderTop: '2px solid var(--px-border)' }}>
        <div className="flex gap-2">
          <textarea
            className="font-pixel flex-1 resize-none px-scroll"
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="ENTER COMMAND..."
            disabled={isStreaming}
            style={{
              fontSize: 'var(--px-size-md)',
              padding: '8px',
              backgroundColor: 'var(--px-card)',
              border: '2px solid var(--px-border)',
              borderLeft: '4px solid var(--px-border-bright)',
              color: 'var(--px-text)',
              outline: 'none',
              borderRadius: 0,
              fontFamily: "'Press Start 2P', monospace",
              lineHeight: '1.8',
              opacity: isStreaming ? 0.45 : 1,
            }}
          />
          <button
            className="px-btn px-shadow"
            onClick={submit}
            disabled={isStreaming || !input.trim()}
            style={{
              backgroundColor:
                isStreaming || !input.trim() ? 'var(--px-border)' : 'var(--px-blue)',
              color: isStreaming || !input.trim() ? 'var(--px-text-dim)' : '#0d0d1a',
              alignSelf: 'stretch',
              minWidth: '44px',
              fontSize: 'var(--px-size-lg)',
            }}
          >
            {isStreaming ? '...' : '▶'}
          </button>
        </div>
        <div
          className="font-pixel mt-2"
          style={{
            fontSize: 'var(--px-size-sm)',
            color: 'var(--px-text-dim)',
            letterSpacing: '0.05em',
          }}
        >
          [ENTER] SEND &nbsp; [SHIFT+ENTER] NEW LINE
        </div>
      </div>
    </div>
  )
}
