import prisma from "../../db";
import { sanitizeHtml } from "../../utils/sanitize";

const getAboutPage = async () => {
  let about = await (prisma as any).aboutPage.findUnique({
    where: { id: "default" },
  });

  if (!about) {
    about = await (prisma as any).aboutPage.create({
      data: {
        id: "default",
        name: "John Doe",
        designation: "Developer",
        biography: "This is a default biography. Please update it in the admin panel.",
        skills: [],
      },
    });
  }

  return about;
};

const updateAboutPage = async (data: any) => {
  const existing = await (prisma as any).aboutPage.findUnique({
    where: { id: "default" },
  });

  if (!existing) {
    return await (prisma as any).aboutPage.create({
      data: {
        id: "default",
        name: data.name,
        designation: data.designation,
        phone: data.phone,
        email: data.email,
        biography: data.biography ? sanitizeHtml(data.biography) : data.biography,
        profileImage: data.profileImage,
        signatureImage: data.signatureImage,
        skills: data.skills || [],
      },
    });
  }

  return await (prisma as any).aboutPage.update({
    where: { id: "default" },
    data: {
      name: data.name,
      designation: data.designation,
      phone: data.phone,
      email: data.email,
      biography: data.biography ? sanitizeHtml(data.biography) : data.biography,
      profileImage: data.profileImage,
      signatureImage: data.signatureImage,
      skills: data.skills,
    },
  });
};

export const AboutService = {
  getAboutPage,
  updateAboutPage,
};
