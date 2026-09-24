import asyncHandler from '../utils/handleAsync.js';
import { AppError } from '../middleware/errorMiddleware.js';
import Contact from '../models/Contact.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';
import { sendVerificationEmail } from '../config/email.js';
import { generateOTP, hashOTP, verifyOTP, getOTPExpiry } from '../utils/otpUtils.js';

const MAINTENANCE_ADMIN_EMAIL = () =>
  process.env.MAINTENANCE_ADMIN_EMAIL || 'ugwanezav@gmail.com';

/**
 * @desc    Create new contact message
 * @route   POST /api/contacts
 * @access  Public
 */
export const createContact = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  const contact = await Contact.create({
    name,
    email,
    phone: phone || '',
    subject,
    message,
    user: req.user?._id || null,
  });

  logger.info(`New contact message from: ${email}`);

  res.status(201).json({
    success: true,
    message: 'Your message has been sent successfully! We will get back to you within 24 hours.',
    data: {
      contact,
    },
  });
});

/**
 * @desc    Get all contact messages (Admin only)
 * @route   GET /api/contacts
 * @access  Private/Admin
 */
export const getContacts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    priority,
    sort = '-createdAt',
  } = req.query;

  // Build query
  const query = {};

  if (status) {
    query.status = status;
  }

  if (priority) {
    query.priority = priority;
  }

  // Pagination
  const skip = (Number(page) - 1) * Number(limit);

  // Execute query
  const contacts = await Contact.find(query)
    .populate('user', 'name email')
    .sort(sort)
    .limit(Number(limit))
    .skip(skip);

  // Get total count
  const total = await Contact.countDocuments(query);

  // Get counts by status
  const stats = await Contact.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const statusCounts = {
    new: 0,
    read: 0,
    replied: 0,
    resolved: 0,
  };

  stats.forEach((stat) => {
    statusCounts[stat._id] = stat.count;
  });

  res.status(200).json({
    success: true,
    data: {
      contacts,
      stats: statusCounts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    },
  });
});

/**
 * @desc    Get single contact message
 * @route   GET /api/contacts/:id
 * @access  Private/Admin
 */
export const getContact = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const contact = await Contact.findById(id).populate('user', 'name email phone');

  if (!contact) {
    throw new AppError('Contact message not found', 404);
  }

  // Mark as read if status is new
  if (contact.status === 'new') {
    contact.status = 'read';
    await contact.save();
  }

  res.status(200).json({
    success: true,
    data: {
      contact,
    },
  });
});

/**
 * @desc    Update contact message status
 * @route   PUT /api/contacts/:id
 * @access  Private/Admin
 */
export const updateContact = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, priority, adminNotes, adminReply } = req.body;

  const contact = await Contact.findById(id);

  if (!contact) {
    throw new AppError('Contact message not found', 404);
  }

  if (status) contact.status = status;
  if (priority) contact.priority = priority;
  if (adminNotes !== undefined) contact.adminNotes = adminNotes;
  if (adminReply !== undefined) {
    contact.adminReply = adminReply;
    contact.repliedBy = req.user._id;
  }

  if ((status === 'replied' || adminReply) && !contact.repliedAt) {
    contact.repliedAt = new Date();
  }

  await contact.save();

  res.status(200).json({
    success: true,
    message: 'Contact message updated successfully',
    data: {
      contact,
    },
  });
});

/**
 * @desc    Delete contact message
 * @route   DELETE /api/contacts/:id
 * @access  Private/Admin
 */
export const deleteContact = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const contact = await Contact.findById(id);

  if (!contact) {
    throw new AppError('Contact message not found', 404);
  }

  await contact.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Contact message deleted successfully',
  });
});

/**
 * @desc    Get contact statistics
 * @route   GET /api/contacts/stats
 * @access  Private/Admin
 */
/**
 * @desc    Get user's own contact messages
 * @route   GET /api/contacts/my-messages
 * @access  Private (authenticated users)
 */
export const getMyMessages = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  logger.info(`Fetching messages for user: ${req.user.email} (ID: ${req.user._id})`);

  // Get messages by email (for non-logged-in submissions) or user ID
  const query = {
    $or: [
      { email: req.user.email },
      { user: req.user._id }
    ]
  };

  logger.info(`Query: ${JSON.stringify(query)}`);

  const messages = await Contact.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('repliedBy', 'name');

  logger.info(`Found ${messages.length} messages for user`);

  const total = await Contact.countDocuments(query);
  const unreadReplies = await Contact.countDocuments({
    ...query,
    adminReply: { $ne: '' },
    status: { $ne: 'resolved' }
  });

  res.status(200).json({
    success: true,
    data: {
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      unreadReplies,
    },
  });
});

export const getContactStats = asyncHandler(async (req, res) => {
  const stats = await Contact.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const totalMessages = await Contact.countDocuments();
  const newMessages = await Contact.countDocuments({ status: 'new' });

  res.status(200).json({
    success: true,
    data: {
      total: totalMessages,
      new: newMessages,
      byStatus: stats,
    },
  });
});

/**
 * @desc    Send maintenance verification code (server-generated OTP)
 * @route   POST /api/contacts/send-maintenance-code
 * @access  Public (but only mails the configured admin address)
 */
export const sendMaintenanceCode = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const adminEmail = MAINTENANCE_ADMIN_EMAIL();

  // Security: Only allow sending to the configured admin email
  if (email !== adminEmail) {
    throw new AppError('Invalid email address', 403);
  }

  const admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    throw new AppError('Administrator account not found', 404);
  }

  // Server generates the OTP (never trust a code supplied by the client)
  const otp = generateOTP();
  admin.twoFactorCode = hashOTP(otp);
  admin.twoFactorExpire = getOTPExpiry();
  await admin.save();

  try {
    await sendVerificationEmail(admin.email, otp);
    logger.info(`Maintenance verification code sent to ${admin.email}`);
  } catch (error) {
    logger.error(`Failed to send maintenance code: ${error.message}`);
    throw new AppError('Failed to send verification code. Please try again.', 500);
  }

  res.status(200).json({
    success: true,
    message: `Verification code sent to ${admin.email}`,
    info: 'Check your email inbox for the 6-digit verification code',
  });
});

/**
 * @desc    Verify maintenance OTP (server-side), returns a short-lived temp token
 * @route   POST /api/contacts/verify-maintenance-otp
 * @access  Public
 */
export const verifyMaintenanceOtp = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const adminEmail = MAINTENANCE_ADMIN_EMAIL();

  const admin = await User.findOne({
    email: adminEmail,
    twoFactorExpire: { $gt: Date.now() },
  });

  if (!admin || !verifyOTP(String(code || ''), admin.twoFactorCode)) {
    throw new AppError('Invalid or expired verification code', 400);
  }

  // One-time use only
  admin.twoFactorCode = undefined;
  admin.twoFactorExpire = undefined;
  await admin.save();

  // Short-lived token authorizing only the keyword step
  const maintenanceTempToken = jwt.sign(
    { purpose: 'maintenance:otp', userId: admin._id },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '5m' }
  );

  res.status(200).json({
    success: true,
    message: 'Email verified successfully',
    data: { maintenanceTempToken },
  });
});

/**
 * @desc    Verify maintenance keyword + temp token, returns maintenance access token
 * @route   POST /api/contacts/verify-maintenance-keyword
 * @access  Public
 */
export const verifyMaintenanceKeyword = asyncHandler(async (req, res) => {
  const { tempToken, keyword } = req.body;

  // The keyword lives ONLY server-side (env var), never in the client bundle
  const expectedKeyword = process.env.MAINTENANCE_KEYWORD;
  if (!expectedKeyword) {
    logger.error('MAINTENANCE_KEYWORD not configured on the server');
    throw new AppError('Maintenance access is not configured', 500);
  }

  let decoded;
  try {
    decoded = jwt.verify(String(tempToken || ''), process.env.JWT_ACCESS_SECRET);
  } catch {
    throw new AppError('Verification expired. Request a new code.', 401);
  }

  if (decoded.purpose !== 'maintenance:otp') {
    throw new AppError('Invalid verification token', 401);
  }

  if (String(keyword || '') !== expectedKeyword) {
    logger.warn('Incorrect maintenance keyword attempt');
    throw new AppError('Incorrect security keyword', 401);
  }

  const maintenanceAccessToken = jwt.sign(
    { purpose: 'maintenance:access', userId: decoded.userId },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '24h' }
  );

  res.status(200).json({
    success: true,
    message: 'Maintenance access granted',
    data: { maintenanceAccessToken },
  });
});
