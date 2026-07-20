import React from "react";

export default function SidebarEditor({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      onChange({ ...data, [name]: checked });
    } else {
      onChange({ ...data, [name]: value });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold font-datum-display mb-1 text-text">Sidebar Configuration</h2>
        <p className="text-sm text-text-muted mb-6">Manage the content and widgets for the public layout sidebar.</p>
      </div>

      <div className="space-y-4 bg-bg-card border border-border p-5 rounded-xl">
        <h3 className="text-sm font-bold text-text mb-2">About Widget</h3>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Image URL</label>
          <input
            type="text"
            name="sidebarAboutImage"
            className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-text focus:border-primary outline-none"
            value={data.sidebarAboutImage || ""}
            onChange={handleChange}
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Text / Bio</label>
          <textarea
            name="sidebarAboutText"
            rows={4}
            className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-text focus:border-primary outline-none resize-y"
            value={data.sidebarAboutText || ""}
            onChange={handleChange}
            placeholder="Dear reader..."
          />
        </div>
      </div>

      <div className="space-y-4 bg-bg-card border border-border p-5 rounded-xl">
        <h3 className="text-sm font-bold text-text mb-2">Custom HTML / Iframe (e.g. Goodreads, Substack)</h3>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">HTML Code</label>
          <textarea
            name="sidebarCustomHtml"
            rows={6}
            className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-text focus:border-primary outline-none font-mono text-xs"
            value={data.sidebarCustomHtml || ""}
            onChange={handleChange}
            placeholder="<iframe src='...' />"
          />
        </div>
      </div>

      <div className="space-y-4 bg-bg-card border border-border p-5 rounded-xl">
        <h3 className="text-sm font-bold text-text mb-4">Widget Visibility</h3>
        
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="showSidebarAbout"
            checked={data.showSidebarAbout ?? true}
            onChange={handleChange}
            className="w-4 h-4 text-primary bg-bg border-border rounded focus:ring-primary"
          />
          <span className="text-sm font-medium text-text">Show About Widget</span>
        </label>
        
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="showSidebarNewsletter"
            checked={data.showSidebarNewsletter ?? true}
            onChange={handleChange}
            className="w-4 h-4 text-primary bg-bg border-border rounded focus:ring-primary"
          />
          <span className="text-sm font-medium text-text">Show Newsletter Widget</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="showSidebarRecent"
            checked={data.showSidebarRecent ?? true}
            onChange={handleChange}
            className="w-4 h-4 text-primary bg-bg border-border rounded focus:ring-primary"
          />
          <span className="text-sm font-medium text-text">Show Recent Posts</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="showSidebarCategories"
            checked={data.showSidebarCategories ?? true}
            onChange={handleChange}
            className="w-4 h-4 text-primary bg-bg border-border rounded focus:ring-primary"
          />
          <span className="text-sm font-medium text-text">Show Categories List</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="showSidebarTags"
            checked={data.showSidebarTags ?? true}
            onChange={handleChange}
            className="w-4 h-4 text-primary bg-bg border-border rounded focus:ring-primary"
          />
          <span className="text-sm font-medium text-text">Show Tags / Topics</span>
        </label>
      </div>
    </div>
  );
}
