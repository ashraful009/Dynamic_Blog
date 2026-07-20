import { z } from "zod";
const updateSiteSettingsSchema = z.object({
  body: z.object({
    siteName: z.string().optional(),
    navLinks: z.any().optional(), 
    headerCtaText: z.string().optional(),
    headerCtaLink: z.string().optional(),
    heroCoordText: z.string().nullable().optional(),
    heroTitle: z.string().optional(),
    heroSubtitle: z.string().nullable().optional(),
    heroPrimaryBtnText: z.string().nullable().optional(),
    heroPrimaryBtnLink: z.string().nullable().optional(),
    heroSecondaryBtnText: z.string().nullable().optional(),
    heroSecondaryBtnLink: z.string().nullable().optional(),
    heroPanelLabel: z.string().nullable().optional(),
    newsletterTitle: z.string().nullable().optional(),
    newsletterSubtitle: z.string().nullable().optional(),
    newsletterPlaceholder: z.string().nullable().optional(),
    newsletterBtnText: z.string().nullable().optional(),
    newsletterNote: z.string().nullable().optional(),
    footerMark: z.string().nullable().optional(),
    footerLinks: z.any().optional(),
    
    // Sidebar config
    sidebarAboutImage: z.string().nullable().optional(),
    sidebarAboutText: z.string().nullable().optional(),
    sidebarCustomHtml: z.string().nullable().optional(),
    showSidebarAbout: z.boolean().optional(),
    showSidebarNewsletter: z.boolean().optional(),
    showSidebarRecent: z.boolean().optional(),
    showSidebarCategories: z.boolean().optional(),
    showSidebarTags: z.boolean().optional(),
  }),
});
export const SiteSettingsValidation = {
  update: updateSiteSettingsSchema,
};
