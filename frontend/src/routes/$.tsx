import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/$")({ component: NotFoundPage });

function NotFoundPage() {
  return (
    <div
      className="font-pixel flex min-h-[calc(100vh-120px)] flex-col items-center justify-center gap-8 px-4 py-16"
      style={{ backgroundColor: "var(--px-bg)", color: "var(--px-text)" }}
    >
      {/* Scanlines */}
      <div
        className="pointer-events-none fixed inset-0 px-scanlines"
        style={{ zIndex: 0 }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8 text-center">
        {/* Pixel house icon — broken / dark */}
        <BrokenHouseIcon />

        {/* Error code */}
        <div
          style={{
            fontSize: "clamp(32px, 8vw, 56px)",
            color: "var(--px-red)",
            textShadow: "3px 3px 0 #000",
            lineHeight: 1,
          }}
        >
          404
        </div>

        {/* Message */}
        <div
          style={{
            fontSize: "var(--px-size-lg)",
            color: "var(--px-text-dim)",
            letterSpacing: "0.08em",
            maxWidth: "320px",
            lineHeight: 2,
          }}
        >
          PAGE NOT FOUND
        </div>

        {/* Divider */}
        <div
          style={{
            width: "180px",
            height: "2px",
            backgroundColor: "var(--px-border)",
          }}
        />

        {/* Sub-message */}
        <div
          style={{
            fontSize: "var(--px-size-sm)",
            color: "var(--px-text-dim)",
            lineHeight: 2,
            maxWidth: "280px",
          }}
        >
          THIS ROOM DOESN'T EXIST IN THE SYSTEM.
        </div>

        {/* Back home button */}
        <Link
          to="/"
          className="px-btn"
          style={{
            backgroundColor: "var(--px-blue)",
            color: "#0d0d1a",
            textDecoration: "none",
            marginTop: "8px",
          }}
        >
          <span className="p-1">BACK TO HOME</span>
        </Link>
      </div>
    </div>
  );
}

function BrokenHouseIcon() {
  // 16×14 pixel map — house outline with a broken/dark window
  const map = [
    "......#########......",
    "....###########......",
    "...#############.....",
    "..###############....",
    ".#################...",
    "#####################",
    ".##.#############.##.",
    ".##.#############.##.",
    ".##.#############.##.",
    ".####...#####...####.",
    ".####...#####...####.",
    ".####...#####...####.",
    ".####################",
    ".####################",
  ];

  const rows = map.length;
  const cols = Math.max(...map.map((r) => r.length));

  return (
    <svg
      width={cols * 5}
      height={rows * 5}
      viewBox={`0 0 ${cols} ${rows}`}
      style={{ imageRendering: "pixelated", display: "block" }}
      aria-hidden="true"
    >
      {map.map((row, y) =>
        row.split("").map((cell, x) => {
          if (cell !== "#") return null;
          // Roof pixels (top 6 rows) get a dimmed red tint
          const color = y < 6 ? "#7a3030" : "var(--px-border-bright)";
          return (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={1}
              height={1}
              fill={color}
            />
          );
        }),
      )}
      {/* Broken window — red X */}
      <rect x={8} y={10} width={1} height={1} fill="var(--px-red)" />
      <rect x={10} y={10} width={1} height={1} fill="var(--px-red)" />
      <rect x={9} y={11} width={1} height={1} fill="var(--px-red)" />
      <rect x={8} y={12} width={1} height={1} fill="var(--px-red)" />
      <rect x={10} y={12} width={1} height={1} fill="var(--px-red)" />
    </svg>
  );
}
