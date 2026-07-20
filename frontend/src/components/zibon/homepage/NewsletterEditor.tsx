"use client";

interface NewsletterEditorProps {
  data: Record<string, string>;
  onChange: (data: Record<string, string>) => void;
}

export default function NewsletterEditor({ data, onChange }: NewsletterEditorProps) {
  const handleChange = (field: string, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">Title</label>
        <input
          type="text"
          className="w-full bg-bg-card border border-border rounded-lg px-4 py-2.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          value={data.newsletterTitle || ""}
          onChange={(e) => handleChange("newsletterTitle", e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">Subtitle</label>
        <textarea
          className="w-full bg-bg-card border border-border rounded-lg px-4 py-2.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          rows={3}
          value={data.newsletterSubtitle || ""}
          onChange={(e) => handleChange("newsletterSubtitle", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Input Placeholder</label>
          <input
            type="text"
            className="w-full bg-bg-card border border-border rounded-lg px-4 py-2.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            value={data.newsletterPlaceholder || ""}
            onChange={(e) => handleChange("newsletterPlaceholder", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Button Text</label>
          <input
            type="text"
            className="w-full bg-bg-card border border-border rounded-lg px-4 py-2.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            value={data.newsletterBtnText || ""}
            onChange={(e) => handleChange("newsletterBtnText", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">Note (Below form)</label>
        <input
          type="text"
          className="w-full bg-bg-card border border-border rounded-lg px-4 py-2.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          value={data.newsletterNote || ""}
          onChange={(e) => handleChange("newsletterNote", e.target.value)}
        />
      </div>
    </div>
  );
}
