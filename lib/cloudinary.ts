import { v2 as cloudinary } from "cloudinary";

// Support both correct and legacy env var names
const CLOUD_NAME =
  process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDNARY_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY || process.env.CLOUDNARY_API_KEY;
const API_SECRET =
  process.env.CLOUDINARY_API_SECRET || process.env.CLOUDNARY_API_SECRET;

cloudinary.config({
  cloud_name: CLOUD_NAME!,
  api_key: API_KEY!,
  api_secret: API_SECRET!,
  secure: true,
  timeout: 60000,
});

export default cloudinary;
