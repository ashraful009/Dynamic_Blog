"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { postsApi, mediaApi, CreatePostData } from "@/lib/api";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Save,
  Send,
  Image as ImageIcon,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import Editor from "@/components/editor/Editor";
import PostSeoPanel from "@/components/zibon/posts/PostSeoPanel";
import PostCategorySelect from "@/components/zibon/posts/PostCategorySelect";
import PostMetaFields from "@/components/zibon/posts/PostMetaFields";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-datum-display" });
const plexSans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-datum-body" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-datum-mono" });

export default function NewPostPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [readTime, setReadTime] = useState<number | "">("");
  const [displayOrder, setDisplayOrder] = useState<number | "">("");
  const [isFeatured, setIsFeatured] = useState(false);

  const [isLoaded, setIsLoaded] = useState(false);

  const DRAFT_KEY = "zibon_vlog_draft_post";

  useEffect(() => {
    const savedData = localStorage.getItem(DRAFT_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        const timeoutId = setTimeout(() => {
          setTitle(parsed.title || "");
          setContent(parsed.content || "");
          setExcerpt(parsed.excerpt || "");
          setCoverImage(parsed.coverImage || "");
          setMetaTitle(parsed.metaTitle || "");
          setMetaDescription(parsed.metaDescription || "");
          setCategoryId(parsed.categoryId || "");
          setReadTime(parsed.readTime || "");
          setDisplayOrder(parsed.displayOrder || "");
          setIsFeatured(parsed.isFeatured || false);
        }, 0);
        return () => clearTimeout(timeoutId);
      } catch (e) {
        console.error("Failed to parse saved draft", e);
      }
    }
    const timeoutId = setTimeout(() => setIsLoaded(true), 0);
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const dataToSave = {
      title,
      content,
      excerpt,
      coverImage,
      metaTitle,
      metaDescription,
      categoryId,
      readTime,
      displayOrder,
      isFeatured,
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(dataToSave));
  }, [title, content, excerpt, coverImage, metaTitle, metaDescription, categoryId, readTime, displayOrder, isFeatured, isLoaded]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        toast.success("Draft saved locally! 💾", { position: "bottom-right", duration: 2000 });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const createMutation = useMutation({
    mutationFn: (data: CreatePostData) => postsApi.create(data),
    onSuccess: () => {
      toast.success("Post created successfully! 🎉");
      localStorage.removeItem(DRAFT_KEY);
      router.push("/zibon/posts");
    },
    onError: (error: Error | unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to create post");
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => mediaApi.upload(file),
    onSuccess: (res) => {
      setCoverImage(res.data.data.url);
      toast.success("Image uploaded successfully!");
    },
    onError: () => {
      toast.error("Failed to upload image. Please try again.");
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    uploadMutation.mutate(file);
  };

  const handleSave = (status: "DRAFT" | "PUBLISHED") => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!content.trim() || content.length < 10) {
      toast.error("Content must be at least 10 characters");
      return;
    }

    createMutation.mutate({
      title: title.trim(),
      content,
      excerpt: excerpt.trim() || undefined,
      coverImage: coverImage.trim() || undefined,
      metaTitle: metaTitle.trim() || undefined,
      metaDescription: metaDescription.trim() || undefined,
      categoryId: categoryId || undefined,
      readTime: readTime ? Number(readTime) : undefined,
      displayOrder: displayOrder ? Number(displayOrder) : undefined,
      isFeatured,
      status,
    });
  };

  const handleSeoChange = (field: "metaTitle" | "metaDescription", value: string) => {
    if (field === "metaTitle") setMetaTitle(value);
    if (field === "metaDescription") setMetaDescription(value);
  };

  const handleMetaChange = (field: "readTime" | "displayOrder" | "isFeatured", value: string | number | boolean) => {
    if (field === "readTime") setReadTime(value as number);
    if (field === "displayOrder") setDisplayOrder(value as number);
    if (field === "isFeatured") setIsFeatured(value as boolean);
  };

  return (
    <div className={`animate-fade-in font-datum-body ${spaceGrotesk.variable} ${plexSans.variable} ${plexMono.variable}`}>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/zibon/posts"
            className="p-2 text-text-secondary hover:text-text bg-transparent hover:bg-white/5 rounded-full transition-colors flex items-center justify-center"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-[22px] font-extrabold font-datum-display">
              Create New Post
            </h1>
            <p className="text-text-muted text-[13px]">
              Write and publish your content
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="flex items-center gap-1.5 px-4 py-2 bg-bg-elevated hover:bg-bg-tertiary text-text border border-border rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            onClick={() => handleSave("DRAFT")}
            disabled={createMutation.isPending}
          >
            <Save size={15} />
            Save Draft
          </button>
          <button
            className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            onClick={() => handleSave("PUBLISHED")}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <div className="spinner" />
            ) : (
              <Send size={15} />
            )}
            Publish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 items-start">
        <div>
          <div className="mb-4">
            <input
              type="text"
              className="w-full text-[22px] font-bold font-datum-display px-5 py-4 bg-bg-card border border-border rounded-lg text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="Post title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="min-h-[500px] mb-8 font-datum-body">
            <Editor content={content} onChange={setContent} />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-bg-elevated/50 backdrop-blur-md border border-border rounded-xl p-5 shadow-glass">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <ImageIcon size={16} />
              Cover Image
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 bg-bg-card border border-border rounded-lg px-3 py-2 text-sm text-text focus:border-primary outline-none"
                placeholder="Image URL or upload"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
              />
              <input
                type="file"
                accept="image/*"
                id="cover-upload"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                className="px-3 py-2 bg-bg-elevated hover:bg-bg-tertiary text-text border border-border rounded-lg transition-colors flex items-center justify-center shrink-0 disabled:opacity-50"
                onClick={() => document.getElementById("cover-upload")?.click()}
                disabled={uploadMutation.isPending}
                title="Upload Image"
              >
                {uploadMutation.isPending ? <div className="spinner" /> : <Upload size={16} />}
              </button>
            </div>
            {coverImage && (
              <div className="mt-3 rounded-lg overflow-hidden border border-border">
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="w-full h-40 object-cover"
                />
              </div>
            )}
          </div>

          <div className="bg-bg-elevated/50 backdrop-blur-md border border-border rounded-xl p-5 shadow-glass">
            <h3 className="text-sm font-semibold mb-3">
              Excerpt
            </h3>
            <textarea
              className="w-full bg-bg-card border border-border rounded-lg px-3 py-2 text-sm text-text focus:border-primary outline-none min-h-[80px] resize-y"
              placeholder="Brief summary of your post..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              maxLength={500}
            />
            <p className="text-xs text-text-muted mt-1.5 text-right">
              {excerpt.length}/500
            </p>
          </div>

          <PostCategorySelect categoryId={categoryId} onChange={setCategoryId} />
          
          <PostMetaFields 
            readTime={readTime} 
            displayOrder={displayOrder} 
            isFeatured={isFeatured} 
            onChange={handleMetaChange} 
          />
          
          <PostSeoPanel 
            metaTitle={metaTitle} 
            metaDescription={metaDescription} 
            onChange={handleSeoChange} 
          />
        </div>
      </div>
    </div>
  );
}
