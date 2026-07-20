export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};
export const generateUniqueSlug = (title: string, existingSlugs: string[]): string => {
  let slug = slugify(title);
  if (existingSlugs.includes(slug)) {
    const suffix = Math.random().toString(36).substring(2, 8);
    slug = `${slug}-${suffix}`;
  }
  return slug;
};
