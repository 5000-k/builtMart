import express from 'express';
import { body } from 'express-validator';
import {
  createContact,
  getContacts,
  getContact,
  updateContact,
  deleteContact,
  getContactStats,
  getMyMessages,
  sendMaintenanceCode,
  verifyMaintenanceOtp,
  verifyMaintenanceKeyword,
} from '../controllers/contact.controller.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';
import { maintenanceSendLimiter, maintenanceVerifyLimiter } from '../middleware/rateLimit.js';
import validate from '../middleware/validateMiddleware.js';

const router = express.Router();

const contactValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
];

const maintenanceSendValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
];

const maintenanceOtpValidation = [
  body('code')
    .notEmpty().withMessage('Verification code is required')
    .isLength({ min: 6, max: 6 }).withMessage('Code must be 6 digits')
    .isNumeric().withMessage('Code must contain only numbers'),
];

const maintenanceKeywordValidation = [
  body('tempToken').notEmpty().withMessage('Verification token is required'),
  body('keyword').notEmpty().withMessage('Security keyword is required'),
];

// Public routes
router.post('/', contactValidation, validate, createContact);
router.post('/send-maintenance-code', maintenanceSendLimiter, maintenanceSendValidation, validate, sendMaintenanceCode);
router.post('/verify-maintenance-otp', maintenanceVerifyLimiter, maintenanceOtpValidation, validate, verifyMaintenanceOtp);
router.post('/verify-maintenance-keyword', maintenanceVerifyLimiter, maintenanceKeywordValidation, validate, verifyMaintenanceKeyword);

// User routes (authenticated)
router.get('/my-messages', protect, getMyMessages);

// Admin routes
router.get('/', protect, isAdmin, getContacts);
router.get('/stats', protect, isAdmin, getContactStats);
router.get('/:id', protect, isAdmin, getContact);
router.put('/:id', protect, isAdmin, updateContact);
router.delete('/:id', protect, isAdmin, deleteContact);

export default router;
