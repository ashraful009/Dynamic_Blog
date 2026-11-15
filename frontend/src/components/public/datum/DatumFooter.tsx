"use client";
import { useState } from "react";
import Link from "next/link";
import Container from "@/components/public/Container";
interface FooterLink {
  href: string;
  label: string;
  [key: string]: unknown;
}

interface DatumFooterSettings {
  footerMark?: string | null;
  footerLinks?: FooterLink[] | null;
  [key: string]: unknown;
}

interface DatumFooterProps {
  settings?: DatumFooterSettings | null;
}
export default function DatumFooter({ settings }: DatumFooterProps) {
  const [showDeveloperEmail, setShowDeveloperEmail] = useState(false);

  return (
    <footer className="border-t border-line py-8 sm:py-10 bg-page-alt">
      <Container>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-mono text-meta tracking-[0.06em] text-muted">
            {settings?.footerMark || "Datum — index 048, updated 2026"}
          </span>
          <ul className="flex items-center gap-5 list-none font-mono text-meta tracking-[0.06em]">
            {settings?.footerLinks?.map((link: { href: string; label: string }, i: number) => (
              <li key={i}>
                <Link
                  href={link.href}
                  className="text-muted no-underline transition-colors duration-200 hover:text-link-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-0 rounded-control"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => setShowDeveloperEmail((prev) => !prev)}
            className="text-[11px] leading-tight text-muted/75 hover:text-muted transition-colors duration-200 cursor-pointer bg-transparent border-0 p-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-link rounded-control"
          >
            Developed by Md Ashraful Islam
          </button>
          {showDeveloperEmail && (
            <div className="mt-1">
              <a
                href="mailto:mdashrafulislam0807@gmail.com"
                className="text-[11px] leading-tight text-muted hover:text-link-hover transition-colors duration-200 no-underline"
              >
                mdashrafulislam0807@gmail.com
              </a>
            </div>
          )}
        </div>
      </Container>
    </footer>
  );
}
