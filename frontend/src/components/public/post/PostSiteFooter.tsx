import React from "react";
import Link from "next/link";
export default function PostSiteFooter() {
  return (
    <footer style={{ borderTop: "1px solid var(--rule)", padding: "36px 32px 48px" }}>
      <div style={{
        maxWidth: "1040px", margin: "0 auto", display: "flex", flexWrap: "wrap", gap: "16px",
        alignItems: "center", justifyContent: "space-between",
        fontFamily: "var(--font-mono)", fontSize: "11.5px", color: "var(--muted)", letterSpacing: "0.02em"
      }}>
        <span style={{ fontSize: "16px", fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--ink)" }}>Zibon Vlog</span>
        <span>© {new Date().getFullYear()} Zibon Vlog. Written slowly.</span>
        <div style={{ display: "flex", gap: "20px" }}>
          <Link href="/" style={{ textDecoration: "none", color: "var(--muted)" }}>Archive</Link>
          <Link href="/" style={{ textDecoration: "none", color: "var(--muted)" }}>Home</Link>
        </div>
      </div>
    </footer>
  );
}
