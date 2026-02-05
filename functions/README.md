# Alumni Platform - Cloud Functions

This directory contains Firebase Cloud Functions (v2) for the Alumni Platform, including email notifications using Zoho SMTP.

## Setup Instructions

### 1. Install Dependencies

```bash
cd functions
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `functions` directory based on `.env.example`:

```bash
cp .env.example .env
```

Then edit `.env` with your actual values:

```env
# Email Feature Toggle (set to "true" to enable, "false" to disable)
EMAIL_ENABLED=true

# Zoho SMTP Configuration
ZOHO_EMAIL=info@ohyeahsaas.com
ZOHO_PASSWORD=your-zoho-app-password

# App Configuration
APP_NAME=Alumni Platform
APP_URL=https://alumni-platform-fd554.web.app
```

### 3. Zoho Mail App Password

To use Zoho SMTP, you need to generate an App Password:

1. Log in to your Zoho Mail account at https://mail.zoho.com
2. Go to **Settings** (gear icon) → **Security** → **App Passwords**
3. Click **Generate New Password**
4. Name it (e.g., "Alumni Platform")
5. Copy the generated password and use it as `ZOHO_PASSWORD` in your `.env` file

**Note:** Do not use your regular Zoho password. Always use an App Password for SMTP.

### 4. Deploy Functions

```bash
# From the project root directory
firebase deploy --only functions
```

The `.env` file will be automatically read during deployment.

### 5. Test Locally (Optional)

To test functions locally with the emulator:

```bash
cd functions
npm run serve
```

This will start the Firebase emulator. Make sure your `.env` file is configured.

## Available Functions

### `sendUserWelcomeEmail`
Sends a welcome email to newly registered users.

**Parameters:**
- `firstName`: User's first name
- `lastName`: User's last name
- `email`: User's email address

### `sendAdminWelcomeEmail`
Sends a welcome email to newly created admins with their credentials.

**Parameters:**
- `name`: Admin's name
- `email`: Admin's email address
- `isSuperAdmin`: Boolean indicating if super admin
- `tempPassword`: Temporary password for the admin

### `sendEmail`
Generic email sender for future use.

**Parameters:**
- `to`: Recipient email
- `subject`: Email subject
- `html` or `text`: Email body

## Email Feature Toggle

The email feature can be turned on/off via the `EMAIL_ENABLED` environment variable:

- `EMAIL_ENABLED=true` - Emails will be sent
- `EMAIL_ENABLED=false` - Emails will be skipped (functions return success without sending)

This allows you to disable email notifications without changing code, useful for:
- Development/testing environments
- Temporarily disabling emails
- Environments where email is not configured

## Troubleshooting

### CORS Errors?

CORS errors usually mean the functions haven't been deployed yet. Deploy them first:

```bash
firebase deploy --only functions
```

### Emails not sending?

1. Check that `EMAIL_ENABLED` is set to `"true"` (string, not boolean)
2. Verify your Zoho credentials are correct
3. Check Firebase Functions logs: `firebase functions:log`
4. Ensure your Zoho account has SMTP enabled

### Authentication errors?

1. Make sure you're using an App Password, not your regular password
2. Verify the email address is correct
3. Check if 2FA is enabled on your Zoho account

### Functions not deploying?

1. Ensure you have the Firebase CLI installed: `npm install -g firebase-tools`
2. Log in to Firebase: `firebase login`
3. Check that your project is selected: `firebase use alumni-platform-fd554`

### View Function Logs

```bash
firebase functions:log
```

Or view in Firebase Console: https://console.firebase.google.com/project/alumni-platform-fd554/functions/logs
