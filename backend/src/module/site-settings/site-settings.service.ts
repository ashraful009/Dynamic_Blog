import prisma from "../../db";
const getSettings = async () => {
  let settings = await prisma.siteSettings.findUnique({
    where: { id: "default" },
  });
  if (!settings) {
    settings = await prisma.siteSettings.create({
      data: {
        id: "default",
        heroTitle: "Design is <accent>measured</accent>, not guessed.",
      },
    });
  }
  return settings;
};
const updateSettings = async (data: any) => {
  await getSettings();
  const updated = await prisma.siteSettings.update({
    where: { id: "default" },
    data,
  });
  return updated;
};
export const SiteSettingsService = {
  getSettings,
  updateSettings,
};
