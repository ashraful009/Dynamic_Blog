"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postsApi, mediaApi, UpdatePostData } from "@/lib/api";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Save,
  Send,
  Loader,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import Editor from "@/components/editor/Editor";
import PostSeoPanel from "@/components/posts/PostSeoPanel";
import PostCategorySelect from "@/components/posts/PostCategorySelect";
import PostTagSelect from "@/components/posts/PostTagSelect";
import PostMetaFields from "@/components/posts/PostMetaFields";

export default function EditPostPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const postId = params.id as string;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [readTime, setReadTime] = useState<number | "">("");
  const [displayOrder, setDisplayOrder] = useState<number | "">("");
  const [isFeatured, setIsFeatured] = useState(false);

  const { data: postData, isLoading: isFetching } = useQuery({
    queryKey: ["admin-post", postId],
    queryFn: () => postsApi.getById(postId),
    select: (res) => res.data.data,
    enabled: !!postId,
  });

  useEffect(() => {
    if (postData) {
      const timeoutId = setTimeout(() => {
        setTitle(postData.title || "");
        setContent(postData.content || "");
        setExcerpt(postData.excerpt || "");
        setCoverImage(postData.coverImage || "");
        setMetaTitle(postData.metaTitle || "");
        setMetaDescription(postData.metaDescription || "");
        setStatus(postData.status || "DRAFT");

        const initialCategoryIds =
          Array.isArray(postData.categories) && postData.categories.length > 0
            ? postData.categories.map((c: any) => c.id)
            : postData.categoryId
            ? [postData.categoryId]
            : [];
        setCategoryIds(initialCategoryIds);

        const initialTagIds = Array.isArray(postData.tags)
          ? postData.tags.map((t: any) => t.id)
          : [];
        setTagIds(initialTagIds);

        setReadTime(postData.readTime || "");
        setDisplayOrder(postData.displayOrder || "");
        setIsFeatured(postData.isFeatured || false);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [postData]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdatePostData) => postsApi.update(postId, data),
    onSuccess: () => {
      toast.success("Post updated successfully! ✅");
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-post", postId] });
    },
    onError: (error: Error | unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to update post");
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => mediaApi.upload(file),
    onSuccess: (res) => {
      setCoverImage(res.data.data.secureUrl || res.data.data.url);
      toast.success("Cover image uploaded");
    },
    onError: () => toast.error("Failed to upload image"),
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

  const handleSave = (newStatus?: "DRAFT" | "PUBLISHED") => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!content.trim() || content.length < 10) {
      toast.error("Content must be at least 10 characters");
      return;
    }

    const data: UpdatePostData = {
      title: title.trim(),
      content,
      excerpt: excerpt.trim() || undefined,
      coverImage: coverImage.trim() || undefined,
      metaTitle: metaTitle.trim() || undefined,
      metaDescription: metaDescription.trim() || undefined,
      categoryId: categoryIds[0] || null,
      categoryIds,
      tagIds,
      readTime: readTime ? Number(readTime) : undefined,
      displayOrder: displayOrder ? Number(displayOrder) : undefined,
      isFeatured,
    };

    if (newStatus) {
      data.status = newStatus;
    }

    updateMutation.mutate(data);
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

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader size={32} className="text-primary animate-spin-slow mx-auto" />
          <p className="text-text-muted mt-3 text-sm">
            Loading post...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in font-datum-body">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/posts"
            className="p-2 text-text-secondary hover:text-text bg-transparent hover:bg-white/5 rounded-full transition-colors flex items-center justify-center"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-[22px] font-extrabold font-datum-display">
              Edit Post
            </h1>
            <p className="text-text-muted text-[13px]">
              Update your content •{" "}
              <span
                className={`inline-block px-2 py-0.5 rounded text-xs font-semibold uppercase align-middle ${
                  status === "PUBLISHED" ? "bg-success/10 text-success" : "bg-bg-elevated text-text-secondary border border-border"
                }`}
              >
                {status}
              </span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="flex items-center gap-1.5 px-4 py-2 bg-bg-elevated hover:bg-bg-tertiary text-text border border-border rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            onClick={() => handleSave("DRAFT")}
            disabled={updateMutation.isPending}
          >
            <Save size={15} />
            Save Draft
          </button>
          <button
            className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            onClick={() => handleSave("PUBLISHED")}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <div className="spinner" />
            ) : (
              <Send size={15} />
            )}
            {status === "PUBLISHED" ? "Update" : "Publish"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 items-start">
        <div className="min-w-0">
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
              Excerpt (Multi-paragraph supported)
            </h3>
            <textarea
              className="w-full bg-bg-card border border-border rounded-lg px-3 py-2 text-sm text-text focus:border-primary outline-none min-h-[120px] resize-y"
              placeholder="Summary or preview paragraphs shown on homepage cards..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              maxLength={2000}
            />
            <p className="text-xs text-text-muted mt-1.5 text-right">
              {excerpt.length}/2000
            </p>
          </div>

          <PostCategorySelect selectedIds={categoryIds} onChange={setCategoryIds} />

          <PostTagSelect selectedIds={tagIds} onChange={setTagIds} />
          
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

