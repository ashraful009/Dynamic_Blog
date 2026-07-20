"use client";
import Link from "next/link";
interface DatumFooterProps {
  settings: Record<string, unknown> | any;
}
export default function DatumFooter({ settings }: DatumFooterProps) {
  return (
    <footer className="border-t border-border py-8 sm:py-10 bg-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 lg:px-11">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-mono text-[11px] tracking-[0.06em] text-text-muted">
            {settings?.footerMark || "Datum — index 048, updated 2026"}
          </span>
          <ul className="flex items-center gap-5 list-none font-mono text-[11px] tracking-[0.06em]">
            {settings?.footerLinks?.map((link: { href: string; label: string }, i: number) => (
              <li key={i}>
                <Link
                  href={link.href}
                  className="text-text-muted no-underline transition-colors duration-200 hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
