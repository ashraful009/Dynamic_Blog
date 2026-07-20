"use client";
import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mediaApi } from "@/lib/api";
import toast from "react-hot-toast";
import {
  Upload,
  Trash2,
  Image as ImageIcon,
  Film,
  Copy,
  Check,
  X,
} from "lucide-react";

export default function MediaLibraryPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: mediaData, isLoading } = useQuery({
    queryKey: ["admin-media", typeFilter],
    queryFn: () => mediaApi.getAll({ limit: 50, type: typeFilter || undefined }),
    select: (res) => res.data,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => mediaApi.upload(file),
    onSuccess: () => {
      toast.success("File uploaded successfully! 📁");
      queryClient.invalidateQueries({ queryKey: ["admin-media"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Upload failed");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => mediaApi.delete(id),
    onSuccess: () => {
      toast.success("Media deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-media"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Delete failed");
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("URL copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this media file permanently?")) {
      deleteMutation.mutate(id);
    }
  };

  const media = mediaData?.data || [];

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold font-datum-display mb-1 text-text">
            Media Library
          </h1>
          <p className="text-sm text-text-muted">
            Manage your images and videos
          </p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
          >
            {uploadMutation.isPending ? (
              <>
                <div className="spinner" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={16} />
                Upload File
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex gap-1.5 mb-5">
        {[
          { value: "", label: "All" },
          { value: "IMAGE", label: "Images" },
          { value: "VIDEO", label: "Videos" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setTypeFilter(f.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              typeFilter === f.value 
                ? "bg-primary text-white" 
                : "bg-bg-card border border-border text-text hover:bg-bg-tertiary"
            }`}
          >
            {f.value === "IMAGE" ? (
              <ImageIcon size={14} />
            ) : f.value === "VIDEO" ? (
              <Film size={14} />
            ) : null}
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="p-16 text-center">
          <div className="spinner w-8 h-8 mx-auto" />
        </div>
      ) : media.length === 0 ? (
        <div className="bg-bg-elevated/50 backdrop-blur-md border border-border rounded-xl shadow-glass p-16 text-center flex flex-col items-center">
          <ImageIcon size={48} className="text-text-muted mb-4" />
          <p className="text-text-secondary text-base font-medium mb-2">
            No media files
          </p>
          <p className="text-text-muted text-sm">
            Upload images and videos to use in your posts
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
          {media.map((item: any) => (
            <div
              key={item.id}
              className="bg-bg-elevated/50 backdrop-blur-md border border-border rounded-xl shadow-glass hover:-translate-y-1 transition-transform overflow-hidden relative"
            >
              <div className="h-40 bg-bg-tertiary flex items-center justify-center relative overflow-hidden">
                {item.type === "IMAGE" ? (
                  <img
                    src={item.secureUrl}
                    alt={item.alt || "Media"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center flex flex-col items-center">
                    <Film size={32} className="text-text-muted" />
                    <p className="text-[11px] text-text-muted mt-2">
                      Video • {item.format}
                    </p>
                  </div>
                )}
                <span
                  className={`absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold rounded-full text-white uppercase ${
                    item.type === "IMAGE" ? "bg-primary" : "bg-accent-dark"
                  }`}
                >
                  {item.type}
                </span>
              </div>
              <div className="p-3">
                <p className="text-xs text-text-muted mb-2">
                  {item.width && item.height
                    ? `${item.width}×${item.height} • `
                    : ""}
                  {item.format}
                  {item.bytes ? ` • ${(item.bytes / 1024).toFixed(0)}KB` : ""}
                </p>
                <div className="flex gap-1">
                  <button
                    className="p-1.5 text-text-muted hover:text-text hover:bg-bg-tertiary rounded transition-colors bg-transparent border-none cursor-pointer"
                    onClick={() => handleCopyUrl(item.secureUrl, item.id)}
                    title="Copy URL"
                  >
                    {copiedId === item.id ? (
                      <Check size={14} className="text-success" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                  <button
                    className="p-1.5 text-danger/70 hover:text-danger hover:bg-danger/10 rounded transition-colors disabled:opacity-50 bg-transparent border-none cursor-pointer"
                    onClick={() => handleDelete(item.id)}
                    title="Delete"
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
