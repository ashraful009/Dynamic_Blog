"use client";

interface HeroEditorProps {
  data: Record<string, string>;
  onChange: (data: Record<string, string>) => void;
}

export default function HeroEditor({ data, onChange }: HeroEditorProps) {
  const handleChange = (field: string, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">Hero Coordinate Text (Top left)</label>
        <input
          type="text"
          className="w-full bg-bg-card border border-border rounded-lg px-4 py-2.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          value={data.heroCoordText || ""}
          onChange={(e) => handleChange("heroCoordText", e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">Hero Title</label>
        <textarea
          className="w-full bg-bg-card border border-border rounded-lg px-4 py-2.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          rows={3}
          value={data.heroTitle || ""}
          onChange={(e) => handleChange("heroTitle", e.target.value)}
        />
        <p className="text-[12px] text-text-muted mt-1">
          Tip: Wrap a word in <code className="bg-bg-elevated px-1 py-0.5 rounded text-primary font-mono text-[11px]">&lt;accent&gt;word&lt;/accent&gt;</code> to make it blue.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">Hero Subtitle</label>
        <textarea
          className="w-full bg-bg-card border border-border rounded-lg px-4 py-2.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          rows={3}
          value={data.heroSubtitle || ""}
          onChange={(e) => handleChange("heroSubtitle", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Primary Button Text</label>
          <input
            type="text"
            className="w-full bg-bg-card border border-border rounded-lg px-4 py-2.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            value={data.heroPrimaryBtnText || ""}
            onChange={(e) => handleChange("heroPrimaryBtnText", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Primary Button Link</label>
          <input
            type="text"
            className="w-full bg-bg-card border border-border rounded-lg px-4 py-2.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            value={data.heroPrimaryBtnLink || ""}
            onChange={(e) => handleChange("heroPrimaryBtnLink", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Secondary Button Text</label>
          <input
            type="text"
            className="w-full bg-bg-card border border-border rounded-lg px-4 py-2.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            value={data.heroSecondaryBtnText || ""}
            onChange={(e) => handleChange("heroSecondaryBtnText", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Secondary Button Link</label>
          <input
            type="text"
            className="w-full bg-bg-card border border-border rounded-lg px-4 py-2.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            value={data.heroSecondaryBtnLink || ""}
            onChange={(e) => handleChange("heroSecondaryBtnLink", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">Hero Panel Label (Right box text)</label>
        <input
          type="text"
          className="w-full bg-bg-card border border-border rounded-lg px-4 py-2.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          value={data.heroPanelLabel || ""}
          onChange={(e) => handleChange("heroPanelLabel", e.target.value)}
        />
      </div>
    </div>
  );
}
