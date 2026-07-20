import prisma from "../../db";
import { ApiError } from "../../middleware/globalErrorHandler";
import { uploadImage, uploadVideo, deleteAsset, UploadResult } from "../../utils/uploadImage";
import { MediaType } from "@prisma/client";
const IMAGE_MIMES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
const VIDEO_MIMES = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"];
const upload = async (
  file: Express.Multer.File,
  options: { alt?: string; postId?: string }
) => {
  if (!file) {
    throw new ApiError(400, "No file provided.");
  }
  let uploadResult: UploadResult;
  let mediaType: MediaType;
  if (IMAGE_MIMES.includes(file.mimetype)) {
    mediaType = "IMAGE";
    uploadResult = await uploadImage(file.path);
  } else if (VIDEO_MIMES.includes(file.mimetype)) {
    mediaType = "VIDEO";
    uploadResult = await uploadVideo(file.path);
  } else {
    throw new ApiError(
      400,
      `Unsupported file type: ${file.mimetype}. Supported: ${[...IMAGE_MIMES, ...VIDEO_MIMES].join(", ")}`
    );
  }
  const media = await prisma.media.create({
    data: {
      publicId: uploadResult.publicId,
      url: uploadResult.url,
      secureUrl: uploadResult.secureUrl,
      format: uploadResult.format,
      type: mediaType,
      hlsUrl: uploadResult.hlsUrl || null,
      width: uploadResult.width,
      height: uploadResult.height,
      bytes: uploadResult.bytes,
      alt: options.alt || null,
      postId: options.postId || null,
    },
  });
  return media;
};
const getAll = async (options: {
  page?: number;
  limit?: number;
  type?: MediaType;
}) => {
  const page = options.page || 1;
  const limit = options.limit || 20;
  const skip = (page - 1) * limit;
  const where: any = {};
  if (options.type) {
    where.type = options.type;
  }
  const [total, media] = await Promise.all([
    prisma.media.count({ where }),
    prisma.media.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
  ]);
  return {
    data: media,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
const deleteMedia = async (id: string) => {
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) {
    throw new ApiError(404, "Media not found.");
  }
  const resourceType = media.type === "VIDEO" ? "video" : "image";
  await deleteAsset(media.publicId, resourceType);
  await prisma.media.delete({ where: { id } });
  return { id };
};
const linkToPost = async (mediaId: string, postId: string) => {
  const media = await prisma.media.update({
    where: { id: mediaId },
    data: { postId },
  });
  return media;
};
export const MediaService = {
  upload,
  getAll,
  deleteMedia,
  linkToPost,
};
