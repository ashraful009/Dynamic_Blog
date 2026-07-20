import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import DatumIndex from "@/components/public/datum/DatumIndex";

async function getCategoryData(slug: string) {
  try {
    const [catRes, postsRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}/categories`, { next: { revalidate: 60 } }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}/posts?categorySlug=${slug}&limit=20`, { next: { revalidate: 60 } })
    ]);
    let category = null;
    if (catRes.ok) {
      const catJson = await catRes.json();
      const findCat = (cats: any[]): any => {
        for (const c of cats) {
          if (c.slug === slug) return c;
          if (c.children) {
            const found = findCat(c.children);
            if (found) return found;
          }
        }
        return null;
      };
      category = findCat(catJson.data || []);
    }
    if (!category) return null;
    let posts = [];
    if (postsRes.ok) {
      const postsJson = await postsRes.json();
      posts = postsJson.data || [];
    }
    return { category, posts };
  } catch (error) {
    console.error("Error fetching category data:", error);
    return null;
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCategoryData(slug);
  if (!data) {
    return { title: "Category Not Found" };
  }
  return {
    title: `${data.category.name} - Zibon Vlog`,
    description: `Posts in category ${data.category.name}`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getCategoryData(slug);
  if (!data) {
    notFound();
  }
  const { category, posts } = data;
  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10">
      <header className="mb-10 pb-6 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <Link href="/" className="text-primary-light hover:text-primary transition-colors no-underline text-sm font-medium">
            Home
          </Link>
          <span className="text-text-muted text-sm">/</span>
          <span className="text-text-secondary text-sm">Category</span>
        </div>
        <h1 className="font-datum-display text-4xl text-text font-extrabold m-0">
          {category.name}
        </h1>
        <p className="text-text-secondary mt-2 text-base m-0">
          Browsing all published posts in {category.name}.
        </p>
      </header>
      {posts.length > 0 ? (
        <DatumIndex posts={posts} />
      ) : (
        <div className="py-16 text-center bg-bg-secondary rounded-xl border border-dashed border-border">
          <h2 className="text-xl text-text font-bold mb-2">No posts found</h2>
          <p className="text-text-secondary mb-5">There are currently no published posts in this category.</p>
          <Link href="/" className="inline-block px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors no-underline">
            Return Home
          </Link>
        </div>
      )}
    </div>
  );
}
