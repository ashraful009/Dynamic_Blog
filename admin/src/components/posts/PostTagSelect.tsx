"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tagsApi } from "@/lib/api";
import { Tags, Plus } from "lucide-react";
import toast from "react-hot-toast";

interface PostTagSelectProps {
  selectedIds: string[];
  onChange: (tagIds: string[]) => void;
}

export default function PostTagSelect({ selectedIds, onChange }: PostTagSelectProps) {
  const queryClient = useQueryClient();
  const [newTagName, setNewTagName] = useState("");

  const { data: res, isLoading } = useQuery({
    queryKey: ["admin-tags"],
    queryFn: () => tagsApi.getAll(),
  });

  const tags = res?.data?.data || [];

  const createTagMutation = useMutation({
    mutationFn: (name: string) => tagsApi.create({ name }),
    onSuccess: (createdRes) => {
      const createdTag = createdRes?.data?.data;
      queryClient.invalidateQueries({ queryKey: ["admin-tags"] });
      if (createdTag?.id && !selectedIds.includes(createdTag.id)) {
        onChange([...selectedIds, createdTag.id]);
      }
      setNewTagName("");
      toast.success("Tag created & selected!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to create tag");
    },
  });

  const toggleTag = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const handleQuickAdd = () => {
    if (!newTagName.trim()) return;
    createTagMutation.mutate(newTagName.trim());
  };

  return (
    <div className="bg-bg-elevated/50 backdrop-blur-md border border-border rounded-xl p-5 shadow-glass">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-semibold text-text flex items-center gap-2">
          <Tags size={16} />
          Tags ({selectedIds.length})
        </label>
        {selectedIds.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs text-text-muted hover:text-danger transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Quick Add Tag */}
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleQuickAdd();
            }
          }}
          placeholder="Quick add tag (e.g. ওরহান পামুক)..."
          className="flex-1 bg-bg-card border border-border rounded-lg px-3 py-1.5 text-xs text-text focus:border-primary outline-none"
        />
        <button
          type="button"
          onClick={handleQuickAdd}
          disabled={!newTagName.trim() || createTagMutation.isPending}
          className="px-2.5 py-1.5 bg-bg-elevated hover:bg-bg-tertiary text-text border border-border rounded-lg text-xs font-medium flex items-center gap-1 transition-colors disabled:opacity-50"
        >
          <Plus size={14} />
          Add
        </button>
      </div>

      {isLoading ? (
        <div className="text-[13px] text-text-muted">Loading tags...</div>
      ) : (
        <div className="flex flex-wrap gap-1.5 max-h-[200px] overflow-y-auto pr-1">
          {tags.map((tag: any) => {
            const isSelected = selectedIds.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors border ${
                  isSelected
                    ? "bg-primary text-white border-primary"
                    : "bg-bg-card text-text-secondary border-border hover:border-primary/50 hover:text-text"
                }`}
              >
                {tag.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

