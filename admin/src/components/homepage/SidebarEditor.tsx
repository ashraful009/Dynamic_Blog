"use client";
import React from "react";
import { Plus, Trash2, Upload, BookOpen } from "lucide-react";
import { mediaApi } from "@/lib/api";
import toast from "react-hot-toast";

interface GoodreadsBook {
  title: string;
  author: string;
  coverUrl: string;
  rating: number;
  link?: string;
}

export default function SidebarEditor({
  data,
  onChange,
}: {
  data: any;
  onChange: (data: any) => void;
}) {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      onChange({ ...data, [name]: checked });
    } else if (type === "number") {
      onChange({ ...data, [name]: value ? Number(value) : 5 });
    } else {
      onChange({ ...data, [name]: value });
    }
  };

  const books: GoodreadsBook[] = Array.isArray(data.sidebarGoodreadsBooks)
    ? data.sidebarGoodreadsBooks
    : [];

  const handleBookChange = (
    index: number,
    field: keyof GoodreadsBook,
    value: string | number
  ) => {
    const updated = [...books];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, sidebarGoodreadsBooks: updated });
  };

  const handleAddBook = () => {
    const updated: GoodreadsBook[] = [
      ...books,
      {
        title: "",
        author: "",
        coverUrl: "",
        rating: 0,
        link: "https://www.goodreads.com",
      },
    ];
    onChange({ ...data, sidebarGoodreadsBooks: updated });
  };

  const handleRemoveBook = (index: number) => {
    const updated = books.filter((_, i) => i !== index);
    onChange({ ...data, sidebarGoodreadsBooks: updated });
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await mediaApi.upload(file);
      onChange({ ...data, sidebarAboutImage: res.data.data.url });
      toast.success("Banner image uploaded!");
    } catch {
      toast.error("Failed to upload image");
    }
  };

  const handleBookCoverUpload = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await mediaApi.upload(file);
      handleBookChange(index, "coverUrl", res.data.data.url);
      toast.success("Book cover uploaded!");
    } catch {
      toast.error("Failed to upload book cover");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold font-datum-display mb-1 text-text">
          Sidebar Configuration
        </h2>
        <p className="text-sm text-text-muted mb-6">
          Manage all 6 sidebar widgets, headings, Goodreads books, and visibility toggles.
        </p>
      </div>

      {/* 1. Author Appeal / About Widget */}
      <div className="space-y-4 bg-bg-card border border-border p-5 rounded-xl">
        <h3 className="text-sm font-bold text-text mb-2">
          1. Author Appeal / About Widget (&quot;Help us to keep on writing!&quot;)
        </h3>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Banner Image URL (Leave empty to use classic black &quot;Help us to keep on writing!&quot; banner)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              name="sidebarAboutImage"
              className="flex-1 bg-bg border border-border rounded-lg px-4 py-2 text-text focus:border-primary outline-none text-sm"
              value={data.sidebarAboutImage || ""}
              onChange={handleChange}
              placeholder="https://..."
            />
            <input
              type="file"
              accept="image/*"
              id="sidebar-banner-upload"
              className="hidden"
              onChange={handleBannerUpload}
            />
            <button
              type="button"
              onClick={() =>
                document.getElementById("sidebar-banner-upload")?.click()
              }
              className="px-3 py-2 bg-bg-elevated hover:bg-bg-tertiary text-text border border-border rounded-lg flex items-center gap-1.5 text-xs font-medium"
            >
              <Upload size={14} />
              Upload
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Greeting Title
            </label>
            <input
              type="text"
              name="sidebarAboutTitle"
              className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-text focus:border-primary outline-none text-sm"
              value={data.sidebarAboutTitle || ""}
              onChange={handleChange}
              placeholder="প্রিয় পাঠক,"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Author Signoff
            </label>
            <input
              type="text"
              name="sidebarAboutSignoff"
              className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-text focus:border-primary outline-none text-sm"
              value={data.sidebarAboutSignoff || ""}
              onChange={handleChange}
              placeholder="– সুহান রিজওয়ান"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Appeal Text / Bio (Use <code className="text-primary">{"{{LINK}}"}</code> where you want the red inline link to appear)
          </label>
          <textarea
            name="sidebarAboutText"
            rows={6}
            className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-text focus:border-primary outline-none resize-y text-sm"
            value={data.sidebarAboutText || ""}
            onChange={handleChange}
            placeholder="০৮ বছর ধরে এই ওয়েবসাইটে আমি আলোচনা করছি..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Inline Red Link Text (<code className="text-primary">{"{{LINK}}"}</code>)
            </label>
            <input
              type="text"
              name="sidebarAboutLinkText"
              className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-text focus:border-primary outline-none text-sm"
              value={data.sidebarAboutLinkText || ""}
              onChange={handleChange}
              placeholder="এই লিংক থেকে"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Inline Red Link URL
            </label>
            <input
              type="text"
              name="sidebarAboutLinkUrl"
              className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-text focus:border-primary outline-none text-sm"
              value={data.sidebarAboutLinkUrl || ""}
              onChange={handleChange}
              placeholder="/category/prokashito-boi"
            />
          </div>
        </div>
      </div>

      {/* 2. Goodreads Reading List Widget */}
      <div className="space-y-4 bg-bg-card border border-border p-5 rounded-xl">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-bold text-text flex items-center gap-2">
            <BookOpen size={16} />
            2. Goodreads Reading List Widget (গুডরিডসের পড়াশোনা)
          </h3>
          <button
            type="button"
            onClick={handleAddBook}
            className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Plus size={14} />
            Add Book
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Goodreads Widget Heading
          </label>
          <input
            type="text"
            name="sidebarGoodreadsTitle"
            className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-text focus:border-primary outline-none text-sm"
            value={data.sidebarGoodreadsTitle || ""}
            onChange={handleChange}
            placeholder="গুডরিডসের পড়াশোনা"
          />
        </div>

        <div className="space-y-3">
          {books.map((book, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-bg rounded-lg border border-border/80 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-secondary uppercase">
                  Book #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveBook(idx)}
                  className="text-danger/70 hover:text-danger p-1 rounded transition-colors"
                  title="Remove Book"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-text-muted mb-1">
                    Book Title
                  </label>
                  <input
                    type="text"
                    value={book.title || ""}
                    onChange={(e) =>
                      handleBookChange(idx, "title", e.target.value)
                    }
                    placeholder="e.g. বিশ্বাসঘাতকগণ"
                    className="w-full bg-bg-card border border-border rounded px-3 py-1.5 text-xs text-text focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1">
                    Author Name
                  </label>
                  <input
                    type="text"
                    value={book.author || ""}
                    onChange={(e) =>
                      handleBookChange(idx, "author", e.target.value)
                    }
                    placeholder="e.g. Afsan Chowdhury"
                    className="w-full bg-bg-card border border-border rounded px-3 py-1.5 text-xs text-text focus:border-primary outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_110px_1fr] gap-3">
                <div>
                  <label className="block text-xs text-text-muted mb-1">
                    Cover Image URL
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={book.coverUrl || ""}
                      onChange={(e) =>
                        handleBookChange(idx, "coverUrl", e.target.value)
                      }
                      placeholder="https://..."
                      className="flex-1 bg-bg-card border border-border rounded px-3 py-1.5 text-xs text-text focus:border-primary outline-none"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      id={`book-cover-${idx}`}
                      className="hidden"
                      onChange={(e) => handleBookCoverUpload(idx, e)}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById(`book-cover-${idx}`)?.click()
                      }
                      className="px-2 py-1.5 bg-bg-elevated border border-border rounded text-xs text-text hover:bg-bg-tertiary"
                      title="Upload Cover"
                    >
                      <Upload size={12} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1">
                    Rating (0–5 ★)
                  </label>
                  <select
                    value={book.rating ?? 0}
                    onChange={(e) =>
                      handleBookChange(idx, "rating", Number(e.target.value))
                    }
                    className="w-full bg-bg-card border border-border rounded px-2.5 py-1.5 text-xs text-text focus:border-primary outline-none"
                  >
                    {[0, 1, 2, 3, 4, 5].map((r) => (
                      <option key={r} value={r}>
                        {r} {r === 1 ? "Star" : "Stars"}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1">
                    Goodreads Link
                  </label>
                  <input
                    type="text"
                    value={book.link || ""}
                    onChange={(e) =>
                      handleBookChange(idx, "link", e.target.value)
                    }
                    placeholder="https://www.goodreads.com/..."
                    className="w-full bg-bg-card border border-border rounded px-3 py-1.5 text-xs text-text focus:border-primary outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
          {books.length === 0 && (
            <p className="text-xs text-text-muted italic">
              No books added yet. Click &quot;Add Book&quot; to add books to the Goodreads widget.
            </p>
          )}
        </div>
      </div>

      {/* 3. Section Headings & Recent Posts Count */}
      <div className="space-y-4 bg-bg-card border border-border p-5 rounded-xl">
        <h3 className="text-sm font-bold text-text mb-2">
          3. Widget Headings & Counts
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Recent Posts Heading
            </label>
            <input
              type="text"
              name="sidebarRecentTitle"
              className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-text focus:border-primary outline-none text-sm"
              value={data.sidebarRecentTitle || ""}
              onChange={handleChange}
              placeholder="সাম্প্রতিক লেখা"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Number of Recent Posts to Display
            </label>
            <input
              type="number"
              name="sidebarRecentCount"
              min={1}
              max={20}
              className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-text focus:border-primary outline-none text-sm"
              value={data.sidebarRecentCount ?? 5}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Categories Widget Heading
            </label>
            <input
              type="text"
              name="sidebarCategoriesTitle"
              className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-text focus:border-primary outline-none text-sm"
              value={data.sidebarCategoriesTitle || ""}
              onChange={handleChange}
              placeholder="বিষয় নির্বাচন"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Tags Widget Heading
            </label>
            <input
              type="text"
              name="sidebarTagsTitle"
              className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-text focus:border-primary outline-none text-sm"
              value={data.sidebarTagsTitle || ""}
              onChange={handleChange}
              placeholder="যা নিয়ে লিখছি, যাদের নিয়ে লিখছি"
            />
          </div>
        </div>
      </div>

      {/* 4. Optional Custom HTML */}
      <div className="space-y-4 bg-bg-card border border-border p-5 rounded-xl">
        <h3 className="text-sm font-bold text-text mb-2">
          4. Additional Custom HTML / Embed (Optional)
        </h3>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            HTML Code
          </label>
          <textarea
            name="sidebarCustomHtml"
            rows={4}
            className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-text focus:border-primary outline-none font-mono text-xs"
            value={data.sidebarCustomHtml || ""}
            onChange={handleChange}
            placeholder="<iframe src='...' />"
          />
        </div>
      </div>

      {/* 5. Widget Visibility */}
      <div className="space-y-3 bg-bg-card border border-border p-5 rounded-xl">
        <h3 className="text-sm font-bold text-text mb-3">
          5. Widget Visibility Toggles
        </h3>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="showSidebarAbout"
            checked={data.showSidebarAbout ?? true}
            onChange={handleChange}
            className="w-4 h-4 text-primary bg-bg border-border rounded focus:ring-primary"
          />
          <span className="text-sm font-medium text-text">
            Show Author Appeal / About Widget
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="showSidebarNewsletter"
            checked={data.showSidebarNewsletter ?? true}
            onChange={handleChange}
            className="w-4 h-4 text-primary bg-bg border-border rounded focus:ring-primary"
          />
          <span className="text-sm font-medium text-text">
            Show Newsletter Subscription Widget
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="showSidebarGoodreads"
            checked={data.showSidebarGoodreads ?? true}
            onChange={handleChange}
            className="w-4 h-4 text-primary bg-bg border-border rounded focus:ring-primary"
          />
          <span className="text-sm font-medium text-text">
            Show Goodreads Reading List Widget (গুডরিডসের পড়াশোনা)
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="showSidebarRecent"
            checked={data.showSidebarRecent ?? true}
            onChange={handleChange}
            className="w-4 h-4 text-primary bg-bg border-border rounded focus:ring-primary"
          />
          <span className="text-sm font-medium text-text">
            Show Recent Posts Widget (সাম্প্রতিক লেখা)
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="showSidebarCategories"
            checked={data.showSidebarCategories ?? true}
            onChange={handleChange}
            className="w-4 h-4 text-primary bg-bg border-border rounded focus:ring-primary"
          />
          <span className="text-sm font-medium text-text">
            Show Categories Tree Widget (বিষয় নির্বাচন)
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="showSidebarTags"
            checked={data.showSidebarTags ?? true}
            onChange={handleChange}
            className="w-4 h-4 text-primary bg-bg border-border rounded focus:ring-primary"
          />
          <span className="text-sm font-medium text-text">
            Show Tags Cloud Widget (যা নিয়ে লিখছি, যাদের নিয়ে লিখছি)
          </span>
        </label>
      </div>
    </div>
  );
}
