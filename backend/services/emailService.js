const nodemailer = require('nodemailer');

// Create transporter with Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'abdulhaseebmughal2006@gmail.com',
    pass: process.env.EMAIL_PASSWORD // App password from Gmail
  }
});

// Get device information from user agent
const getDeviceInfo = (userAgent) => {
  let deviceType = 'Unknown Device';
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';

  if (userAgent) {
    // Detect device type
    if (/mobile/i.test(userAgent)) {
      deviceType = 'Mobile Device';
    } else if (/tablet/i.test(userAgent)) {
      deviceType = 'Tablet';
    } else {
      deviceType = 'Desktop Computer';
    }

    // Detect browser
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    else if (userAgent.includes('Opera')) browser = 'Opera';

    // Detect OS
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac OS')) os = 'MacOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';
  }

  return { deviceType, browser, os };
};

// Send login confirmation email
const sendLoginConfirmation = async (email, loginData) => {
  const { ipAddress, userAgent, location, confirmToken, username } = loginData;
  const deviceInfo = getDeviceInfo(userAgent);

  const confirmLink = `${process.env.FRONTEND_URL || 'https://saving-app-ador.vercel.app'}/api/auth/confirm-login?token=${confirmToken}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .content {
          padding: 30px;
        }
        .alert-box {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 140px 1fr;
          gap: 10px;
          margin: 20px 0;
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
        }
        .info-label {
          font-weight: bold;
          color: #495057;
        }
        .info-value {
          color: #212529;
        }
        .button-container {
          text-align: center;
          margin: 30px 0;
        }
        .confirm-button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 14px 40px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
          font-size: 16px;
          transition: transform 0.2s;
        }
        .confirm-button:hover {
          transform: translateY(-2px);
        }
        .warning {
          background-color: #f8d7da;
          border-left: 4px solid #dc3545;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
          color: #721c24;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #6c757d;
        }
        .security-icon {
          font-size: 48px;
          text-align: center;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 SaveIt.AI Login Confirmation</h1>
        </div>

        <div class="content">
          <div class="security-icon">🛡️</div>

          <h2 style="color: #212529; margin-top: 0;">New Login Attempt Detected</h2>

          <div class="alert-box">
            <strong>⚠️ Action Required:</strong> We detected a new login to your SaveIt.AI account. Please confirm this was you.
          </div>

          <h3 style="color: #495057;">Login Details:</h3>

          <div class="info-grid">
            <div class="info-label">Username:</div>
            <div class="info-value">${username}</div>

            <div class="info-label">Device Type:</div>
            <div class="info-value">${deviceInfo.deviceType}</div>

            <div class="info-label">Browser:</div>
            <div class="info-value">${deviceInfo.browser}</div>

            <div class="info-label">Operating System:</div>
            <div class="info-value">${deviceInfo.os}</div>

            <div class="info-label">IP Address:</div>
            <div class="info-value">${ipAddress}</div>

            <div class="info-label">Location:</div>
            <div class="info-value">${location || 'Unknown'}</div>

            <div class="info-label">Date & Time:</div>
            <div class="info-value">${new Date().toLocaleString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              timeZoneName: 'short'
            })}</div>
          </div>

          <div class="button-container">
            <a href="${confirmLink}" class="confirm-button">
              ✅ Confirm This Was Me
            </a>
          </div>

          <div class="warning">
            <strong>⏰ Important:</strong> This confirmation link will expire in <strong>10 minutes</strong>. If you don't confirm within this time, you'll need to login again.
          </div>

          <p style="color: #6c757d; margin-top: 30px;">
            If this wasn't you, please ignore this email and your account will remain secure. The login attempt will be automatically rejected after 10 minutes.
          </p>
        </div>

        <div class="footer">
          <p>This email was sent by SaveIt.AI</p>
          <p>© ${new Date().getFullYear()} SaveIt.AI - Smart AI-Powered Saving</p>
          <p style="margin-top: 10px;">
            <strong>Need help?</strong> Contact us at support@saveit.ai
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"SaveIt.AI Security" <${process.env.EMAIL_USER || 'abdulhaseebmughal2006@gmail.com'}>`,
    to: email,
    subject: '🔐 Login Confirmation Required - SaveIt.AI',
    html: htmlContent,
    text: `
SaveIt.AI - Login Confirmation Required

A new login to your SaveIt.AI account was detected.

Login Details:
- Username: ${username}
- Device: ${deviceInfo.deviceType}
- Browser: ${deviceInfo.browser}
- OS: ${deviceInfo.os}
- IP Address: ${ipAddress}
- Location: ${location || 'Unknown'}
- Time: ${new Date().toLocaleString()}

Please confirm this login by clicking the link below:
${confirmLink}

⏰ This link expires in 10 minutes.

If this wasn't you, ignore this email and the login will be rejected.

- SaveIt.AI Security Team
    `.trim()
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Login confirmation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendLoginConfirmation
};
