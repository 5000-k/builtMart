const { v2 as cloudinary } = require('cloudinary');
const logger = require('../utils/logger.js');

const configureCloudinary = () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    logger.info('Cloudinary configured successfully');
  } catch (error) {
    logger.error(`Cloudinary configuration error: ${error.message}`);
  }
};

export { cloudinary, configureCloudinary };
