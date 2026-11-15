import type { Metadata } from "next";
import {
  Noto_Sans_Bengali,
  Outfit,
  Inter,
  IBM_Plex_Sans,
  IBM_Plex_Mono,
} from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers/Providers";
import Header from "@/components/public/Header";

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-bengali",
  display: "swap",
});
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});
const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
});
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});
export const metadata: Metadata = {
  title: {
    default: "Zibon Vlog — Stories, Insights & Inspiration",
    template: "%s | Zibon Vlog",
  },
  description:
    "Discover captivating stories, expert insights, and creative inspiration on Zibon Vlog. A premium blog platform delivering quality content.",
  keywords: ["blog", "vlog", "stories", "insights", "inspiration", "zibon"],
  authors: [{ name: "Zibon Vlog" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Zibon Vlog",
    title: "Zibon Vlog — Stories, Insights & Inspiration",
    description:
      "Discover captivating stories, expert insights, and creative inspiration.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zibon Vlog",
    description:
      "Discover captivating stories, expert insights, and creative inspiration.",
  },
  robots: {
    index: true,
    follow: true,
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${notoSansBengali.variable} ${outfit.variable} ${inter.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}
    >
      <body>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
