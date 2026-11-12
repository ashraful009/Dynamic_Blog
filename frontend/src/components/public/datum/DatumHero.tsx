"use client";

interface DatumHeroProps {
  settings: Record<string, unknown> | any;
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
    <section className="w-full relative bg-[#e5e5e5]">
      {settings?.heroImage && (
        <div
          className="w-full h-[220px] sm:h-[300px] md:h-[380px] lg:h-[420px] bg-gray-200 relative overflow-hidden"
          style={{
            backgroundImage: `url(${settings.heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* Subtle overlay with centered site branding watermark if heroTitle is set */}
          <div className="absolute inset-0 bg-white/10 flex items-center justify-center pointer-events-none">
            <div className="bg-white/80 backdrop-blur-[2px] pt-6 pl-10 pr-6 pb-3 md:pt-9 md:pl-16 md:pr-10 md:pb-5 rounded shadow-sm border border-white/60 text-center">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-[#4a2511] tracking-wide flex items-center gap-3 justify-center">
                <span>{settings.siteName || "ফেরদৌস আনাম জীবন"}</span>
                <span className="w-1 h-8 md:h-12 bg-[#e53935] inline-block" />
              </h2>
              {settings.siteSubtitle && (
                <p className="text-base sm:text-xl md:text-2xl text-[#111] font-medium mt-1 text-right">
                  {settings.siteSubtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Category / Tag Archive Dark Overlay Header Bar (matching Screenshot 5: CATEGORY: অনুবাদ PAGE 1 OF 3) */}
      {archiveLabel && (
        <div className="w-[92%] lg:w-[82%] max-w-[1240px] mx-auto relative z-10 -mt-12">
          <div className="w-full lg:w-[68%] bg-[#222222] text-white py-3.5 px-6 text-center text-xs md:text-[13px] font-bold uppercase tracking-wider shadow-sm">
            <span>{archiveLabel}</span>
            {pageLabel && (
              <span className="ml-3 text-gray-300 font-semibold">
                {pageLabel}
              </span>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
