import express from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route to get settings
router.get('/', getSettings);

// Protected route to update settings (admin only)
router.put('/', protect, isAdmin, updateSettings);

export default router;
