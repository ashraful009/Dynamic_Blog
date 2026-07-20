import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/providers/Providers";
import Header from "@/components/public/Header";
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
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
