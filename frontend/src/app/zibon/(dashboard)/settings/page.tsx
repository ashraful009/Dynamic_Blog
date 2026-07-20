"use client";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import toast from "react-hot-toast";
import { User, Shield, Save } from "lucide-react";

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name || "");

  const updateMutation = useMutation({
    mutationFn: (data: { name: string }) => authApi.updateProfile(data),
    onSuccess: (res) => {
      const updatedUser = res.data.data;
      setUser(updatedUser);
      toast.success("Profile updated!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Update failed");
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    updateMutation.mutate({ name: name.trim() });
  };

  return (
    <div className="animate-fade-in max-w-[600px]">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold font-datum-display mb-1 text-text">
          Settings
        </h1>
        <p className="text-sm text-text-muted">
          Manage your account settings
        </p>
      </div>

      <div className="bg-bg-elevated/50 backdrop-blur-md border border-border rounded-xl shadow-glass p-6 mb-5">
        <h2 className="text-base font-bold font-datum-display mb-5 flex items-center gap-2.5 text-text">
          <User size={18} />
          Profile
        </h2>
        <form onSubmit={handleSave}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Display Name</label>
            <input
              type="text"
              className="w-full bg-bg-card border border-border rounded-lg px-4 py-2 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="mb-5">
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
            <input
              type="email"
              className="w-full bg-bg-card border border-border rounded-lg px-4 py-2 text-text opacity-60 cursor-not-allowed outline-none"
              value={user?.email || ""}
              disabled
            />
            <p className="text-[11px] text-text-muted mt-1">
              Email cannot be changed
            </p>
          </div>
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <div className="spinner" />
            ) : (
              <Save size={15} />
            )}
            Save Changes
          </button>
        </form>
      </div>

      <div className="bg-bg-elevated/50 backdrop-blur-md border border-border rounded-xl shadow-glass p-6">
        <h2 className="text-base font-bold font-datum-display mb-4 flex items-center gap-2.5 text-text">
          <Shield size={18} />
          Account
        </h2>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Role</span>
            <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold uppercase bg-success/10 text-success">
              {user?.role || "ADMIN"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">User ID</span>
            <span className="text-xs font-mono text-text-muted">
              {user?.id?.slice(0, 12)}...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
