const express = require('express');
const { body } = require('express-validator');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  deleteProductImage,
  getFeaturedProducts,
  getRelatedProducts,
} = require('../controllers/product.controller.js');
const { protect, isAdmin } = require('../middleware/authMiddleware.js');
const { uploadMultiple } = require('../middleware/uploadMiddleware.js');
const validate = require('../middleware/validateMiddleware.js');

const router = express.Router();

// Validation rules
const productValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('price').isNumeric().withMessage('Price must be a number').isFloat({ min: 0 }).withMessage('Price cannot be negative'),
  body('stock').isNumeric().withMessage('Stock must be a number').isInt({ min: 0 }).withMessage('Stock cannot be negative'),
  body('comparePrice').optional().isNumeric().withMessage('Compare price must be a number').isFloat({ min: 0 }).withMessage('Compare price cannot be negative'),
  body('brand').optional().trim().isLength({ max: 100 }).withMessage('Brand name cannot exceed 100 characters'),
  body('sku').optional().trim().isLength({ max: 50 }).withMessage('SKU cannot exceed 50 characters'),
  body('isFeatured').optional().isBoolean().withMessage('Featured must be a boolean'),
  body('isActive').optional().isBoolean().withMessage('Active must be a boolean'),
  body('specifications').optional().isArray().withMessage('Specifications must be an array'),
  body('images').optional().isArray().withMessage('Images must be an array'),
  body('images.*.public_id').optional().notEmpty().withMessage('Image public_id is required'),
  body('images.*.url').optional().isURL().withMessage('Image URL must be a valid URL'),
];

// POST /products (create)
router.post('/', protect, isAdmin, productValidation, validate, createProduct);

// GET /products (list)
router.get('/', getProducts);

// GET /featured (specific routes before dynamic :id routes)
router.get('/featured', getFeaturedProducts);

// Other routes with :id parameter
router.get('/:id', getProduct);
router.get('/:id/related', getRelatedProducts);
router.put('/:id', protect, isAdmin, updateProduct);
router.delete('/:id', protect, isAdmin, deleteProduct);
router.post('/:id/images', protect, isAdmin, uploadMultiple, uploadProductImages);
router.delete('/:id/images/:imageId', protect, isAdmin, deleteProductImage);

module.exports = router;
