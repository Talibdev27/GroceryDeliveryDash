import { config } from "dotenv";
import { v2 as cloudinary } from "cloudinary";

config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
});

export interface UploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
}

/**
 * Upload an image file to Cloudinary
 * @param fileBuffer - Buffer containing the image data
 * @param fileName - Original filename (for extension detection)
 * @param folder - Cloudinary folder path (default: 'products')
 * @returns Promise with upload result containing secure_url
 */
export async function uploadImage(
  fileBuffer: Buffer,
  fileName: string,
  folder: string = "products"
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder,
      resource_type: "image" as const,
      transformation: [
        { quality: "auto" },
        { fetch_format: "auto" }, // Auto-convert to WebP when supported
      ],
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          reject(new Error(`Failed to upload image: ${error.message}`));
          return;
        }

        if (!result || !result.secure_url) {
          reject(new Error("Upload succeeded but no URL returned"));
          return;
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
        });
      }
    );

    // Convert buffer to stream
    uploadStream.end(fileBuffer);
  });
}

/**
 * Delete an image from Cloudinary by public ID
 * @param publicId - Cloudinary public ID (can include folder path)
 */
export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw new Error(`Failed to delete image: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Check if Cloudinary is properly configured
 */
export function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

