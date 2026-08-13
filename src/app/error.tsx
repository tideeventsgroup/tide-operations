"use client";

import { useEffect } from "react";

export default function RootError({
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
      <body style={{ fontFamily: "Arial, sans-serif" }}>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24, textAlign: "center" }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: "#373536" }}>Something went wrong</h1>
          <p style={{ maxWidth: 420, fontSize: 14, color: "#5b5758" }}>
            {error.message || "The app hit an unexpected error."}
          </p>
          <button
            onClick={() => reset()}
            style={{ padding: "8px 16px", borderRadius: 8, background: "#373536", color: "#fff", border: "none", cursor: "pointer" }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
