import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({ component: About });

function About() {
  return (
    <div
      className="font-pixel flex min-h-screen flex-col items-center justify-center gap-6 px-6 py-16"
      style={{ backgroundColor: "var(--px-bg)", color: "var(--px-text)" }}
    >
      <div className="pointer-events-none fixed inset-0 px-scanlines" />

      <div
        className="relative z-10 flex max-w-md flex-col gap-5"
        style={{ width: "100%" }}
      >
        <div style={{ fontSize: "var(--px-size-lg)" }}>{">"} ABOUT</div>

        <div style={{ height: "2px", backgroundColor: "var(--px-border)" }} />

        <div
          style={{
            fontSize: "var(--px-size-base)",
            color: "var(--px-amber)",
            lineHeight: 2,
          }}
        >
          PIXEL SMART HOME
        </div>

        <div
          style={{
            fontSize: "var(--px-size-sm)",
            color: "var(--px-text-dim)",
            lineHeight: 2.2,
          }}
        >
          AI-POWERED SMART HOME CONTROL DEMO.
          <br />
          BUILT WITH REACT + EXPRESS + CLAUDE AI.
        </div>

        <Link
          to="/"
          className="px-btn"
          style={{
            backgroundColor: "var(--px-blue)",
            color: "#0d0d1a",
            textDecoration: "none",
            alignSelf: "flex-start",
            marginTop: "8px",
          }}
        >
          {"<"}- BACK
        </Link>
      </div>
    </div>
  );
}
