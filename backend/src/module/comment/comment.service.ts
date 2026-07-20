import prisma from "../../db";
import { sanitizeHtml } from "../../utils/sanitize";

export const createComment = async (postId: string, data: any) => {
  // Verify post exists
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    throw new Error("Post not found");
  }

  // If replying, verify parent exists
  if (data.parentId) {
    const parent = await prisma.comment.findUnique({ where: { id: data.parentId } });
    if (!parent) {
      throw new Error("Parent comment not found");
    }
  }

  const comment = await prisma.comment.create({
    data: {
      content: sanitizeHtml(data.content),
      authorName: data.authorName,
      authorEmail: data.authorEmail || null,
      postId,
      parentId: data.parentId || null,
    },
  });

  return comment;
};

export const getCommentsByPost = async (postId: string) => {
  const comments = await prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: "asc" },
  });

  // Build a tree of comments
  const rootComments: any[] = [];
  const commentMap = new Map();

  comments.forEach((comment) => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  comments.forEach((comment) => {
    const mappedComment = commentMap.get(comment.id);
    if (comment.parentId) {
      const parent = commentMap.get(comment.parentId);
      if (parent) {
        parent.replies.push(mappedComment);
      }
    } else {
      rootComments.push(mappedComment);
    }
  });

  return rootComments;
};
