import asyncHandler from '../utils/handleAsync.js';
import { AppError } from '../middleware/errorMiddleware.js';
import Settings from '../models/Settings.js';
import User from '../models/User.js';
import { sendMaintenanceModeEmail } from '../utils/sendEmail.js';
import logger from '../utils/logger.js';

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
  
  // Track if maintenance mode changed
  const previousMaintenanceMode = settings ? settings.maintenanceMode : false;
  const maintenanceModeChanged = maintenanceMode !== undefined && maintenanceMode !== previousMaintenanceMode;

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

  // Send maintenance mode emails to all users if mode changed
  if (maintenanceModeChanged) {
    try {
      // Get all users with email notifications enabled
      const users = await User.find({
        'notificationPreferences.emailNotifications': true,
      }).select('email name');

      logger.info(`Sending maintenance mode emails to ${users.length} users`);

      // Send emails asynchronously (don't wait for all to complete)
      const emailPromises = users.map(user => 
        sendMaintenanceModeEmail(user.email, user.name, maintenanceMode)
          .catch(error => {
            logger.error(`Failed to send maintenance email to ${user.email}: ${error.message}`);
          })
      );

      // Send emails in background
      Promise.all(emailPromises).then(() => {
        logger.info('All maintenance mode emails sent successfully');
      }).catch(error => {
        logger.error(`Error sending maintenance emails: ${error.message}`);
      });

      logger.info(`Maintenance mode ${maintenanceMode ? 'enabled' : 'disabled'} - emails queued`);
    } catch (error) {
      logger.error(`Error queuing maintenance emails: ${error.message}`);
      // Don't fail the request if emails fail
    }
  }

  res.status(200).json({
    success: true,
    message: maintenanceModeChanged 
      ? `Settings updated successfully. Maintenance mode ${maintenanceMode ? 'enabled' : 'disabled'} - notification emails are being sent.`
      : 'Settings updated successfully',
    data: {
      settings,
    },
  });
});
