import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mediaApi } from "@/lib/api";
import { X, Upload, Image as ImageIcon, Film } from "lucide-react";
import toast from "react-hot-toast";

interface EditorMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: { url: string; type: string; alt?: string }) => void;
}

export default function EditorMediaModal({
  isOpen,
  onClose,
  onSelect,
}: EditorMediaModalProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"library" | "upload">("library");

  const { data: mediaData, isLoading } = useQuery({
    queryKey: ["admin-media-editor"],
    queryFn: () => mediaApi.getAll({ limit: 50 }),
    enabled: isOpen && activeTab === "library",
    select: (res) => res.data,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => mediaApi.upload(file),
    onSuccess: (res) => {
      toast.success("Upload complete!");
      const item = res.data.data;
      onSelect({ url: item.secureUrl, type: item.type, alt: item.alt });
      onClose();
      queryClient.invalidateQueries({ queryKey: ["admin-media-editor"] });
      queryClient.invalidateQueries({ queryKey: ["admin-media"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Upload failed");
    },
  });

  if (!isOpen) return null;

  const media = mediaData?.data || [];

  return (
    <div className="fixed inset-0 bg-[#0A0A0F]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-5">
      <div className="bg-bg-elevated/50 backdrop-blur-md border border-border shadow-glass rounded-xl w-full max-w-[800px] h-[80vh] flex flex-col overflow-hidden animate-fade-in">
        
        <div className="flex justify-between items-center p-5 border-b border-border bg-bg-card/50">
          <h2 className="text-lg font-bold text-text">Insert Media</h2>
          <button 
            onClick={onClose} 
            className="p-1.5 text-text-muted hover:text-text hover:bg-bg-tertiary rounded transition-colors bg-transparent border-none cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex border-b border-border bg-bg-card/30">
          <button
            className={`px-6 py-4 font-semibold text-sm transition-colors border-b-2 bg-transparent cursor-pointer ${
              activeTab === "library" 
                ? "border-primary text-primary-light" 
                : "border-transparent text-text-secondary hover:text-text"
            }`}
            onClick={() => setActiveTab("library")}
          >
            Media Library
          </button>
          <button
            className={`px-6 py-4 font-semibold text-sm transition-colors border-b-2 bg-transparent cursor-pointer ${
              activeTab === "upload" 
                ? "border-primary text-primary-light" 
                : "border-transparent text-text-secondary hover:text-text"
            }`}
            onClick={() => setActiveTab("upload")}
          >
            Upload New
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 bg-bg-card/20">
          {activeTab === "library" && (
            <>
              {isLoading ? (
                <div className="p-10 text-center">
                  <div className="spinner mx-auto" />
                </div>
              ) : media.length === 0 ? (
                <div className="text-center p-16">
                  <p className="text-text-muted">No media found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
                  {media.map((item: any) => (
                    <div
                      key={item.id}
                      className="h-[120px] bg-bg-tertiary rounded-lg overflow-hidden relative cursor-pointer border border-border hover:-translate-y-0.5 hover:shadow-glass-hover transition-all"
                      onClick={() =>
                        onSelect({
                          url: item.secureUrl,
                          type: item.type,
                          alt: item.alt,
                        })
                      }
                    >
                      {item.type === "IMAGE" ? (
                        <img
                          src={item.secureUrl}
                          alt={item.alt || ""}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-text-muted">
                          <Film size={32} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          {activeTab === "upload" && (
            <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-10 text-center bg-bg-card/30">
              {uploadMutation.isPending ? (
                <>
                  <div className="spinner w-8 h-8 mb-4 mx-auto" />
                  <p className="text-text font-medium">Uploading...</p>
                </>
              ) : (
                <>
                  <Upload size={48} className="text-text-muted mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-text">Drag & Drop or Select File</h3>
                  <p className="text-sm text-text-muted mb-6">
                    Supports images and videos (max 100MB)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadMutation.mutate(file);
                    }}
                  />
                  <button
                    className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors border-none cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Select File
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
