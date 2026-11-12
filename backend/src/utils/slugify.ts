import crypto from "crypto";

export const slugify = (text: string): string => {
  const cleaned = text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    // Preserve Unicode letters (\p{L}), combining marks/matras (\p{M}), numbers (\p{N}), and hyphens
    .replace(/[^\p{L}\p{M}\p{N}\-]+/gu, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");

  return cleaned;
};

export const generateUniqueSlug = (title: string, existingSlugs: string[]): string => {
  let slug = slugify(title);
  if (existingSlugs.includes(slug)) {
    const suffix = Math.random().toString(36).substring(2, 8);
    slug = `${slug}-${suffix}`;
  }
  return slug;
};
