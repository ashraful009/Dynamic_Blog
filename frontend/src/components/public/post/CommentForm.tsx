"use client";

import { useState } from "react";
import { Send, X } from "lucide-react";
import { commentsApi } from "@/lib/api";

interface CommentFormProps {
  postId: string;
  parentId?: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

export default function CommentForm({ postId, parentId, onSuccess, onCancel }: CommentFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) {
      setError("Name and Comment are required.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await commentsApi.create(postId, {
        authorName: name,
        authorEmail: email,
        content,
        parentId,
      });

      setName("");
      setEmail("");
      setContent("");
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-surface-2 p-5 rounded-card border border-line">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-display font-semibold text-heading">
          {parentId ? "Reply to comment" : "Leave a comment"}
        </h3>
        {parentId && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-muted hover:text-heading transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-0 rounded-control"
            title="Cancel reply"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 text-danger text-sm bg-danger/10 p-2 rounded-control border border-danger/30">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-body mb-1">
            Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-surface-3 border border-line rounded-control focus:outline-none focus-visible:border-link focus-visible:ring-2 focus-visible:ring-link/60 text-heading placeholder:text-faint text-sm transition-all"
            placeholder="Your name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-body mb-1">
            Email <span className="text-muted font-normal">(optional)</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-surface-3 border border-line rounded-control focus:outline-none focus-visible:border-link focus-visible:ring-2 focus-visible:ring-link/60 text-heading placeholder:text-faint text-sm transition-all"
            placeholder="Your email (won't be published)"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-body mb-1">
          Comment *
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 bg-surface-3 border border-line rounded-control focus:outline-none focus-visible:border-link focus-visible:ring-2 focus-visible:ring-link/60 text-heading placeholder:text-faint text-sm transition-all resize-y"
          placeholder="What are your thoughts?"
          required
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="px-5 py-2.5 bg-primary text-on-primary text-sm font-semibold rounded-control hover:bg-primary-hover hover:text-page transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-0"
      >
        {isSubmitting ? (
          "Submitting..."
        ) : (
          <>
            <Send size={16} />
            {parentId ? "Post Reply" : "Post Comment"}
          </>
        )}
      </button>
    </form>
  );
}
