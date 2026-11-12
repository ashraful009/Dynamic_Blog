import type { Metadata } from "next";
import Providers from "@/components/providers/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Admin Dashboard | Zibon Vlog",
  description: "Administrative control panel",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

