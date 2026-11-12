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
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          Sidebar Top Heading Label (Above Newsletter Box)
        </label>
        <input
          type="text"
          className="w-full bg-bg-card border border-border rounded-lg px-4 py-2.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          value={data.sidebarNewsletterLabel || ""}
          onChange={(e) => handleChange("sidebarNewsletterLabel", e.target.value)}
          placeholder="নতুন লেখা মেইলে পেতে সাবস্ক্রাইব করুনঃ"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">Newsletter Publication Title</label>
        <input
          type="text"
          className="w-full bg-bg-card border border-border rounded-lg px-4 py-2.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          value={data.newsletterTitle || ""}
          onChange={(e) => handleChange("newsletterTitle", e.target.value)}
          placeholder="The Dhakaiya Journal"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">Subtitle / Byline</label>
        <textarea
          className="w-full bg-bg-card border border-border rounded-lg px-4 py-2.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          rows={2}
          value={data.newsletterSubtitle || ""}
          onChange={(e) => handleChange("newsletterSubtitle", e.target.value)}
          placeholder="By Shuhan Rizwan"
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
            placeholder="Type your email..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Button Text</label>
          <input
            type="text"
            className="w-full bg-bg-card border border-border rounded-lg px-4 py-2.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            value={data.newsletterBtnText || ""}
            onChange={(e) => handleChange("newsletterBtnText", e.target.value)}
            placeholder="Subscribe"
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
