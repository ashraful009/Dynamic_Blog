"use client";
import Link from "next/link";

interface DatumHeroProps {
  settings: Record<string, unknown> | any;
}

export default function DatumHero({ settings }: DatumHeroProps) {
  const rawTitle = settings?.heroTitle || "Design is <accent>measured</accent>, not guessed.";

  const parseTitle = (htmlString: string) => {
    return htmlString.replace(/<accent>(.*?)<\/accent>/g, '<span class="text-datum-accent">$1</span>');
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-[100px] relative bg-dot-grid-hero">
      <div className="w-[90%] lg:w-[80%] max-w-[1600px] mx-auto px-0 lg:px-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 lg:gap-12 items-center">
          <div>
            {settings?.heroCoordText && (
              <div className="font-datum-mono text-[11px] tracking-[0.08em] uppercase text-datum-ink-faint mb-4 sm:mb-6">
                {settings.heroCoordText}
              </div>
            )}
            <h1
              className="font-datum-display font-bold text-[clamp(32px,6vw,60px)] leading-[1.1] tracking-[-0.02em] text-datum-ink mb-4 sm:mb-6"
              dangerouslySetInnerHTML={{ __html: parseTitle(rawTitle) }}
            />
            {settings?.heroSubtitle && (
              <p className="text-[clamp(14px,1.5vw,17px)] leading-relaxed text-datum-ink-soft max-w-[520px] mb-6 sm:mb-8">
                {settings.heroSubtitle}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              {settings?.heroPrimaryBtnText && settings?.heroPrimaryBtnLink && (
                <Link
                  href={settings.heroPrimaryBtnLink}
                  className="inline-flex items-center gap-2 bg-datum-ink text-datum-bg font-datum-mono text-[12px] font-medium tracking-[0.06em] uppercase px-6 py-3 rounded-full no-underline transition-all duration-200 hover:bg-datum-accent hover:text-white"
                >
                  {settings.heroPrimaryBtnText}
                </Link>
              )}
              {settings?.heroSecondaryBtnText && settings?.heroSecondaryBtnLink && (
                <Link
                  href={settings.heroSecondaryBtnLink}
                  className="inline-flex items-center gap-2 border border-datum-line-strong text-datum-ink font-datum-mono text-[12px] font-medium tracking-[0.06em] uppercase px-6 py-3 rounded-full no-underline transition-all duration-200 hover:border-datum-ink"
                >
                  {settings.heroSecondaryBtnText}
                </Link>
              )}
            </div>
          </div>
          
          <div
            className="hidden lg:grid grid-cols-2 grid-rows-2 gap-px aspect-square rounded-lg overflow-hidden border border-datum-line bg-datum-line relative"
            style={{
              backgroundImage: settings?.heroImage ? `url(${settings.heroImage})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="relative bg-transparent flex items-end justify-center p-4 crosshair">
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
