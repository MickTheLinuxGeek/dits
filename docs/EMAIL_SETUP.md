# Email Setup Guide

This document provides guidance on configuring email for DITS in both development and production environments.

## Development Environment

For local development and testing, you don't need real email credentials. Use one of these options:

### Option 1: Mailpit (Recommended)

Mailpit is a local email testing tool that captures all sent emails for inspection.

```bash
# Run with Docker
docker run -d --name mailpit -p 1025:1025 -p 8025:8025 axllent/mailpit
```

Configure `.env`:
```env
EMAIL_PROVIDER=smtp
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM=noreply@dits.dev
```

View sent emails at: http://localhost:8025

**Benefits:**
- No external account needed
- View all emails in a web interface
- Test email templates easily
- No rate limits

### Option 2: Ethereal Email

Free disposable SMTP service for testing.

1. Visit https://ethereal.email/ to generate test credentials
2. Configure `.env`:

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<generated-user>
SMTP_PASSWORD=<generated-password>
EMAIL_FROM=noreply@dits.dev
```

**Benefits:**
- Real SMTP testing
- Web interface to view emails
- No installation required

### Option 3: Gmail with App Password

If you have a personal Gmail account:

1. Enable 2FA on your Google account
2. Generate an app password at https://myaccount.google.com/apppasswords
3. Configure `.env`:

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=<your-16-char-app-password>
EMAIL_FROM=your-email@gmail.com
```

**Note:** Gmail has daily sending limits (100-500 emails/day).

## Production Environment

For production, use a dedicated transactional email service. These services handle deliverability, spam prevention, and scale automatically.

### Recommended Services

#### SendGrid (Twilio)
- **Free Tier:** 100 emails/day
- **Paid:** Starts at $19.95/month (50,000 emails)
- **Best For:** Most use cases, good balance of features and cost
- **Setup:** https://sendgrid.com/

```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your-api-key
EMAIL_FROM=noreply@dits.dev
```

#### Amazon SES
- **Cost:** $0.10 per 1,000 emails
- **Best For:** High volume, cost-conscious applications
- **Setup:** Requires AWS account and email verification
- **Note:** Starts in sandbox mode (limited sending)

```env
EMAIL_PROVIDER=ses
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
EMAIL_FROM=noreply@dits.dev
```

#### Postmark
- **Free Tier:** 100 emails/month
- **Paid:** $15/month (10,000 emails)
- **Best For:** Transactional emails (not marketing)
- **Setup:** https://postmarkapp.com/

```env
EMAIL_PROVIDER=postmark
POSTMARK_API_KEY=your-api-key
EMAIL_FROM=noreply@dits.dev
```

#### Mailgun
- **Free Tier:** 5,000 emails/month (first 3 months)
- **Paid:** $35/month (50,000 emails)
- **Best For:** Developer-friendly API
- **Setup:** https://mailgun.com/

```env
EMAIL_PROVIDER=mailgun
MAILGUN_API_KEY=your-api-key
MAILGUN_DOMAIN=mg.yourdomain.com
EMAIL_FROM=noreply@dits.dev
```

### Comparison

| Service | Free Tier | Best For | Complexity |
|---------|-----------|----------|------------|
| SendGrid | 100/day | General use | Low |
| Amazon SES | None (pay-per-use) | High volume | Medium |
| Postmark | 100/month | Transactional | Low |
| Mailgun | 5,000/month (3mo) | Developer apps | Low |

## Common Issues

### Microsoft/Outlook/Hotmail SMTP Issues

**Problem:** "535 5.7.139 Authentication unsuccessful, basic authentication is disabled"

**Cause:** Microsoft has disabled basic authentication for security reasons.

**Solution:** 
- **Don't use personal Microsoft accounts for sending in production**
- Use a dedicated transactional email service instead
- For development, use Mailpit or Ethereal

**Important:** Users can still **receive** emails at Hotmail/Outlook addresses. The issue is only with **sending** from Microsoft accounts using SMTP.

### Gmail "Less secure app access" 

**Problem:** Can't authenticate with Gmail

**Solution:**
1. Enable 2-Factor Authentication
2. Generate an App Password (not your regular password)
3. Use the 16-character app password in your `.env`

### Domain Verification

For production email services, you'll need to:

1. **Verify your sending domain** (e.g., dits.dev)
2. **Add SPF, DKIM, and DMARC records** to your DNS
3. **Warm up your domain** (gradually increase sending volume)

Most services provide step-by-step guides for domain setup.

## Email Templates

Current email templates in `src/services/email.ts`:

- **Welcome Email** - Sent on successful registration
- **Email Verification** - Sent to verify user email addresses
- **Password Reset** - Sent when user requests password reset
- **Password Changed** - Confirmation when password is changed

## Testing Emails

To test email functionality:

```bash
# Start the server
npm run dev

# Register a new user via API or web interface
# Check email in:
# - Mailpit: http://localhost:8025
# - Ethereal: Check the URL provided during account creation
```

## Implementation Notes

The email service is located in `src/services/email.ts` and uses:
- **nodemailer** for SMTP support
- Configurable transporter based on environment
- HTML email templates with inline CSS
- Automatic text fallback (strips HTML tags)

To add support for additional providers (SendGrid, SES, etc.), extend the `initializeEmailService()` function to check the `EMAIL_PROVIDER` environment variable and initialize the appropriate service.

## Security Best Practices

1. **Never commit email credentials** to version control
2. **Use environment variables** for all sensitive data
3. **Rotate API keys regularly** in production
4. **Monitor email sending** for abuse/spam
5. **Implement rate limiting** on email-triggering endpoints
6. **Use HTTPS** for all email-related API endpoints
7. **Validate email addresses** before attempting to send

## Future Enhancements

- [ ] Add SendGrid provider implementation
- [ ] Add Amazon SES provider implementation
- [ ] Email template engine (Handlebars/Pug)
- [ ] Email queue for async processing (Bull/BullMQ)
- [ ] Email analytics and tracking
- [ ] Unsubscribe mechanism (for optional emails)
- [ ] Email preferences per user
