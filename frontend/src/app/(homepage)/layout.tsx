import ContentProtector from "@/components/public/ContentProtector";
import DatumFooter from "@/components/public/datum/DatumFooter";

async function getSettingsData() {
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
    const res = await fetch(`${apiUrl}/site-settings`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

export default async function HomepageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettingsData();

  return (
    <div className="bg-page text-body font-body text-base leading-relaxed min-h-screen">
      <ContentProtector />
      {children}
      <DatumFooter settings={settings} />
    </div>
  );
}
