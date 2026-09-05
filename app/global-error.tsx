"use client";

import { useEffect } from "react";

// Catches an error thrown by the root layout itself (rare — e.g. a failure
// in a layout-level data fetch). Must render its own <html>/<body> since it
// replaces the entire root layout tree. Kept in inline styles rather than
// Tailwind classes so it still renders correctly even if something upstream
// of globals.css failed to load.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "24px",
          background: "#F8F6F1",
          color: "#1C1A17",
          fontFamily: "Georgia, serif",
        }}
      >
        <p
          style={{
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.3em",
            color: "#9B4722",
            margin: 0,
          }}
        >
          CHIAREL™
        </p>
        <h1 style={{ marginTop: 24, fontSize: 28 }}>
          Something went wrong
        </h1>
        <p style={{ marginTop: 16, maxWidth: 360, fontSize: 14, lineHeight: 1.6, color: "rgba(28,26,23,0.6)" }}>
          The site hit an unexpected error. Trying again usually resolves it.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: 32,
            background: "#1C1A17",
            color: "#F8F6F1",
            padding: "12px 32px",
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: "0.25em",
            border: "none",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
