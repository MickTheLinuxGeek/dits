"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeEmailService = initializeEmailService;
exports.verifyEmailConnection = verifyEmailConnection;
exports.sendWelcomeEmail = sendWelcomeEmail;
exports.sendVerificationEmail = sendVerificationEmail;
exports.sendPasswordResetEmail = sendPasswordResetEmail;
exports.sendPasswordChangedEmail = sendPasswordChangedEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
/**
 * Email transporter instance
 */
let transporter = null;
/**
 * Initialize email transporter
 */
function initializeEmailService() {
    transporter = nodemailer_1.default.createTransport({
        host: env_1.config.email.smtp.host,
        port: env_1.config.email.smtp.port,
        secure: env_1.config.email.smtp.secure,
        auth: {
            user: env_1.config.email.smtp.user,
            pass: env_1.config.email.smtp.password,
        },
    });
}
/**
 * Verify email connection
 */
function verifyEmailConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!transporter) {
            initializeEmailService();
        }
        try {
            yield transporter.verify();
            return true;
        }
        catch (error) {
            console.error('Email connection verification failed:', error);
            return false;
        }
    });
}
/**
 * Send an email
 */
function sendEmail(to, subject, html, text) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!transporter) {
            initializeEmailService();
        }
        try {
            yield transporter.sendMail({
                from: env_1.config.email.from,
                to,
                subject,
                html,
                text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
            });
            return true;
        }
        catch (error) {
            console.error('Error sending email:', error);
            return false;
        }
    });
}
/**
 * Send welcome email to new user
 */
function sendWelcomeEmail(email, name) {
    return __awaiter(this, void 0, void 0, function* () {
        const subject = 'Welcome to DITS!';
        const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #6366f1; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to DITS!</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Thank you for signing up for the Developer Issue Tracking System (DITS)!</p>
            <p>You can now start organizing your development tasks and issues efficiently.</p>
            <a href="${env_1.config.app.url}" class="button">Get Started</a>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Happy tracking!</p>
            <p>The DITS Team</p>
          </div>
        </div>
      </body>
    </html>
  `;
        return sendEmail(email, subject, html);
    });
}
/**
 * Send email verification link
 */
function sendVerificationEmail(email, name, verificationToken) {
    return __awaiter(this, void 0, void 0, function* () {
        const verificationUrl = `${env_1.config.app.url}/auth/verify-email?token=${verificationToken}`;
        const subject = 'Verify Your Email Address';
        const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #6366f1; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .code { font-size: 24px; font-weight: bold; letter-spacing: 2px; padding: 15px; background-color: #e5e7eb; text-align: center; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verify Your Email</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Thank you for registering with DITS. Please verify your email address by clicking the button below:</p>
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #6366f1;">${verificationUrl}</p>
            <p>This verification link will expire in 24 hours.</p>
            <p>If you didn't create an account with DITS, please ignore this email.</p>
            <p>Best regards,<br>The DITS Team</p>
          </div>
        </div>
      </body>
    </html>
  `;
        return sendEmail(email, subject, html);
    });
}
/**
 * Send password reset email
 */
function sendPasswordResetEmail(email, name, resetToken) {
    return __awaiter(this, void 0, void 0, function* () {
        const resetUrl = `${env_1.config.app.url}/auth/reset-password?token=${resetToken}`;
        const subject = 'Reset Your Password';
        const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #6366f1; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>We received a request to reset your password for your DITS account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #6366f1;">${resetUrl}</p>
            <div class="warning">
              <strong>Security Note:</strong> This password reset link will expire in 1 hour. 
              If you didn't request a password reset, please ignore this email or contact support if you have concerns.
            </div>
            <p>Best regards,<br>The DITS Team</p>
          </div>
        </div>
      </body>
    </html>
  `;
        return sendEmail(email, subject, html);
    });
}
/**
 * Send password changed confirmation email
 */
function sendPasswordChangedEmail(email, name) {
    return __awaiter(this, void 0, void 0, function* () {
        const subject = 'Your Password Has Been Changed';
        const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #6366f1; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Changed</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>This email confirms that your password has been successfully changed.</p>
            <div class="warning">
              <strong>Security Alert:</strong> If you didn't make this change, please contact our support team immediately and secure your account.
            </div>
            <p>For security reasons, all active sessions have been logged out. Please log in again with your new password.</p>
            <p>Best regards,<br>The DITS Team</p>
          </div>
        </div>
      </body>
    </html>
  `;
        return sendEmail(email, subject, html);
    });
}
