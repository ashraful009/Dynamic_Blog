export function getPostUrl(post: { slug: string; createdAt?: string; publishedAt?: string }): string {
  if (!post || !post.slug) return "/";
  
  const dateStr = post.publishedAt || post.createdAt;
  const date = dateStr ? new Date(dateStr) : new Date();
  
  if (isNaN(date.getTime())) {
    const now = new Date();
    return `/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}/${post.slug}`;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `/${year}/${month}/${day}/${post.slug}`;
}
