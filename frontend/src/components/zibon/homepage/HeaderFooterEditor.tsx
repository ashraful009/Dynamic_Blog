"use client";
import LinkListEditor from "./LinkListEditor";

interface HeaderFooterEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export default function HeaderFooterEditor({ data, onChange }: HeaderFooterEditorProps) {
  const handleChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h3 className="text-base font-semibold mb-4 pb-2 border-b border-border">
          Header Settings
        </h3>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Site Name (Logo text)</label>
            <input
              type="text"
              className="w-full bg-bg-card border border-border rounded-lg px-4 py-2.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              value={data.siteName || ""}
              onChange={(e) => handleChange("siteName", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Header CTA Button Text</label>
              <input
                type="text"
                className="w-full bg-bg-card border border-border rounded-lg px-4 py-2.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                value={data.headerCtaText || ""}
                onChange={(e) => handleChange("headerCtaText", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Header CTA Button Link</label>
              <input
                type="text"
                className="w-full bg-bg-card border border-border rounded-lg px-4 py-2.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                value={data.headerCtaLink || ""}
                onChange={(e) => handleChange("headerCtaLink", e.target.value)}
              />
            </div>
          </div>
          <LinkListEditor
            label="Navigation Links"
            links={(data.navLinks as unknown as { label: string; href: string }[]) || []}
            onChange={(links) => handleChange("navLinks", links)}
          />
        </div>
      </section>

      <section>
        <h3 className="text-base font-semibold mb-4 pb-2 border-b border-border">
          Footer Settings
        </h3>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Footer Mark Text</label>
            <input
              type="text"
              className="w-full bg-bg-card border border-border rounded-lg px-4 py-2.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              value={data.footerMark || ""}
              onChange={(e) => handleChange("footerMark", e.target.value)}
            />
          </div>
          <LinkListEditor
            label="Footer Links"
            links={(data.footerLinks as unknown as { label: string; href: string }[]) || []}
            onChange={(links) => handleChange("footerLinks", links)}
          />
        </div>
      </section>
    </div>
  );
}
