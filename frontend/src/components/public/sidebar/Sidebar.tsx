import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { getPostUrl } from "@/utils/postUrl";

export default function Sidebar({ 
  settings, 
  categories, 
  recentPosts 
}: { 
  settings: any; 
  categories: any[]; 
  recentPosts: any[];
}) {
  return (
    <aside className="w-full">
      <div className="sticky top-24 space-y-12">
        
        {/* About Widget */}
        {settings?.showSidebarAbout !== false && (settings?.sidebarAboutImage || settings?.sidebarAboutText) && (
          <div className="widget">
            <h3 className="text-[13px] font-bold tracking-widest uppercase text-text mb-4 pb-2 border-b-2 border-primary inline-block">
              About
            </h3>
            <div className="flex flex-col gap-4">
              {settings.sidebarAboutImage && (
                <div className="relative aspect-video w-full rounded-md overflow-hidden border border-border">
                  <Image 
                    src={settings.sidebarAboutImage} 
                    alt="About" 
                    fill 
                    sizes="(max-width: 768px) 100vw, 350px"
                    className="object-cover"
                  />
                </div>
              )}
              {settings.sidebarAboutText && (
                <p className="text-[15px] text-text-secondary leading-relaxed">
                  {settings.sidebarAboutText}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Custom HTML / Newsletter Widget */}
        {settings?.showSidebarNewsletter !== false && settings?.sidebarCustomHtml && (
          <div className="widget">
            <div 
              className="custom-html-widget w-full overflow-hidden" 
              dangerouslySetInnerHTML={{ __html: settings.sidebarCustomHtml }} 
            />
          </div>
        )}

        {/* Recent Posts Widget */}
        {settings?.showSidebarRecent !== false && recentPosts?.length > 0 && (
          <div className="widget">
            <h3 className="text-[13px] font-bold tracking-widest uppercase text-text mb-4 pb-2 border-b-2 border-primary inline-block">
              Recent Posts
            </h3>
            <ul className="flex flex-col gap-4">
              {recentPosts.slice(0, 5).map((post) => (
                <li key={post.id} className="group">
                  <Link href={getPostUrl(post)} className="flex flex-col no-underline">
                    <span className="text-[15px] font-bold text-text group-hover:text-primary transition-colors leading-tight mb-1">
                      {post.title}
                    </span>
                    <time dateTime={post.createdAt} className="text-[12px] text-text-muted">
                      {post.createdAt && !isNaN(new Date(post.createdAt).getTime()) 
                        ? format(new Date(post.createdAt), "MMMM d, yyyy") 
                        : "Unknown Date"}
                    </time>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Categories Widget */}
        {settings?.showSidebarCategories !== false && categories?.length > 0 && (
          <div className="widget">
            <h3 className="text-[13px] font-bold tracking-widest uppercase text-text mb-4 pb-2 border-b-2 border-primary inline-block">
              Categories
            </h3>
            <ul className="flex flex-col gap-2">
              {categories.filter(c => !c.parentId).map((cat) => (
                <li key={cat.id} className="border-b border-border/50 last:border-0 pb-2 last:pb-0">
                  <Link 
                    href={`/category/${cat.slug}`} 
                    className="flex items-center justify-between text-[14px] text-text-secondary hover:text-primary transition-colors py-1"
                  >
                    <span>{cat.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tags / Topics Widget */}
        {settings?.showSidebarTags !== false && categories?.length > 0 && (
          <div className="widget">
            <h3 className="text-[13px] font-bold tracking-widest uppercase text-text mb-4 pb-2 border-b-2 border-primary inline-block">
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Link 
                  key={`tag-${cat.id}`}
                  href={`/category/${cat.slug}`} 
                  className="px-3 py-1 text-[12px] text-text-secondary bg-bg-secondary border border-border hover:border-primary hover:text-primary transition-colors rounded-sm"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </aside>
  );
}
