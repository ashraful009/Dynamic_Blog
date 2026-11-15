"use client";
import Container from "@/components/public/Container";

interface DatumHeroSettings {
  heroImage?: string | null;
  siteName?: string | null;
  siteSubtitle?: string | null;
  [key: string]: unknown;
}

interface DatumHeroProps {
  settings?: DatumHeroSettings | null;
  archiveLabel?: string;
  pageLabel?: string;
}

export default function DatumHero({
  settings,
  archiveLabel,
  pageLabel,
}: DatumHeroProps) {
  if (!settings?.heroImage && !archiveLabel) return null;

  return (
    <section className="w-full relative bg-page-alt">
      {settings?.heroImage && (
        <div
          className="w-full h-[220px] sm:h-[300px] md:h-[380px] lg:h-[420px] bg-surface-3 relative overflow-hidden"
          style={{
            backgroundImage: `url(${settings.heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* Subtle overlay with centered site branding watermark if heroTitle is set */}
          <div className="absolute inset-0 bg-page/30 flex items-center justify-center px-4 pointer-events-none">
            <div className="bg-surface/85 backdrop-blur-[2px] px-5 py-3 sm:px-7 sm:py-4 md:px-9 md:py-5 rounded-card shadow-raised border border-line/60 text-center">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-heading tracking-wide flex items-center gap-2.5 justify-center">
                <span>{settings.siteName || "ফেরদৌস আনাম জীবন"}</span>
                <span className="w-[3px] h-6 sm:h-7 md:h-8 bg-primary inline-block" />
              </h2>
              {settings.siteSubtitle && (
                <p className="text-xs sm:text-sm md:text-base text-body font-medium mt-0.5 text-right">
                  {settings.siteSubtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Category / Tag Archive Dark Overlay Header Bar (matching Screenshot 5: CATEGORY: অনুবাদ PAGE 1 OF 3) */}
      {archiveLabel && (
        <Container className="relative z-10 -mt-12">
          <div className="w-full lg:w-[68%] bg-page-alt/90 text-heading py-3.5 px-6 text-center text-xs md:text-small font-bold uppercase tracking-wider shadow-raised">
            <span>{archiveLabel}</span>
            {pageLabel && (
              <span className="ml-3 text-muted font-semibold">
                {pageLabel}
              </span>
            )}
          </div>
        </Container>
      )}
    </section>
  );
}
