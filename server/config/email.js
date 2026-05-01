import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

// Lazy load email config - don't load env vars at import time
let transporter = null;

const getTransporter = async () => {
  if (!transporter) {
    const emailPass = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;
    console.log('Creating transporter with:', process.env.EMAIL_USER);
    console.log('EMAIL_PASSWORD set:', !!emailPass);
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: emailPass
      }
    });
  }
  return transporter;
};

// Verify connection on first use
const initTransporter = async () => {
  try {
    const tp = await getTransporter();
    await tp.verify();
    logger.info('✅ Gmail maintenance email ready');
  } catch (error) {
    logger.error('❌ Gmail connection failed:', error.message);
  }
};

// Don't block server startup
initTransporter().catch(() => {});

/**
 * Send verification code email
 * @param {string} email - Recipient email
 * @param {string} code - 6-digit verification code
 */
export const sendVerificationEmail = async (email, code) => {
  const mailOptions = {
    from: {
      name: 'BuildMart Hardware',
      address: process.env.EMAIL_USER
    },
    to: email,
    subject: '🔐 Maintenance Access Verification Code',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border: 2px solid #e5e7eb;
            border-top: none;
          }
          .code-box {
            background: white;
            border: 3px dashed #ea580c;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
            border-radius: 8px;
          }
          .code {
            font-size: 42px;
            font-weight: bold;
            color: #ea580c;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
          }
          .warning {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #6b7280;
            font-size: 12px;
          }
          .btn {
            display: inline-block;
            background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%);
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔐 Maintenance Access</h1>
          <p style="margin: 5px 0 0 0;">BuildMart Hardware Store</p>
        </div>
        
        <div class="content">
          <h2 style="color: #1f2937; margin-top: 0;">Administrator Verification</h2>
          
          <p>Hello Administrator,</p>
          
          <p>You have requested access to the BuildMart system while it's in maintenance mode. Please use the verification code below to complete the authentication process.</p>
          
          <div class="code-box">
            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Your Verification Code</p>
            <div class="code">${code}</div>
            <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 12px;">Valid for 5 minutes</p>
          </div>
          
          <div class="warning">
            <strong>⏰ Important:</strong> This code will expire in 5 minutes. If you didn't request this code, please ignore this email.
          </div>
          
          <p><strong>Security Tips:</strong></p>
          <ul style="color: #4b5563;">
            <li>Never share this code with anyone</li>
            <li>BuildMart staff will never ask for this code</li>
            <li>The code is only valid for 5 minutes</li>
            <li>Only use this code if you requested maintenance access</li>
          </ul>
          
          <p style="margin-top: 30px;">If you're having trouble, contact the system administrator.</p>
          
          <p style="margin-top: 20px;">
            <strong>Best regards,</strong><br>
            BuildMart Security Team
          </p>
        </div>
        
        <div class="footer">
          <p><strong>BuildMart Hardware Store</strong></p>
          <p>This is an automated security email. Please do not reply.</p>
          <p style="color: #9ca3af; margin-top: 10px;">
            © 2025 BuildMart. All rights reserved.
          </p>
        </div>
      </body>
      </html>
    `,
    text: `
BuildMart Maintenance Access - Verification Code

Hello Administrator,

Your verification code for maintenance access is: ${code}

This code will expire in 5 minutes.

Security Tips:
- Never share this code with anyone
- Only use if you requested maintenance access
- Code is valid for 5 minutes only

If you didn't request this, please ignore this email.

Best regards,
BuildMart Security Team
    `
  };

  try {
    console.log(`📧 Sending email to ${email}...`);
    const tp = await getTransporter();
    const info = await tp.sendMail(mailOptions);
    logger.info(`✅ Verification email sent to ${email}`);
    console.log(`✅ Email sent!`);
    return info;
  } catch (error) {
    logger.error(`❌ Failed to send email to ${email}:`, error.message);
    console.error('❌ Email error:', error.message);
    throw error;
  }
};

export default getTransporter;
