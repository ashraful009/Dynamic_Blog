"use client";
import { useMutation } from "@tanstack/react-query";
import { mediaApi } from "@/lib/api";
import toast from "react-hot-toast";
import { Image as ImageIcon, X } from "lucide-react";
import Image from "next/image";

interface HeroImageEditorProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

export default function HeroImageEditor({ data, onChange }: HeroImageEditorProps) {
  const uploadMutation = useMutation({
    mutationFn: (file: File) => mediaApi.upload(file),
    onSuccess: (res) => {
      onChange({ ...data, heroImage: res.data.data.url });
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

  const handleRemoveImage = () => {
    onChange({ ...data, heroImage: null });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-[18px] font-semibold mb-2 font-display">
          Hero Grid Image
        </h3>
        <p className="text-sm text-text-muted mb-4">
          Upload an image that will automatically span across the 4 grids on the right side of the hero section. 
          A square image (1:1 ratio) works best.
        </p>

        {data.heroImage ? (
          <div className="relative w-full max-w-[320px] aspect-square rounded-lg overflow-hidden border border-border group">
            <Image
              src={data.heroImage}
              alt="Hero Grid Background"
              fill
              className="object-cover"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-black/60 text-white border-none rounded-full w-8 h-8 flex items-center justify-center cursor-pointer backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div>
            <input
              type="file"
              accept="image/*"
              id="hero-upload"
              className="hidden"
              onChange={handleFileUpload}
            />
            <label
              htmlFor="hero-upload"
              className={`flex flex-col items-center justify-center w-full max-w-[320px] aspect-square border-2 border-dashed border-border rounded-lg bg-bg-elevated cursor-pointer transition-all hover:bg-white/5 hover:border-primary/50 ${
                uploadMutation.isPending ? "opacity-70 pointer-events-none" : "opacity-100"
              }`}
            >
              <ImageIcon size={32} className="text-text-muted mb-3" />
              <span className="text-sm font-medium">
                {uploadMutation.isPending ? "Uploading..." : "Click to upload image"}
              </span>
              <span className="text-xs text-text-muted mt-1">
                JPEG, PNG up to 5MB
              </span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
