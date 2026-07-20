import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { getPostUrl } from "@/utils/postUrl";

export default function PostFeed({ posts }: { posts: any[] }) {
  if (!posts || posts.length === 0) {
    return <div className="py-10 text-center text-text-muted">No posts found.</div>;
  }

  return (
    <div className="flex flex-col gap-12">
      {posts.map((post, index) => (
        <article key={post.id} className="group border-b border-border pb-10 mb-2 last:border-b-0 last:pb-0">
          <header className="mb-4">
            <h2 className="text-2xl md:text-3xl font-bold font-display leading-tight mb-2">
              <Link href={getPostUrl(post)} className="text-text no-underline transition-colors hover:text-primary">
                {post.title}
              </Link>
            </h2>
            {/* <div className="text-[13px] text-text-muted font-medium tracking-wide uppercase flex flex-wrap items-center gap-1">
              <span>By</span>
              <span className="text-text-secondary">{post.author?.name || "Jibon Ahmed"}</span>
              <span>on</span>
              <time dateTime={post.createdAt}>
                {post.createdAt && !isNaN(new Date(post.createdAt).getTime()) 
                  ? format(new Date(post.createdAt), "MMMM d, yyyy") 
                  : "Unknown Date"}
              </time>
              {post.category && (
                <>
                  <span>in</span>
                  <Link href={`/category/${post.category.slug}`} className="text-primary hover:underline transition-all">
                    {post.category.name}
                  </Link>
                </>
              )}
            </div> */}
          </header>

          {post.coverImage && (
            <Link href={getPostUrl(post)} className="block mb-6 overflow-hidden rounded-md relative w-full bg-bg-secondary">
              <Image 
                src={post.coverImage} 
                alt={post.title} 
                width={0}
                height={0}
                sizes="100vw"
                style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                className="transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </Link>
          )}

          <div className="text-text-secondary text-[15px] leading-relaxed mb-6">
            {post.excerpt ? (
              <p>{post.excerpt}</p>
            ) : (
              <p>No excerpt available. Click below to read the full story.</p>
            )}
          </div>

          <div>
            <Link 
              href={getPostUrl(post)}
              className="inline-block px-5 py-2.5 text-[13px] font-bold uppercase tracking-wider text-white bg-primary rounded hover:bg-primary-dark transition-colors"
            >
              Read More
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
