const nodemailer = require('nodemailer');

let transporter = null;

const createTransporter = () => {
  if (transporter) {
    return transporter;
  }

  const config = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };

  transporter = nodemailer.createTransporter(config);

  return transporter;
};

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const mailer = createTransporter();

    const info = await mailer.sendMail({
      from: process.env.SMTP_FROM || '"TripAndEvent" <noreply@tripandevent.com>',
      to,
      subject,
      text,
      html,
    });

    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

const sendVerificationEmail = async (email, name, token) => {
  const verificationUrl = process.env.EMAIL_VERIFY_URL
    ? `${process.env.EMAIL_VERIFY_URL}?token=${token}`
    : `${process.env.FRONTEND_URL}/auth/verify?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to TripAndEvent, ${name}!</h2>
      <p>Thank you for registering. Please verify your email address to activate your account.</p>
      <p>
        <a href="${verificationUrl}"
           style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; display: inline-block; border-radius: 4px;">
          Verify Email
        </a>
      </p>
      <p>Or copy and paste this link into your browser:</p>
      <p style="color: #666; font-size: 14px;">${verificationUrl}</p>
      <p style="color: #999; font-size: 12px; margin-top: 30px;">
        This link will expire in 24 hours. If you didn't create an account, please ignore this email.
      </p>
    </div>
  `;

  const text = `Welcome to TripAndEvent, ${name}!\n\nPlease verify your email by clicking this link: ${verificationUrl}\n\nThis link will expire in 24 hours.`;

  return sendEmail({
    to: email,
    subject: 'Verify Your Email - TripAndEvent',
    html,
    text,
  });
};

const sendPasswordResetEmail = async (email, name, token) => {
  const resetUrl = process.env.PASSWORD_RESET_URL
    ? `${process.env.PASSWORD_RESET_URL}?token=${token}`
    : `${process.env.FRONTEND_URL}/auth/reset?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset Request</h2>
      <p>Hi ${name},</p>
      <p>You requested to reset your password. Click the button below to reset it:</p>
      <p>
        <a href="${resetUrl}"
           style="background-color: #2196F3; color: white; padding: 12px 24px; text-decoration: none; display: inline-block; border-radius: 4px;">
          Reset Password
        </a>
      </p>
      <p>Or copy and paste this link into your browser:</p>
      <p style="color: #666; font-size: 14px;">${resetUrl}</p>
      <p style="color: #999; font-size: 12px; margin-top: 30px;">
        This link will expire in 10 minutes. If you didn't request a password reset, please ignore this email.
      </p>
    </div>
  `;

  const text = `Password Reset Request\n\nHi ${name},\n\nYou requested to reset your password. Click this link: ${resetUrl}\n\nThis link will expire in 10 minutes.`;

  return sendEmail({
    to: email,
    subject: 'Reset Your Password - TripAndEvent',
    html,
    text,
  });
};

const sendWelcomeEmail = async (email, name) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to TripAndEvent, ${name}!</h2>
      <p>Your email has been verified successfully. You can now start booking your dream trips!</p>
      <p>
        <a href="${process.env.FRONTEND_URL}"
           style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; display: inline-block; border-radius: 4px;">
          Start Exploring
        </a>
      </p>
      <p>Happy travels!</p>
    </div>
  `;

  const text = `Welcome to TripAndEvent, ${name}!\n\nYour email has been verified successfully. Start exploring at ${process.env.FRONTEND_URL}`;

  return sendEmail({
    to: email,
    subject: 'Welcome to TripAndEvent!',
    html,
    text,
  });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
};
