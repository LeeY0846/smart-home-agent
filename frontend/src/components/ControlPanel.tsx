import { useState } from "react";
import { useStore } from "#/store/smartHomeStore";
import DeviceCard from "./DeviceCard";
import ChatPanel from "./ChatPanel";
import { Link } from "@tanstack/react-router";

const ROOMS: {
  id: "kitchen" | "living-room" | "master-bedroom";
  label: string;
}[] = [
  { id: "kitchen", label: "KITCHEN" },
  { id: "living-room", label: "LIVING ROOM" },
  { id: "master-bedroom", label: "MASTER ROOM" },
];

export default function ControlPanel() {
  const devices = useStore((s) => s.devices);
  const [devicesOpen, setDevicesOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);

  return (
    <div
      className="flex h-full flex-col"
      style={{ backgroundColor: "var(--px-panel)", color: "var(--px-text)" }}
    >
      {/* Header */}
      <div
        className="font-pixel shrink-0 flex items-center justify-between px-4 py-3"
        style={{
          borderBottom: "2px solid var(--px-border)",
          fontSize: "var(--px-size-lg)",
        }}
      >
        <span>{">"} CONTROL PANEL</span>
        <Link
          to="/about"
          style={{
            fontSize: "var(--px-size-base)",
            color: "var(--px-text-dim)",
          }}
        >
          About v0.9
        </Link>
      </div>

      {/* Device groups */}
      <div
        className="shrink-0 flex flex-col"
        style={{
          borderBottom: "2px solid var(--px-border)",
          maxHeight: devicesOpen ? "55%" : undefined,
        }}
      >
        <button
          className="font-pixel flex shrink-0 w-full items-center justify-between px-4 py-2"
          onClick={() => setDevicesOpen((o) => !o)}
          style={{
            fontSize: "var(--px-size-sm)",
            color: "var(--px-text-dim)",
            backgroundColor: "rgba(255,255,255,0.02)",
            border: "none",
            borderBottom: devicesOpen ? "1px solid var(--px-border)" : "none",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <span>DEVICES</span>
          <span>{devicesOpen ? "▲" : "▼"}</span>
        </button>
        {devicesOpen && (
          <div className="px-scroll overflow-y-auto">
            {ROOMS.map(({ id, label }) => {
              const roomDevices = devices.filter((d) => d.room === id);
              const onCount = roomDevices.filter(
                (d) => d.power === "on",
              ).length;
              return (
                <div
                  key={id}
                  style={{ borderBottom: "1px solid var(--px-border)" }}
                >
                  <div
                    className="font-pixel flex items-center justify-between px-4 py-2"
                    style={{
                      fontSize: "var(--px-size-sm)",
                      backgroundColor: "rgba(255,255,255,0.02)",
                    }}
                  >
                    <span style={{ color: "var(--px-text-dim)" }}>
                      [{label}]
                    </span>
                    <span
                      style={{
                        color:
                          onCount > 0
                            ? "var(--px-green)"
                            : "var(--px-text-dim)",
                      }}
                    >
                      {onCount}/{roomDevices.length}
                    </span>
                  </div>
                  <div className="px-card-grid px-3 pb-2">
                    {roomDevices.map((d) => (
                      <DeviceCard key={d.name} device={d} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Chat */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <button
          className="font-pixel flex shrink-0 w-full items-center justify-between px-4 py-2"
          onClick={() => setChatOpen((o) => !o)}
          style={{
            fontSize: "var(--px-size-sm)",
            color: "var(--px-text-dim)",
            backgroundColor: "rgba(255,255,255,0.02)",
            border: "none",
            borderBottom: chatOpen ? "1px solid var(--px-border)" : "none",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <span>AGENT CHAT</span>
          <span>{chatOpen ? "▲" : "▼"}</span>
        </button>
        {chatOpen && <ChatPanel />}
      </div>
    </div>
  );
}
