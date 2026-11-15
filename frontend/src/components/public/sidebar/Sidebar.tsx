"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { FileText } from "lucide-react";
import toast from "react-hot-toast";
import { getPostUrl } from "@/utils/postUrl";
import { subscribersApi } from "@/lib/api";
import type {
  Category,
  GoodreadsBook,
  Post,
  SiteSettings,
  Tag,
} from "@/types/blog";

export default function Sidebar({
  settings,
  categories,
  recentPosts,
  tags = [],
}: {
  settings: SiteSettings;
  categories: Category[];
  recentPosts: Post[];
  tags?: Tag[];
}) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast.error("অনুগ্রহ করে সঠিক ইমেইল ঠিকানা দিন।");
      return;
    }
    setSubmitting(true);
    try {
      await subscribersApi.subscribe(email.trim());
      toast.success("সাবস্ক্রাইব করার জন্য ধন্যবাদ!");
      setEmail("");
    } catch (error: unknown) {
      const apiErr = error as { response?: { data?: { message?: string } } };
      const msg =
        apiErr?.response?.data?.message || "ইতিমধ্যে সাবস্ক্রাইব করা হয়েছে অথবা ত্রুটি ঘটেছে।";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Parse Goodreads books from SiteSettings JSON
  const goodreadsBooks: GoodreadsBook[] = Array.isArray(
    settings?.sidebarGoodreadsBooks
  )
    ? settings.sidebarGoodreadsBooks
    : [];

  // Parse About paragraphs
  const aboutParagraphs: string[] = settings?.sidebarAboutText
    ? settings.sidebarAboutText
        .split(/\n\n+/)
        .map((p: string) => p.trim())
        .filter(Boolean)
    : [];

  const linkText = settings?.sidebarAboutLinkText || "এই লিংক থেকে";
  const linkUrl = settings?.sidebarAboutLinkUrl || "/category/prokashito-boi";

  // Top-level subject categories for বিষয় নির্বাচন
  const parentCategories = (categories || []).filter(
    (c: Category) => !c.parentId && !c.showInHeader
  );

  // Recent posts limit from settings
  const recentLimit = Number(settings?.sidebarRecentCount) || 5;

  return (
    <aside className="w-full">
      <div className="space-y-10">
        {/* 1. Author Note / About Widget (Help us to keep on writing!) */}
        {settings?.showSidebarAbout !== false &&
          (settings?.sidebarAboutImage || settings?.sidebarAboutText) && (
            <div className="widget border-b border-line pb-8">
              {settings?.sidebarAboutTitle && (
                <div className="mb-4">
                  <h3 className="text-small font-bold tracking-wide text-heading pb-1.5 border-b-2 border-line-strong inline-block">
                    {settings.sidebarAboutTitle}
                  </h3>
                </div>
              )}

              <div className="flex flex-col gap-5">
                {settings.sidebarAboutImage && (
                  <div className="w-full overflow-hidden bg-surface-3">
                    <Image
                      src={settings.sidebarAboutImage}
                      alt={settings?.siteName || "Author Banner"}
                      width={0}
                      height={0}
                      sizes="(max-width: 1024px) 92vw, 32vw"
                      style={{ width: "100%", height: "auto" }}
                      className="block"
                    />
                  </div>
                )}

                {aboutParagraphs.length > 0 && (
                  <div className="text-small text-body leading-article space-y-4">
                    {aboutParagraphs.map((para: string, idx: number) => {
                      if (idx === 0 && para.length < 40) {
                        return (
                          <p key={idx} className="font-bold text-heading text-body">
                            {para}
                          </p>
                        );
                      }

                      if (para.includes("{{LINK}}")) {
                        const parts = para.split("{{LINK}}");
                        return (
                          <p key={idx}>
                            {parts[0]}
                            <Link
                              href={linkUrl}
                              className="text-link underline font-medium hover:text-link-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-0 rounded-control"
                            >
                              {linkText}
                            </Link>
                            {parts[1]}
                          </p>
                        );
                      }

                      return <p key={idx}>{para}</p>;
                    })}

                    {settings?.sidebarAboutSignoff && (
                      <p className="font-bold text-heading pt-1">
                        {settings.sidebarAboutSignoff}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

        {/* 2. Newsletter Subscription Widget (Substack / Direct DB Subscribe) */}
        {settings?.showSidebarNewsletter !== false && (
          <div className="widget border-b border-line pb-8">
            {settings?.sidebarNewsletterLabel && (
              <p className="text-small font-bold text-heading mb-3">
                {settings.sidebarNewsletterLabel}
              </p>
            )}

            <div className="bg-surface-2 border border-line-strong rounded-card p-5 text-center">
              <h4 className="text-lead font-bold text-heading underline decoration-1 underline-offset-4 mb-1 font-serif">
                {settings?.newsletterTitle || "The Dhakaiya Journal"}
              </h4>
              <p className="text-meta text-muted mb-4">
                {settings?.newsletterSubtitle ||
                  `By ${settings?.siteName || "ফেরদৌস আনাম জীবন"}`}
              </p>

              <form
                onSubmit={handleSubscribe}
                className="flex items-stretch border border-line-strong rounded-control overflow-hidden bg-surface-3 mb-3 focus-within:border-link focus-within:ring-2 focus-within:ring-link/60"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    settings?.newsletterPlaceholder || "Type your email..."
                  }
                  className="flex-1 min-w-0 px-3 py-2 text-small text-heading placeholder:text-faint bg-surface-3 border-none outline-none focus-visible:outline-none"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-on-primary hover:text-page text-small font-semibold border-none cursor-pointer transition-colors disabled:opacity-60 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-0"
                >
                  {submitting
                    ? "..."
                    : settings?.newsletterBtnText || "Subscribe"}
                </button>
              </form>

              {settings?.newsletterNote && (
                <p className="text-[10px] text-muted leading-snug">
                  {settings.newsletterNote}
                </p>
              )}
            </div>
          </div>
        )}

        {/* 3. Goodreads Reading List Widget (গুডরিডসের পড়াশোনা) */}
        {settings?.showSidebarGoodreads !== false &&
          goodreadsBooks.length > 0 && (
            <div className="widget border-b border-line pb-8">
              <div className="border border-line rounded-card p-4 bg-surface shadow-card">
                <h3 className="text-body font-bold text-link text-center mb-3 pb-2 border-b border-line">
                  {settings?.sidebarGoodreadsTitle || "গুডরিডসের পড়াশোনা"}
                </h3>

                <div className="divide-y divide-line">
                  {goodreadsBooks.map((book, idx) => {
                    const rating = Number(book.rating) || 0;
                    return (
                      <div
                        key={idx}
                        className="py-2.5 first:pt-1 last:pb-1 flex items-start gap-3 justify-between"
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          {book.coverUrl && (
                            <Image
                              src={book.coverUrl}
                              alt={book.title}
                              width={36}
                              height={52}
                              className="w-9 h-13 object-cover rounded-control border border-line bg-surface-3 shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <a
                              href={book.link || "https://www.goodreads.com"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-small font-semibold text-link hover:text-link-hover hover:underline leading-tight truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-0 rounded-control"
                            >
                              {book.title}
                            </a>
                            <span className="block text-meta text-muted mt-0.5">
                              by{" "}
                              <span className="text-link">
                                {book.author}
                              </span>
                            </span>
                          </div>
                        </div>

                        <div
                          className="flex items-center text-small shrink-0 tracking-tighter select-none"
                          title={`${rating} of 5 stars`}
                        >
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={
                                star <= rating
                                  ? "text-link"
                                  : "text-faint"
                              }
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 pt-2 border-t border-line flex justify-center">
                  <span className="px-5 py-0.5 border border-line-strong rounded-full text-small font-sans text-muted tracking-tight">
                    good<strong className="font-bold text-heading">reads</strong>
                  </span>
                </div>
              </div>
            </div>
          )}

        {/* Optional Custom HTML / Iframe Widget */}
        {settings?.sidebarCustomHtml && (
          <div className="widget border-b border-line pb-8">
            <div
              className="custom-html-widget w-full overflow-hidden"
              dangerouslySetInnerHTML={{ __html: settings.sidebarCustomHtml }}
            />
          </div>
        )}

        {/* 4. Recent Posts Widget (সাম্প্রতিক লেখা) */}
        {settings?.showSidebarRecent !== false && recentPosts?.length > 0 && (
          <div className="widget border-b border-line pb-8">
            <div className="mb-5">
              <h3 className="text-small font-bold text-heading pb-1.5 border-b-2 border-line-strong inline-block">
                {settings?.sidebarRecentTitle || "সাম্প্রতিক লেখা"}
              </h3>
            </div>

            <ul className="divide-y divide-line list-none m-0 p-0">
              {recentPosts.slice(0, recentLimit).map((post) => {
                const dateVal = post.publishedAt || post.createdAt;
                const formatted =
                  dateVal && !isNaN(new Date(dateVal).getTime())
                    ? format(new Date(dateVal), "MMMM d, yyyy").toUpperCase()
                    : "";
                return (
                  <li key={post.id} className="py-3.5 first:pt-0 last:pb-0 group">
                    <Link
                      href={getPostUrl(post)}
                      className="flex items-center gap-3.5 no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-0 rounded-control"
                    >
                      <div className="w-11 h-11 rounded-full border border-line bg-surface-3 flex items-center justify-center shrink-0 overflow-hidden relative">
                        {post.coverImage ? (
                          <Image
                            src={post.coverImage}
                            alt={post.title}
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        ) : (
                          <FileText size={16} className="text-link" />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-small font-bold text-heading group-hover:text-link-hover transition-colors leading-snug">
                          {post.title}
                        </span>
                        {formatted && (
                          <time
                            dateTime={dateVal || undefined}
                            className="text-meta text-muted uppercase tracking-wider mt-0.5"
                          >
                            {formatted}
                          </time>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* 5. Hierarchical Categories Widget (বিষয় নির্বাচন) */}
        {settings?.showSidebarCategories !== false &&
          parentCategories.length > 0 && (
            <div className="widget border-b border-line pb-8">
              <div className="mb-5">
                <h3 className="text-small font-bold text-heading pb-1.5 border-b-2 border-line-strong inline-block">
                  {settings?.sidebarCategoriesTitle || "বিষয় নির্বাচন"}
                </h3>
              </div>

              <ul className="divide-y divide-line list-none m-0 p-0 text-small">
                {parentCategories.map((cat: Category) => {
                  const children =
                    cat.children && cat.children.length > 0
                      ? cat.children
                      : categories.filter((c: Category) => c.parentId === cat.id);
                  const count = cat._count?.posts ?? 0;

                  return (
                    <li key={cat.id} className="py-2.5 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/category/${cat.slug}`}
                          className="text-body hover:text-link-hover transition-colors no-underline flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-0 rounded-control"
                        >
                          <span className="text-faint text-meta">▸</span>
                          <span>{cat.name}</span>
                          <span className="text-faint text-meta">
                            ({count})
                          </span>
                        </Link>
                      </div>

                      {children.length > 0 && (
                        <ul className="mt-2 pt-2 border-t border-line pl-5 space-y-2 list-none">
                          {children.map((child: Category) => {
                            const childCount = child._count?.posts ?? 0;
                            return (
                              <li
                                key={child.id}
                                className="pt-1.5 first:pt-0 border-t border-line first:border-t-0"
                              >
                                <Link
                                  href={`/category/${child.slug}`}
                                  className="text-body hover:text-link-hover transition-colors no-underline flex items-center gap-2 text-small focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-0 rounded-control"
                                >
                                  <span className="text-faint text-[10px]">
                                    ▸
                                  </span>
                                  <span>{child.name}</span>
                                  <span className="text-faint text-meta">
                                    ({childCount})
                                  </span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

        {/* 6. Tag Cloud Widget (যা নিয়ে লিখছি, যাদের নিয়ে লিখছি) */}
        {settings?.showSidebarTags !== false && tags?.length > 0 && (
          <div className="widget">
            <div className="mb-5">
              <h3 className="text-small font-bold text-heading pb-1.5 border-b-2 border-line-strong inline-block">
                {settings?.sidebarTagsTitle || "যা নিয়ে লিখছি, যাদের নিয়ে লিখছি"}
              </h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {tags.map((tag: Tag) => (
                <Link
                  key={tag.id}
                  href={`/tag/${tag.slug}`}
                  className="group inline-flex items-center gap-1.5 pl-2.5 pr-3 py-1 text-meta text-body bg-tag hover:bg-tag-hover hover:text-heading transition-colors rounded-l-pill rounded-r-control no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-0"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-link shrink-0" />
                  <span>{tag.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
