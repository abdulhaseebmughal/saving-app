const nodemailer = require('nodemailer');

// Create reusable transporter
let transporter = null;

const initializeTransporter = () => {
  if (transporter) return transporter;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.warn('⚠️ Email credentials not configured. Email service disabled.');
    return null;
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100
  });

  return transporter;
};

/**
 * Send OTP email
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit OTP code
 * @param {string} purpose - 'signup', 'login', or 'forgot-password'
 * @param {string} name - User's name
 */
const sendOTP = async (email, otp, purpose, name = 'User') => {
  try {
    const emailTransporter = initializeTransporter();

    if (!emailTransporter) {
      return {
        success: false,
        error: 'Email service not configured'
      };
    }

    const purposeTexts = {
      'signup': {
        subject: 'Welcome to SaveIt.AI - Verify Your Email',
        title: 'Welcome to SaveIt.AI!',
        message: 'Thank you for signing up. Please use the OTP below to verify your email and complete your registration.',
        icon: '🎉'
      },
      'login': {
        subject: 'SaveIt.AI - Your Login OTP',
        title: 'Login Verification',
        message: 'You requested to login to your SaveIt.AI account. Use the OTP below to complete your login.',
        icon: '🔐'
      },
      'forgot-password': {
        subject: 'SaveIt.AI - Reset Your Password',
        title: 'Password Reset Request',
        message: 'You requested to reset your password. Use the OTP below to proceed with password reset.',
        icon: '🔑'
      }
    };

    const config = purposeTexts[purpose] || purposeTexts['login'];

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.subject}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      background-color: #f5f5f5;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background-color: #2563eb;
      color: #ffffff;
      padding: 32px 24px;
      text-align: center;
    }
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .header p {
      font-size: 16px;
      opacity: 0.95;
    }
    .content {
      padding: 32px 24px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 16px;
    }
    .message {
      font-size: 15px;
      color: #4b5563;
      margin-bottom: 24px;
      line-height: 1.6;
    }
    .otp-container {
      background-color: #f3f4f6;
      border: 2px dashed #2563eb;
      border-radius: 8px;
      padding: 24px;
      text-align: center;
      margin: 24px 0;
    }
    .otp-label {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 8px;
      font-weight: 500;
    }
    .otp-code {
      font-size: 36px;
      font-weight: 700;
      color: #2563eb;
      letter-spacing: 8px;
      font-family: 'Courier New', monospace;
    }
    .validity {
      font-size: 13px;
      color: #9ca3af;
      margin-top: 12px;
    }
    .warning {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 16px;
      margin: 24px 0;
      border-radius: 4px;
    }
    .warning-title {
      font-size: 14px;
      font-weight: 600;
      color: #92400e;
      margin-bottom: 4px;
    }
    .warning-text {
      font-size: 13px;
      color: #78350f;
      line-height: 1.5;
    }
    .footer {
      background-color: #f9fafb;
      padding: 24px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer-text {
      font-size: 13px;
      color: #6b7280;
      margin-bottom: 8px;
    }
    .footer-brand {
      font-size: 14px;
      font-weight: 600;
      color: #2563eb;
    }
    @media only screen and (max-width: 600px) {
      .container {
        border-radius: 0;
      }
      .header h1 {
        font-size: 24px;
      }
      .otp-code {
        font-size: 28px;
        letter-spacing: 4px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${config.icon} ${config.title}</h1>
      <p>SaveIt.AI Authentication</p>
    </div>

    <div class="content">
      <div class="greeting">Hello ${name},</div>

      <div class="message">
        ${config.message}
      </div>

      <div class="otp-container">
        <div class="otp-label">YOUR OTP CODE</div>
        <div class="otp-code">${otp}</div>
        <div class="validity">⏱️ Valid for 10 minutes</div>
      </div>

      <div class="warning">
        <div class="warning-title">🔒 Security Notice</div>
        <div class="warning-text">
          Never share this OTP with anyone. SaveIt.AI staff will never ask for your OTP.
          If you didn't request this OTP, please ignore this email or contact support.
        </div>
      </div>
    </div>

    <div class="footer">
      <div class="footer-text">
        This is an automated message from <span class="footer-brand">SaveIt.AI</span>
      </div>
      <div class="footer-text">
        Your personal knowledge management system
      </div>
    </div>
  </div>
</body>
</html>
    `;

    const mailOptions = {
      from: `"SaveIt.AI" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: config.subject,
      html: htmlContent
    };

    const info = await emailTransporter.sendMail(mailOptions);

    console.log(`✅ OTP email sent to ${email} - Message ID: ${info.messageId}`);

    return {
      success: true,
      messageId: info.messageId
    };

  } catch (error) {
    console.error('❌ Email service error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  sendOTP
};
