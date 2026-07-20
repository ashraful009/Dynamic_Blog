import { Router } from "express";
import multer from "multer";
import path from "path";
import { MediaController } from "./media.controller";
import { auth } from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { MediaValidation } from "./media.validation";
const router = Router();
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(process.cwd(), "tmp"));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});
const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-msvideo",
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}`));
  }
};
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});
router.post(
  "/upload",
  auth,
  upload.single("file"),
  MediaController.upload
);
router.get("/", auth, MediaController.getAll);
router.delete(
  "/:id",
  auth,
  validateRequest(MediaValidation.delete),
  MediaController.deleteMedia
);
router.patch(
  "/:id/link",
  auth,
  MediaController.linkToPost
);
export default router;
