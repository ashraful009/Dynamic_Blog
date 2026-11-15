"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { MessageSquare, CornerDownRight } from "lucide-react";
import CommentForm from "./CommentForm";
import { commentsApi } from "@/lib/api";

interface Comment {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
  replies?: Comment[];
}

interface CommentsSectionProps {
  postId: string;
}

export default function CommentsSection({ postId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyToId, setReplyToId] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      const res = await commentsApi.getByPost(postId);
      if (res.data) {
        setComments(res.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch comments", error);
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleCommentSuccess = () => {
    setReplyToId(null);
    fetchComments(); // Refresh list after submitting
  };

  const CommentNode = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => {
    return (
      <div className={`mb-6 ${isReply ? "ml-8 md:ml-12 border-l-2 border-line pl-4 md:pl-6 mt-4" : ""}`}>
        <div className="flex items-start gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-primary-soft flex items-center justify-center flex-shrink-0 text-heading font-bold">
            {comment.authorName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-bold text-heading text-body">{comment.authorName}</span>
              <span className="text-muted text-small">
                {format(new Date(comment.createdAt), "MMM d, yyyy 'at' h:mm a")}
              </span>
            </div>
            <div className="text-body text-body mt-1 leading-relaxed break-words whitespace-pre-wrap">
              {comment.content}
            </div>
            
            <button
              onClick={() => setReplyToId(comment.id)}
              className="mt-2 text-link hover:text-link-hover text-small font-semibold flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-0 rounded-control"
            >
              <CornerDownRight size={14} /> Reply
            </button>
          </div>
        </div>

        {replyToId === comment.id && (
          <div className="mt-4 mb-6">
            <CommentForm 
              postId={postId} 
              parentId={comment.id} 
              onSuccess={handleCommentSuccess}
              onCancel={() => setReplyToId(null)}
            />
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4">
            {comment.replies.map((reply) => (
              <CommentNode key={reply.id} comment={reply} isReply={true} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mt-16 pt-10 border-t border-line">
      <h2 className="text-2xl font-bold font-display text-heading mb-8 flex items-center gap-2">
        <MessageSquare size={24} className="text-link" />
        Comments {comments.length > 0 && <span className="text-muted font-normal text-lg">({comments.length})</span>}
      </h2>

      {isLoading ? (
        <div className="text-muted py-6">Loading comments...</div>
      ) : (
        <div className="mb-10">
          {comments.length === 0 ? (
            <div className="bg-surface-2 border border-line rounded-card p-6 text-center text-muted mb-8">
              No comments yet. Be the first to share your thoughts!
            </div>
          ) : (
            <div className="space-y-6">
              {comments.map((comment) => (
                <CommentNode key={comment.id} comment={comment} />
              ))}
            </div>
          )}
        </div>
      )}

      {!replyToId && (
        <div>
          <CommentForm postId={postId} onSuccess={handleCommentSuccess} />
        </div>
      )}
    </div>
  );
}
