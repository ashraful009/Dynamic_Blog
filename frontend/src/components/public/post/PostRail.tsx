"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface TocItem {
  id: string;
  text: string;
}

interface PostRailProps {
  toc: TocItem[];
  publishedAt: string;
  readTime: number;
}

export default function PostRail({ toc, publishedAt, readTime }: PostRailProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
      setProgress(pct);
    };

    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    updateProgress();

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  useEffect(() => {
    if (!("IntersectionObserver" in window) || toc.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );

    toc.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [toc]);

  return (
    <>
      <div className="md:hidden fixed top-[56px] sm:top-[64px] left-0 w-full h-[3px] bg-datum-line z-40">
        <div className="h-full bg-datum-accent transition-all duration-150 ease-out" style={{ width: `${progress}%` }}></div>
      </div>

      <aside className="hidden lg:block w-48 shrink-0 sticky top-24 self-start font-datum-body">
        <div className="w-[3px] h-[100px] bg-datum-line rounded-full relative mb-6">
          <div className="absolute bottom-0 left-0 right-0 bg-datum-accent rounded-full transition-all duration-150 ease-out" style={{ height: `${progress}%` }}></div>
          <div className="absolute left-1/2 w-[7px] h-[7px] bg-datum-ink rounded-full -translate-x-1/2 translate-y-1/2 transition-all duration-150 ease-out" style={{ bottom: `${progress}%` }}></div>
        </div>

        <div className="text-[11px] font-datum-mono uppercase tracking-widest text-datum-ink-soft mb-8 leading-[1.8]">
          <strong className="block text-datum-ink font-semibold">Published</strong>
          {new Date(publishedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
          <br /><br />
          <strong className="block text-datum-ink font-semibold">Reading time</strong>
          {readTime} minutes
        </div>

        {toc.length > 0 && (
          <>
            <div className="text-[11px] font-bold font-datum-mono uppercase tracking-wider text-datum-ink mb-4 border-b border-datum-line pb-2">In this piece</div>
            <ul className="list-none p-0 m-0">
              {toc.map((item) => (
                <li key={item.id} className="mb-3">
                  <Link 
                    href={`#${item.id}`} 
                    className={`text-[13px] leading-snug block transition-colors no-underline ${activeId === item.id ? "text-datum-accent font-semibold" : "text-datum-ink-soft hover:text-datum-ink"}`}
                  >
                    {item.text}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </aside>
    </>
  );
}
