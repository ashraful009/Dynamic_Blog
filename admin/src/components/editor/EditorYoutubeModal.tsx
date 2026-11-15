import { useState, useEffect, useRef } from "react";
import { X, PlaySquare } from "lucide-react";
import { parseYoutubeUrl, ParsedYoutubeUrl } from "./youtubeUtils";

interface EditorYoutubeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (parsed: ParsedYoutubeUrl) => void;
}

export default function EditorYoutubeModal({
  isOpen,
  onClose,
  onInsert,
}: EditorYoutubeModalProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setUrl("");
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseYoutubeUrl(url);
    if (!parsed) {
      setError(
        "Please enter a valid YouTube URL (watch?v=, youtu.be/, /shorts/, /embed/, or /live/)."
      );
      return;
    }
    onInsert(parsed);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#0A0A0F]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-bg-card border border-border shadow-glass rounded-xl w-full max-w-[480px] overflow-hidden animate-fade-in">
        <div className="flex justify-between items-center px-5 py-4 border-b border-border bg-bg-elevated">
          <h2 className="text-base font-bold text-text flex items-center gap-2">
            <PlaySquare size={18} className="text-red-500" />
            Insert YouTube Video
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-text-muted hover:text-text hover:bg-bg-tertiary rounded transition-colors bg-transparent border-none cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              YouTube URL
            </label>
            <input
              ref={inputRef}
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError(null);
              }}
              placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-bg-tertiary text-sm text-text focus:border-primary outline-none"
            />
            {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
            <p className="mt-1.5 text-[11px] text-text-muted">
              Supports watch?v=, youtu.be/, /shorts/, /embed/, /live/, and optional ?t= or ?start=.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-border bg-bg-elevated text-text-secondary hover:text-text cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-sm font-medium bg-primary hover:bg-primary-dark text-white border-none cursor-pointer"
            >
              Insert Video
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
