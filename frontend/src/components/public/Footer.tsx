import Link from "next/link";
import { Zap } from "lucide-react";
export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-bg-tertiary border-t border-border px-6 pt-[60px] pb-6 mt-20">
      <div className="max-w-[1200px] mx-auto grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-10 mb-[60px]">
        <div>
          <Link
            href="/"
            className="flex items-center gap-2.5 no-underline mb-4"
          >
            <div className="w-8 h-8 rounded-sm bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Zap size={18} color="white" />
            </div>
            <span className="text-[20px] font-extrabold font-display text-text">
              Zibon<span className="text-primary-light">Vlog</span>
            </span>
          </Link>
          <p className="text-text-muted text-sm leading-relaxed">
            Discover captivating stories, expert insights, and creative inspiration. A premium platform built with passion.
          </p>
        </div>
        <div>
          <h4 className="text-base mb-4 font-bold">Links</h4>
          <ul className="list-none flex flex-col gap-2.5">
            <li><Link href="/" className="text-text-secondary text-sm no-underline hover:text-text transition-colors">Home</Link></li>
            <li><Link href="#" className="text-text-secondary text-sm no-underline hover:text-text transition-colors">About Us</Link></li>
            <li><Link href="#" className="text-text-secondary text-sm no-underline hover:text-text transition-colors">Contact</Link></li>
            <li><Link href="/login" className="text-text-secondary text-sm no-underline hover:text-text transition-colors">Admin Portal</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-[1200px] mx-auto border-t border-border-light pt-6 flex justify-between items-center flex-wrap gap-4">
        <p className="text-text-muted text-[13px]">
          &copy; {year} ZibonVlog. All rights reserved.
        </p>
        <div className="flex gap-4">
          <Link href="#" className="text-text-muted text-[13px] no-underline hover:text-text transition-colors">Privacy Policy</Link>
          <Link href="#" className="text-text-muted text-[13px] no-underline hover:text-text transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
