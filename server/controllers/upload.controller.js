import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { AppError } from '../middleware/errorMiddleware.js';

// Configure Cloudinary (if using Cloudinary)
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Save a file locally
 * @param {object} file - multer file
 * @returns {{url: string, public_id: string}}
 */
const saveLocally = (file) => {
  const uploadDir = path.join(process.cwd(), 'uploads', 'products');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`;
  const filepath = path.join(uploadDir, filename);
  fs.writeFileSync(filepath, file.buffer);

  const url = `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/products/${filename}`;
  return { url, public_id: filename };
};

/**
 * Upload single image
 * @route POST /api/upload/image
 * @access Private (Admin)
 */
export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Please upload an image', 400));
    }

    // If Cloudinary is configured, upload to Cloudinary
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        // Convert buffer to base64
        const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

        // Upload to Cloudinary with a hard deadline so local fallback triggers fast
        const result = await Promise.race([
          cloudinary.uploader.upload(fileStr, {
            folder: 'hardware-store/products',
            resource_type: 'image',
            timeout: 10000,
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Cloudinary upload timed out')), 10000)
          ),
        ]);

        return res.status(200).json({
          success: true,
          message: 'Image uploaded successfully',
          url: result.secure_url,
          public_id: result.public_id,
        });
      } catch (cloudError) {
        // Cloudinary unreachable or failed - fall back to local storage
        console.error('Cloudinary upload failed, falling back to local storage:', cloudError?.message || cloudError);
      }
    }

    // Fallback: Save to local storage (dev / Cloudinary unavailable)
    const local = saveLocally(req.file);
    return res.status(200).json({
      success: true,
      message: 'Image uploaded successfully (local storage)',
      url: local.url,
      public_id: local.public_id,
    });
  } catch (error) {
    console.error('Upload error:', error);
    next(new AppError('Failed to upload image', 500));
  }
};

/**
 * Delete image from Cloudinary
 * @route DELETE /api/upload/image/:publicId
 * @access Private (Admin)
 */
export const deleteImage = async (req, res, next) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return next(new AppError('Public ID is required', 400));
    }

    // If Cloudinary is configured, delete from Cloudinary (ignore failures)
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        await cloudinary.uploader.destroy(publicId, { timeout: 15000 });
      } catch (cloudError) {
        console.error('Cloudinary delete failed (continuing):', cloudError?.message || cloudError);
      }
    }

    // Also remove locally if it was stored there
    const localPath = path.join(process.cwd(), 'uploads', 'products', publicId);
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    console.error('Delete error:', error);
    next(new AppError('Failed to delete image', 500));
  }
};
