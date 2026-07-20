"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { siteSettingsApi } from "@/lib/api";
import toast from "react-hot-toast";
import { Home } from "lucide-react";

import HeroEditor from "@/components/zibon/homepage/HeroEditor";
import NewsletterEditor from "@/components/zibon/homepage/NewsletterEditor";
import HeaderFooterEditor from "@/components/zibon/homepage/HeaderFooterEditor";
import FeaturedPostSelector from "@/components/zibon/homepage/FeaturedPostSelector";
import HeroImageEditor from "@/components/zibon/homepage/HeroImageEditor";
import SidebarEditor from "@/components/zibon/homepage/SidebarEditor";

export default function HomepageSettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("hero");
  const [formData, setFormData] = useState<any>({});

  const { data: res, isLoading } = useQuery({
    queryKey: ["admin-site-settings"],
    queryFn: () => siteSettingsApi.get(),
  });

  useEffect(() => {
    if (res?.data?.data) {
      const timeoutId = setTimeout(() => setFormData(res.data.data), 0);
      return () => clearTimeout(timeoutId);
    }
  }, [res]);

  const mutation = useMutation({
    mutationFn: (data: any) => siteSettingsApi.update(data),
    onSuccess: () => {
      toast.success("Settings saved successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-site-settings"] });
    },
    onError: () => toast.error("Failed to save settings"),
  });

  const handleSave = () => {
    mutation.mutate(formData);
  };

  const tabs = [
    { id: "hero", label: "Hero Section" },
    { id: "hero-image", label: "Hero Image" },
    { id: "featured", label: "Featured Post" },
    { id: "sidebar", label: "Sidebar Widgets" },
    { id: "newsletter", label: "Newsletter" },
    { id: "header-footer", label: "Header & Footer" },
  ];

  if (isLoading) return <div className="p-10 text-center"><div className="spinner mx-auto"></div></div>;

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold font-datum-display mb-1 flex items-center gap-2.5 text-text">
            <Home size={20} />
            Homepage Settings
          </h1>
          <p className="text-sm text-text-muted">
            Manage the content of the public Datum homepage.
          </p>
        </div>
        <button 
          className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          onClick={handleSave}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="bg-bg-elevated/50 backdrop-blur-md border border-border rounded-xl shadow-glass flex flex-col md:flex-row min-h-[500px]">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-[240px] border-b md:border-b-0 md:border-r border-border py-4 shrink-0">
          <div className="flex md:flex-col gap-1 px-3 overflow-x-auto md:overflow-visible">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-left px-4 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id 
                    ? "bg-bg-card text-text font-medium border border-border/50 shadow-sm" 
                    : "text-text-secondary hover:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-5 md:p-8 overflow-y-auto">
          {activeTab === "hero" && (
            <HeroEditor data={formData} onChange={setFormData} />
          )}
          {activeTab === "hero-image" && (
            <HeroImageEditor data={formData} onChange={setFormData} />
          )}
          {activeTab === "featured" && (
            <FeaturedPostSelector />
          )}
          {activeTab === "sidebar" && (
            <SidebarEditor data={formData} onChange={setFormData} />
          )}
          {activeTab === "newsletter" && (
            <NewsletterEditor data={formData} onChange={setFormData} />
          )}
          {activeTab === "header-footer" && (
            <HeaderFooterEditor data={formData} onChange={setFormData} />
          )}
        </div>
      </div>
    </div>
  );
}
