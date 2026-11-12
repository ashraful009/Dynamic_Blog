"use client";

interface PostMetaFieldsProps {
  readTime: string | number;
  displayOrder: string | number;
  isFeatured: boolean;
  onChange: (field: "readTime" | "displayOrder" | "isFeatured", value: string | number | boolean) => void;
}

export default function PostMetaFields({ readTime, displayOrder, isFeatured, onChange }: PostMetaFieldsProps) {
  return (
    <div className="bg-bg-elevated p-4 rounded-lg flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">Read Time (minutes)</label>
        <input
          type="number"
          className="w-full bg-bg-card border border-border rounded-lg px-4 py-2.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          min="1"
          placeholder="e.g. 5"
          value={readTime || ""}
          onChange={(e) => onChange("readTime", e.target.value ? parseInt(e.target.value, 10) : "")}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">Display Order (Homepage)</label>
        <input
          type="number"
          className="w-full bg-bg-card border border-border rounded-lg px-4 py-2.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          placeholder="e.g. 1 (Lowest first)"
          value={displayOrder || ""}
          onChange={(e) => onChange("displayOrder", e.target.value ? parseInt(e.target.value, 10) : "")}
        />
        <p className="text-[11px] text-text-muted mt-1">
          Lower numbers appear first in the recent index.
        </p>
      </div>

      <div className="flex items-center gap-2 mt-2">
        <input
          type="checkbox"
          id="isFeatured"
          checked={isFeatured}
          onChange={(e) => onChange("isFeatured", e.target.checked)}
          className="w-4 h-4 text-primary bg-bg-card border-border rounded focus:ring-primary cursor-pointer accent-primary"
        />
        <label htmlFor="isFeatured" className="text-sm font-medium cursor-pointer m-0 text-text">
          Mark as featured post
        </label>
      </div>
    </div>
  );
}
