const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineString } = require("firebase-functions/params");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

// Define parameters (these will be read from .env file or Firebase secrets)
const emailEnabled = defineString("EMAIL_ENABLED", { default: "false" });
const zohoEmail = defineString("ZOHO_EMAIL", { default: "" });
const zohoPassword = defineString("ZOHO_PASSWORD", { default: "" });
const appName = defineString("APP_NAME", { default: "Alumni Platform" });
const appUrl = defineString("APP_URL", { default: "" });

// Email configuration using Zoho SMTP
const getTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.zoho.com",
    port: 465,
    secure: true,
    auth: {
      user: zohoEmail.value(),
      pass: zohoPassword.value(),
    },
  });
};

// Check if email feature is enabled
const isEmailEnabled = () => {
  return emailEnabled.value() === "true";
};

// Email template for new user welcome
const getUserWelcomeTemplate = (userData) => {
  const { firstName, lastName } = userData;
  const appNameVal = appName.value();
  const appUrlVal = appUrl.value();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ${appNameVal}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Welcome to ${appNameVal}!</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Hello <strong>${firstName} ${lastName}</strong>,
              </p>
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                We're thrilled to have you join our alumni community! Your account has been successfully created.
              </p>

              <div style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; color: #0369a1; font-size: 14px;">
                  <strong>Your Login Details:</strong><br><br>
                  <span style="color: #374151;">Last Name: <strong>${lastName}</strong></span><br>
                  <span style="color: #374151;">Phone: <strong>(Use the phone number you registered with)</strong></span>
                </p>
              </div>

              <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 1.6;">
                With your account, you can:
              </p>

              <ul style="margin: 0 0 30px; padding-left: 20px; color: #374151; font-size: 16px; line-height: 1.8;">
                <li>View upcoming alumni meetings and events</li>
                <li>Track donations and contributions</li>
                <li>Stay connected with fellow alumni</li>
                <li>Access community resources</li>
              </ul>

              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center">
                    <a href="${appUrlVal}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 6px rgba(14, 165, 233, 0.3);">
                      Login to Your Account
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8fafc; border-radius: 0 0 12px 12px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 10px; color: #64748b; font-size: 14px; text-align: center;">
                If you have any questions, feel free to reach out to us.
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px; text-align: center;">
                &copy; ${new Date().getFullYear()} ${appNameVal}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

// Email template for new admin welcome
const getAdminWelcomeTemplate = (adminData) => {
  const { name, email, isSuperAdmin, tempPassword } = adminData;
  const appNameVal = appName.value();
  const appUrlVal = appUrl.value();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Account Created - ${appNameVal}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); border-radius: 12px 12px 0 0;">
              <div style="display: inline-block; padding: 8px 16px; background-color: rgba(255,255,255,0.2); border-radius: 20px; margin-bottom: 15px;">
                <span style="color: #ffffff; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                  ${isSuperAdmin ? 'Super Admin' : 'Admin'} Access
                </span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Admin Account Created!</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Hello <strong>${name}</strong>,
              </p>
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                You have been granted <strong>${isSuperAdmin ? 'Super Admin' : 'Admin'}</strong> access to the ${appNameVal}. Your account is now active and ready to use.
              </p>

              <div style="background-color: #faf5ff; border-left: 4px solid #7c3aed; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; color: #5b21b6; font-size: 14px;">
                  <strong>Your Login Credentials:</strong><br><br>
                  <span style="color: #374151;">Email: <strong>${email}</strong></span><br>
                  ${tempPassword ? `<span style="color: #374151;">Temporary Password: <strong>${tempPassword}</strong></span>` : ''}
                </p>
              </div>

              ${tempPassword ? `
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  <strong>Important:</strong> Please change your password after your first login for security purposes.
                </p>
              </div>
              ` : ''}

              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                As an ${isSuperAdmin ? 'Super Admin' : 'Admin'}, you can:
              </p>

              <ul style="margin: 0 0 30px; padding-left: 20px; color: #374151; font-size: 16px; line-height: 1.8;">
                <li>Manage alumni meetings and events</li>
                <li>Track and manage donations</li>
                <li>Record and monitor expenses</li>
                <li>Manage user accounts</li>
                ${isSuperAdmin ? '<li><strong>Create and manage other admin accounts</strong></li>' : ''}
                <li>Access analytics and reports</li>
              </ul>

              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center">
                    <a href="${appUrlVal}/admin-login" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 6px rgba(124, 58, 237, 0.3);">
                      Access Admin Panel
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8fafc; border-radius: 0 0 12px 12px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 10px; color: #64748b; font-size: 14px; text-align: center;">
                This is an automated message. Please do not reply to this email.
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px; text-align: center;">
                &copy; ${new Date().getFullYear()} ${appNameVal}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

// Cloud Function: Send welcome email to new user
exports.sendUserWelcomeEmail = onCall(async (request) => {
  // Check if email feature is enabled
  if (!isEmailEnabled()) {
    console.log("Email feature is disabled");
    return { success: true, message: "Email feature is disabled" };
  }

  const { firstName, lastName, email } = request.data;

  if (!email) {
    throw new HttpsError(
      "invalid-argument",
      "Email address is required"
    );
  }

  try {
    const transporter = getTransporter();

    const mailOptions = {
      from: `"${appName.value()}" <${zohoEmail.value()}>`,
      to: email,
      subject: `Welcome to ${appName.value()}!`,
      html: getUserWelcomeTemplate({ firstName, lastName, email }),
    };

    await transporter.sendMail(mailOptions);

    console.log(`Welcome email sent to user: ${email}`);
    return { success: true, message: "Welcome email sent successfully" };
  } catch (error) {
    console.error("Error sending user welcome email:", error);
    throw new HttpsError(
      "internal",
      "Failed to send welcome email"
    );
  }
});

// Cloud Function: Send welcome email to new admin
exports.sendAdminWelcomeEmail = onCall(async (request) => {
  // Check if email feature is enabled
  if (!isEmailEnabled()) {
    console.log("Email feature is disabled");
    return { success: true, message: "Email feature is disabled" };
  }

  // Verify the caller is authenticated
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "User must be authenticated"
    );
  }

  const { name, email, isSuperAdmin, tempPassword } = request.data;

  if (!email) {
    throw new HttpsError(
      "invalid-argument",
      "Email address is required"
    );
  }

  try {
    const transporter = getTransporter();

    const mailOptions = {
      from: `"${appName.value()}" <${zohoEmail.value()}>`,
      to: email,
      subject: `Admin Account Created - ${appName.value()}`,
      html: getAdminWelcomeTemplate({ name, email, isSuperAdmin, tempPassword }),
    };

    await transporter.sendMail(mailOptions);

    console.log(`Welcome email sent to admin: ${email}`);
    return { success: true, message: "Admin welcome email sent successfully" };
  } catch (error) {
    console.error("Error sending admin welcome email:", error);
    throw new HttpsError(
      "internal",
      "Failed to send admin welcome email"
    );
  }
});

// Cloud Function: Generic email sender (for future use)
exports.sendEmail = onCall(async (request) => {
  // Check if email feature is enabled
  if (!isEmailEnabled()) {
    console.log("Email feature is disabled");
    return { success: true, message: "Email feature is disabled" };
  }

  // Verify the caller is authenticated
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "User must be authenticated"
    );
  }

  const { to, subject, html, text } = request.data;

  if (!to || !subject || (!html && !text)) {
    throw new HttpsError(
      "invalid-argument",
      "Missing required fields: to, subject, and either html or text"
    );
  }

  try {
    const transporter = getTransporter();

    const mailOptions = {
      from: `"${appName.value()}" <${zohoEmail.value()}>`,
      to,
      subject,
      ...(html && { html }),
      ...(text && { text }),
    };

    await transporter.sendMail(mailOptions);

    console.log(`Email sent to: ${to}`);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new HttpsError(
      "internal",
      "Failed to send email"
    );
  }
});
