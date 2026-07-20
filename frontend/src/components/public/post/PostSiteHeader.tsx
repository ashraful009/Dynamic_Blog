"use client";
import React, { useState } from "react";
import Link from "next/link";
export default function PostSiteHeader() {
  const [isSaved, setIsSaved] = useState(false);
  return (
    <header className="site" style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "var(--paper)",
      borderBottom: "1px solid var(--rule)"
    }}>
      <div style={{
        maxWidth: "1040px", margin: "0 auto",
        padding: "16px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: "24px"
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "baseline", gap: "10px", textDecoration: "none" }}>
          <span style={{
            fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "22px",
            color: "var(--ink)", letterSpacing: "0.01em"
          }}>
            Zibon Vlog
          </span>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: "10.5px", color: "var(--muted)",
            letterSpacing: "0.06em", textTransform: "uppercase",
            borderLeft: "1px solid var(--rule)", paddingLeft: "10px",
            display: "inline-block" 
          }}>
            Field notes
          </span>
        </Link>
        <nav style={{ display: "flex", gap: "28px", fontFamily: "var(--font-mono)", fontSize: "12.5px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
          <Link href="/" style={{ textDecoration: "none", color: "var(--muted)", transition: "color .15s ease" }}>
            Archive
          </Link>
        </nav>
        <button 
          onClick={() => setIsSaved(!isSaved)}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "transparent", 
            border: `1px solid ${isSaved ? "var(--teal)" : "var(--rule)"}`, 
            borderRadius: "999px",
            padding: "7px 14px", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: "11.5px",
            letterSpacing: "0.05em", textTransform: "uppercase", 
            color: isSaved ? "var(--teal-dark)" : "var(--muted)",
            transition: "border-color .15s ease, color .15s ease"
          }}
        >
          <svg viewBox="0 0 24 24" style={{ 
            width: "14px", height: "14px", 
            stroke: isSaved ? "var(--teal-dark)" : "currentColor", 
            fill: isSaved ? "var(--ochre)" : "none", 
            strokeWidth: 1.6 
          }}>
            <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z"/>
          </svg>
          {isSaved ? ' Saved' : ' Save'}
        </button>
      </div>
    </header>
  );
}
