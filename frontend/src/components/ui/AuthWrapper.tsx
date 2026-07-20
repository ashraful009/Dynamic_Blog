import React from "react";
import { Zap } from "lucide-react";
import Link from "next/link";

export interface AuthWrapperProps {
  title: React.ReactNode;
  subtitle: string;
  children: React.ReactNode;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
}

export function AuthWrapper({
  title,
  subtitle,
  children,
  footerText,
  footerLinkText,
  footerLinkHref,
}: AuthWrapperProps) {
  return (
    <div className="py-[60px] px-5 flex items-center justify-center min-h-[80vh]">
      <div className="bg-bg-elevated/50 backdrop-blur-md border border-border rounded-2xl shadow-glass w-full max-w-[440px] p-10 relative z-10 animate-fade-in">
        <div className="text-center mb-9">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 shadow-[0_8px_32px_rgba(108,92,231,0.3)]">
            <Zap size={28} color="white" />
          </div>
          <h1 className="text-[28px] font-extrabold font-datum-display mb-2 text-text">
            {title}
          </h1>
          <p className="text-sm text-text-muted">{subtitle}</p>
        </div>
        
        {children}
        
        <p className="text-center mt-6 text-sm text-text-muted">
          {footerText}{" "}
          <Link href={footerLinkHref} className="text-primary-light hover:text-primary font-semibold transition-colors no-underline">
            {footerLinkText}
          </Link>
        </p>
      </div>
    </div>
  );
}
