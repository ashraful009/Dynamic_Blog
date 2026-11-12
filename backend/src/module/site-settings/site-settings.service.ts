import prisma from "../../db";

const ALLOWED_FIELDS = [
  "siteName",
  "siteSubtitle",
  "navLinks",
  "headerCtaText",
  "headerCtaLink",
  "readMoreBtnText",
  "heroCoordText",
  "heroTitle",
  "heroSubtitle",
  "heroPrimaryBtnText",
  "heroPrimaryBtnLink",
  "heroSecondaryBtnText",
  "heroSecondaryBtnLink",
  "heroPanelLabel",
  "heroImage",
  "sidebarNewsletterLabel",
  "newsletterTitle",
  "newsletterSubtitle",
  "newsletterPlaceholder",
  "newsletterBtnText",
  "newsletterNote",
  "footerMark",
  "footerLinks",
  "sidebarAboutTitle",
  "sidebarAboutImage",
  "sidebarAboutText",
  "sidebarAboutLinkText",
  "sidebarAboutLinkUrl",
  "sidebarAboutSignoff",
  "sidebarGoodreadsTitle",
  "sidebarGoodreadsBooks",
  "sidebarRecentTitle",
  "sidebarRecentCount",
  "sidebarCategoriesTitle",
  "sidebarTagsTitle",
  "sidebarCustomHtml",
  "showSidebarAbout",
  "showSidebarNewsletter",
  "showSidebarGoodreads",
  "showSidebarRecent",
  "showSidebarCategories",
  "showSidebarTags",
];

const getSettings = async () => {
  let settings = await prisma.siteSettings.findUnique({
    where: { id: "default" },
  });
  if (!settings) {
    settings = await prisma.siteSettings.create({
      data: {
        id: "default",
        siteName: "ফেরদৌস আনাম জীবন",
        siteSubtitle: "লেখালেখি",
        heroTitle: "ফেরদৌস আনাম জীবন | লেখালেখি",
      },
    });
  }
  return settings;
};

const updateSettings = async (data: any) => {
  await getSettings();
  const sanitizedData: Record<string, any> = {};
  for (const key of ALLOWED_FIELDS) {
    if (key in data) {
      sanitizedData[key] = data[key];
    }
  }
  const updated = await prisma.siteSettings.update({
    where: { id: "default" },
    data: sanitizedData,
  });
  return updated;
};

export const SiteSettingsService = {
  getSettings,
  updateSettings,
};
