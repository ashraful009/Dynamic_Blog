import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const parseOrigins = (...rawValues: (string | undefined)[]): string[] => {
  return rawValues
    .flatMap((v) => (v ? v.split(",") : []))
    .map((s) => s.trim())
    .filter(Boolean);
};

const allowedOrigins = parseOrigins(
  process.env.PUBLIC_FRONTEND_URL,
  process.env.ADMIN_FRONTEND_URL
);

const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  database: {
    url: process.env.DATABASE_URL as string,
  },
  jwt: {
    secret: process.env.JWT_SECRET as string,
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME as string,
    apiKey: process.env.CLOUDINARY_API_KEY as string,
    apiSecret: process.env.CLOUDINARY_API_SECRET as string,
  },
  cors: {
    allowedOrigins,
  },
};

export default config;
