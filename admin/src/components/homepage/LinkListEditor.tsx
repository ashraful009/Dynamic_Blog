"use client";
import { useState } from "react";
import { ArrowUp, ArrowDown, X } from "lucide-react";

interface LinkListEditorProps {
  links: { label: string; href: string }[];
  onChange: (links: { label: string; href: string }[]) => void;
  label?: string;
}

export default function LinkListEditor({ links, onChange, label = "Links" }: LinkListEditorProps) {
  const [newLabel, setNewLabel] = useState("");
  const [newHref, setNewHref] = useState("");

  const handleAdd = () => {
    if (!newLabel.trim() || !newHref.trim()) return;
    onChange([...links, { label: newLabel.trim(), href: newHref.trim() }]);
    setNewLabel("");
    setNewHref("");
  };

  const handleRemove = (index: number) => {
    onChange(links.filter((_, i) => i !== index));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newLinks = [...links];
    [newLinks[index - 1], newLinks[index]] = [newLinks[index], newLinks[index - 1]];
    onChange(newLinks);
  };

  const handleMoveDown = (index: number) => {
    if (index === links.length - 1) return;
    const newLinks = [...links];
    [newLinks[index], newLinks[index + 1]] = [newLinks[index + 1], newLinks[index]];
    onChange(newLinks);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-1.5">{label}</label>
      
      {links.length > 0 && (
        <div className="flex flex-col gap-2 mb-4">
          {links.map((link, i) => (
            <div key={i} className="flex gap-2 items-center bg-bg-elevated p-2 rounded-lg border border-border/50">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-text truncate">{link.label}</div>
                <div className="text-xs text-text-muted truncate">{link.href}</div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button 
                  type="button" 
                  className="p-1.5 text-text-muted hover:text-text hover:bg-bg-tertiary rounded transition-colors disabled:opacity-30 bg-transparent border-none cursor-pointer" 
                  onClick={() => handleMoveUp(i)} 
                  disabled={i === 0}
                >
                  <ArrowUp size={14} />
                </button>
                <button 
                  type="button" 
                  className="p-1.5 text-text-muted hover:text-text hover:bg-bg-tertiary rounded transition-colors disabled:opacity-30 bg-transparent border-none cursor-pointer" 
                  onClick={() => handleMoveDown(i)} 
                  disabled={i === links.length - 1}
                >
                  <ArrowDown size={14} />
                </button>
                <button 
                  type="button" 
                  className="p-1.5 text-danger/70 hover:text-danger hover:bg-danger/10 rounded transition-colors bg-transparent border-none cursor-pointer" 
                  onClick={() => handleRemove(i)}
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
        <div className="flex-1">
          <input
            type="text"
            className="w-full bg-bg-card border border-border rounded-lg px-4 py-2 text-sm text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            placeholder="Label (e.g. About)"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
          />
        </div>
        <div className="flex-[2]">
          <input
            type="text"
            className="w-full bg-bg-card border border-border rounded-lg px-4 py-2 text-sm text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            placeholder="URL (e.g. /about or #contact)"
            value={newHref}
            onChange={(e) => setNewHref(e.target.value)}
          />
        </div>
        <button 
          type="button" 
          className="px-4 py-2 bg-bg-elevated hover:bg-bg-tertiary text-text border border-border rounded-lg text-sm font-medium transition-colors shrink-0" 
          onClick={handleAdd}
        >
          Add
        </button>
      </div>
    </div>
  );
}
