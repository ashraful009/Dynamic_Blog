export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  showInHeader?: boolean;
  isSystem?: boolean;
  children?: Category[];
  _count?: {
    posts?: number;
  };
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Author {
  name?: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string;
  coverImage?: string | null;
  publishedAt?: string | null;
  createdAt?: string | null;
  author?: Author | null;
  category?: Category | null;
  categories?: Category[];
  tags?: Tag[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GoodreadsBook {
  title: string;
  author: string;
  coverUrl?: string;
  rating?: number;
  link?: string;
}

export interface FooterLink {
  href: string;
  label: string;
  [key: string]: unknown;
}

export interface SiteSettings {
  siteName?: string | null;
  siteSubtitle?: string | null;
  heroImage?: string | null;
  readMoreBtnText?: string | null;
  footerMark?: string | null;
  footerLinks?: FooterLink[] | null;
  showSidebarAbout?: boolean;
  sidebarAboutTitle?: string | null;
  sidebarAboutImage?: string | null;
  sidebarAboutText?: string | null;
  sidebarAboutLinkText?: string | null;
  sidebarAboutLinkUrl?: string | null;
  sidebarAboutSignoff?: string | null;
  showSidebarNewsletter?: boolean;
  sidebarNewsletterLabel?: string | null;
  newsletterTitle?: string | null;
  newsletterSubtitle?: string | null;
  newsletterPlaceholder?: string | null;
  newsletterBtnText?: string | null;
  newsletterNote?: string | null;
  showSidebarGoodreads?: boolean;
  sidebarGoodreadsTitle?: string | null;
  sidebarGoodreadsBooks?: GoodreadsBook[] | null;
  sidebarCustomHtml?: string | null;
  showSidebarRecent?: boolean;
  sidebarRecentTitle?: string | null;
  sidebarRecentCount?: number | string | null;
  showSidebarCategories?: boolean;
  sidebarCategoriesTitle?: string | null;
  showSidebarTags?: boolean;
  sidebarTagsTitle?: string | null;
  [key: string]: unknown;
}
