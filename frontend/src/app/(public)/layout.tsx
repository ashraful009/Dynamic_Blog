import DatumFooter from "@/components/public/datum/DatumFooter";
import ContentProtector from "@/components/public/ContentProtector";

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

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettingsData();

  return (
    <div className="flex flex-col min-h-screen">
      <ContentProtector />
      <main className="flex-grow">
        {children}</main>
      <DatumFooter settings={settings} />
    </div>
  );
}
