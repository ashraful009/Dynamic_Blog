import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from "cloudinary";
import config from "../config";
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true,
});
export interface UploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  resourceType: "image" | "video";
  hlsUrl?: string;
}
export const uploadImage = async (
  filePath: string,
  folder: string = "zibon-vlog/images"
): Promise<UploadResult> => {
  try {
    const result: UploadApiResponse = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "image",
      transformation: [
        { quality: "auto", fetch_format: "auto" },
      ],
      type: "authenticated",
    });
    return {
      publicId: result.public_id,
      url: result.url,
      secureUrl: result.secure_url,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      resourceType: "image",
    };
  } catch (error) {
    const uploadError = error as UploadApiErrorResponse;
    throw new Error(`Image upload failed: ${uploadError.message}`);
  }
};
export const uploadVideo = async (
  filePath: string,
  folder: string = "zibon-vlog/videos"
): Promise<UploadResult> => {
  try {
    const result: UploadApiResponse = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "video",
      eager: [
        {
          streaming_profile: "hd",
          format: "m3u8",
        },
      ],
      eager_async: true,
      type: "authenticated",
    });
    const hlsUrl = cloudinary.url(result.public_id, {
      resource_type: "video",
      format: "m3u8",
      streaming_profile: "hd",
      type: "authenticated",
      sign_url: true,
    });
    return {
      publicId: result.public_id,
      url: result.url,
      secureUrl: result.secure_url,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      resourceType: "video",
      hlsUrl,
    };
  } catch (error) {
    const uploadError = error as UploadApiErrorResponse;
    throw new Error(`Video upload failed: ${uploadError.message}`);
  }
};
export const deleteAsset = async (
  publicId: string,
  resourceType: "image" | "video" = "image"
): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      type: "authenticated",
    });
  } catch (error) {
    const deleteError = error as UploadApiErrorResponse;
    throw new Error(`Asset deletion failed: ${deleteError.message}`);
  }
};
export const generateSignedUrl = (
  publicId: string,
  resourceType: "image" | "video" = "image",
  expiresInSeconds: number = 3600
): string => {
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
  return cloudinary.url(publicId, {
    resource_type: resourceType,
    type: "authenticated",
    sign_url: true,
    secure: true,
    transformation: [
      {
        flags: `attachment:expires_${expiresAt}`,
      },
    ],
  });
};
export default cloudinary;
