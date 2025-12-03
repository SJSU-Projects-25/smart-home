# SMTP Configuration Guide

This guide explains how to configure SMTP settings for email notifications in the Smart Home Cloud Platform.

## Overview

The application sends email notifications to emergency contacts when critical (high-severity) alerts are detected. Email notifications are handled by the `email_service.py` module.

## Configuration

Add the following environment variables to your `.env` file:

### Required for Production

```bash
# SMTP Server Configuration
SMTP_HOST=smtp.gmail.com                    # Your SMTP server hostname
SMTP_PORT=587                               # SMTP port (587 for TLS, 465 for SSL)
SMTP_USERNAME=your-email@gmail.com          # SMTP username (usually your email)
SMTP_PASSWORD=your-app-password             # SMTP password or app-specific password
SMTP_USE_TLS=true                           # Use TLS encryption (true/false)
SMTP_FROM_EMAIL=noreply@smarthome.com       # From email address for notifications
```

### Development Mode

If SMTP settings are not configured, the application will log emails to the console instead of sending them. This is useful for local development.

## Common SMTP Providers

### Gmail

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password  # Use App Password, not regular password
SMTP_USE_TLS=true
SMTP_FROM_EMAIL=your-email@gmail.com
```

**Note:** For Gmail, you need to:
1. Enable 2-Factor Authentication
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the App Password (not your regular password) in `SMTP_PASSWORD`

### SendGrid

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=your-sendgrid-api-key
SMTP_USE_TLS=true
SMTP_FROM_EMAIL=noreply@yourdomain.com
```

### AWS SES

```bash
SMTP_HOST=email-smtp.us-west-2.amazonaws.com  # Use your region's endpoint
SMTP_PORT=587
SMTP_USERNAME=your-ses-smtp-username
SMTP_PASSWORD=your-ses-smtp-password
SMTP_USE_TLS=true
SMTP_FROM_EMAIL=noreply@yourdomain.com
```

### Outlook/Office 365

```bash
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USERNAME=your-email@outlook.com
SMTP_PASSWORD=your-password
SMTP_USE_TLS=true
SMTP_FROM_EMAIL=your-email@outlook.com
```

## Testing Email Configuration

1. Configure SMTP settings in `.env`
2. Restart the API server
3. Create a high-severity alert (or trigger one through the system)
4. Check that emergency contacts receive email notifications

## Email Content

Email notifications include:
- Alert type and severity
- Home name
- Room and device information
- Confidence score
- Timestamp

## Troubleshooting

### Emails not sending

1. **Check logs**: Look for error messages in the API logs
2. **Verify credentials**: Ensure SMTP username and password are correct
3. **Check firewall**: Ensure port 587 or 465 is not blocked
4. **Test connection**: Use a tool like `telnet` or `openssl` to test SMTP connectivity

### Gmail-specific issues

- Make sure you're using an App Password, not your regular password
- Ensure "Less secure app access" is enabled (if not using App Passwords)
- Check that 2FA is enabled if using App Passwords

### Development mode

If SMTP is not configured, emails will be logged to the console with the prefix `[EMAIL]`. This allows you to see what emails would be sent without actually sending them.

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use App Passwords** instead of regular passwords when possible
3. **Rotate credentials** regularly
4. **Use environment-specific credentials** (different for dev/staging/prod)
5. **Monitor email sending** for unusual activity

## Example .env Entry

```bash
# Email/SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=notifications@yourcompany.com
SMTP_PASSWORD=abcd-efgh-ijkl-mnop
SMTP_USE_TLS=true
SMTP_FROM_EMAIL=Smart Home Platform <notifications@yourcompany.com>
```


