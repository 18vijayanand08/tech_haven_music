const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.sendVerificationEmail = functions.auth.user().onCreate(async (user) => {
  try {
    const userEmail = user.email;
    if (!userEmail) {
      console.log('No email found for user:', user.uid);
      return null;
    }

    // Generate email verification link
    const actionCodeSettings = {
      url: 'https://your-app-url.com', // Change to your app's URL
      handleCodeInApp: true,
    };

    const link = await admin.auth().generateEmailVerificationLink(userEmail, actionCodeSettings);

    // Send email using your preferred email service (e.g., nodemailer, SendGrid)
    // For demonstration, logging the link
    console.log(`Send verification email to ${userEmail} with link: ${link}`);

    // TODO: Implement actual email sending here

    return null;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return null;
  }
});
