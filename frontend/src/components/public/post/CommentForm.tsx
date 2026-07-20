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
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-bg-secondary p-5 rounded-md border border-border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-display font-semibold text-text">
          {parentId ? "Reply to comment" : "Leave a comment"}
        </h3>
        {parentId && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-text-muted hover:text-text transition-colors"
            title="Cancel reply"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 text-red-500 text-sm bg-red-50 p-2 rounded-sm border border-red-100">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-border rounded-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text text-sm transition-all"
            placeholder="Your name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Email <span className="text-text-muted font-normal">(optional)</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-border rounded-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text text-sm transition-all"
            placeholder="Your email (won't be published)"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-text-secondary mb-1">
          Comment *
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 bg-white border border-border rounded-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text text-sm transition-all resize-y"
          placeholder="What are your thoughts?"
          required
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-sm hover:bg-primary-dark transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
