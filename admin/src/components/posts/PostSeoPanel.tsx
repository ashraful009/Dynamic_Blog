"use client";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface PostSeoPanelProps {
  metaTitle: string;
  metaDescription: string;
  onChange: (field: "metaTitle" | "metaDescription", value: string) => void;
}

export default function PostSeoPanel({ metaTitle, metaDescription, onChange }: PostSeoPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-bg-elevated rounded-lg overflow-hidden border border-border">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex justify-between items-center font-semibold bg-transparent border-none cursor-pointer text-text hover:bg-white/5 transition-colors"
      >
        SEO Settings
        {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
      </button>

      {isOpen && (
        <div className="px-4 pb-4 flex flex-col gap-4">
          <div>
            <div className="flex justify-between mb-1">
              <label className="block text-sm font-medium text-text-secondary m-0">Meta Title</label>
              <span className={`text-[12px] ${metaTitle.length > 60 ? "text-danger" : "text-text-muted"}`}>
                {metaTitle.length} / 60
              </span>
            </div>
            <input
              type="text"
              className="w-full bg-bg-card border border-border rounded-lg px-4 py-2.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              value={metaTitle}
              onChange={(e) => onChange("metaTitle", e.target.value)}
              placeholder="SEO Title (optional)"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="block text-sm font-medium text-text-secondary m-0">Meta Description</label>
              <span className={`text-[12px] ${metaDescription.length > 160 ? "text-danger" : "text-text-muted"}`}>
                {metaDescription.length} / 160
              </span>
            </div>
            <textarea
              className="w-full bg-bg-card border border-border rounded-lg px-4 py-2.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              rows={3}
              value={metaDescription}
              onChange={(e) => onChange("metaDescription", e.target.value)}
              placeholder="SEO Description (optional)"
            />
          </div>
        </div>
      )}
    </div>
  );
}
