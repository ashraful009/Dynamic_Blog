import Image from "next/image";
import CircularSkillBar from "@/components/public/about/CircularSkillBar";
import DatumFooter from "@/components/public/datum/DatumFooter";

export const dynamic = "force-dynamic";

async function getAboutData() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}/about`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch");
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error("Error fetching about data:", error);
    return null;
  }
}

async function getSettingsData() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}/site-settings`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch");
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error("Error fetching settings data:", error);
    return null;
  }
}

export default async function AboutPage() {
  const [data, settings] = await Promise.all([getAboutData(), getSettingsData()]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-text-muted">About data not available.</p>
      </div>
    );
  }

  return (
    <>
      <main className="bg-bg min-h-screen">
        <div className="w-[90%] lg:w-[85%] max-w-[1600px] mx-auto px-0 py-16 lg:py-24">
          
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">
            
            {/* Left Column: Text Info */}
            <div className="flex-1 order-2 lg:order-1">
              
              {/* Section 1: Name & Designation */}
              <div className="mb-10 relative">
                <h1 className="text-4xl md:text-5xl font-bold font-display text-text uppercase tracking-tight mb-2">
                  {data.name}
                </h1>
                <h2 className="text-xl md:text-2xl text-text-muted font-light uppercase tracking-widest mb-6">
                  {data.designation}
                </h2>
                
                {(data.email || data.phone) && (
                  <div className="flex flex-wrap gap-6 text-sm font-medium text-text-secondary">
                    {data.email && (
                      <a href={`mailto:${data.email}`} className="hover:text-primary transition-colors flex items-center gap-2">
                        ✉ {data.email}
                      </a>
                    )}
                    {data.phone && (
                      <a href={`tel:${data.phone}`} className="hover:text-primary transition-colors flex items-center gap-2">
                        ☏ {data.phone}
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Section 2: Biography */}
              <div className="prose prose-lg max-w-none text-text-secondary leading-relaxed mb-16 relative">
                {/* Decorative quote mark */}
                <span className="absolute -top-10 -left-6 text-8xl text-border/40 font-serif leading-none hidden md:block">
                  "
                </span>
                {data.biography.split('\n').map((paragraph: string, i: number) => (
                  paragraph.trim() ? <p key={i} className="mb-4">{paragraph}</p> : null
                ))}
              </div>
              
              </div>

            <div className="w-full lg:w-[45%] order-1 lg:order-2 flex flex-col items-center">
              <div className="relative w-full max-w-[256px] md:max-w-[320px] lg:max-w-[450px] aspect-square rounded-full overflow-hidden bg-bg-secondary group">
                {data.profileImage ? (
                  <Image
                    src={data.profileImage}
                    alt={data.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    sizes="(max-width: 768px) 256px, (max-width: 1024px) 320px, 450px"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary/30">
                    <svg className="w-1/2 h-1/2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                  </div>
                )}
              </div>
              
              {/* Signature */}
              {data.signatureImage && (
                <div className="mt-8 -rotate-6 transform hover:rotate-0 transition-transform duration-300">
                  <Image
                    src={data.signatureImage}
                    alt="Signature"
                    width={200}
                    height={100}
                    className="opacity-80"
                  />
                </div>
              )}
            </div>

          </div>
          
          {/* Section 3: Skills (Full Width Bottom) */}
          {data.skills && data.skills.length > 0 && (
            <div className="mt-24 pt-16 border-t border-border/50">
              <h3 className="text-sm uppercase tracking-widest text-text-muted font-semibold mb-12 text-center">Expertise</h3>
              <div className="flex flex-wrap justify-center gap-8 md:gap-12 lg:gap-16">
                {data.skills.map((skill: any, i: number) => (
                  <CircularSkillBar key={i} name={skill.name} percentage={skill.percentage} />
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
      <DatumFooter settings={settings || {}} />
    </>
  );
}
