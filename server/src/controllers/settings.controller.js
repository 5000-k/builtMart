import asyncHandler from '../utils/handleAsync.js';
import { AppError } from '../middleware/errorMiddleware.js';
import Settings from '../models/Settings.js';

/**
 * @desc    Get settings
 * @route   GET /api/settings
 * @access  Public
 */
export const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne({ isSingleton: true });

  // Create default settings if none exist
  if (!settings) {
    settings = await Settings.create({ isSingleton: true });
  }

  res.status(200).json({
    success: true,
    data: {
      settings,
    },
  });
});

/**
 * @desc    Update settings
 * @route   PUT /api/settings
 * @access  Private/Admin
 */
export const updateSettings = asyncHandler(async (req, res) => {
  const {
    siteName,
    siteDescription,
    contactEmail,
    contactPhone,
    address,
    currency,
    currencySymbol,
    taxRate,
    shippingFee,
    freeShippingThreshold,
    emailFrom,
    maintenanceMode,
  } = req.body;

  let settings = await Settings.findOne({ isSingleton: true });

  // Create if doesn't exist
  if (!settings) {
    settings = await Settings.create({
      isSingleton: true,
      ...req.body,
    });
  } else {
    // Update existing settings
    if (siteName !== undefined) settings.siteName = siteName;
    if (siteDescription !== undefined) settings.siteDescription = siteDescription;
    if (contactEmail !== undefined) settings.contactEmail = contactEmail;
    if (contactPhone !== undefined) settings.contactPhone = contactPhone;
    if (address !== undefined) settings.address = address;
    if (currency !== undefined) settings.currency = currency;
    if (currencySymbol !== undefined) settings.currencySymbol = currencySymbol;
    if (taxRate !== undefined) settings.taxRate = taxRate;
    if (shippingFee !== undefined) settings.shippingFee = shippingFee;
    if (freeShippingThreshold !== undefined) settings.freeShippingThreshold = freeShippingThreshold;
    if (emailFrom !== undefined) settings.emailFrom = emailFrom;
    if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;

    await settings.save();
  }

  res.status(200).json({
    success: true,
    message: 'Settings updated successfully',
    data: {
      settings,
    },
  });
});
