import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import ContentProtector from "@/components/public/ContentProtector";
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-datum-display", display: "swap" });
const plexSans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-datum-body", display: "swap" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-datum-mono", display: "swap" });
export default function HomepageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`bg-datum-bg text-datum-ink font-datum-body text-base leading-relaxed min-h-screen ${spaceGrotesk.variable} ${plexSans.variable} ${plexMono.variable}`}>
      <ContentProtector />
      {children}
    </div>
  );
}
