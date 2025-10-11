const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (options) => {
  try {
    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: `"CivicLens Support" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || undefined
    });

    console.log(`Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

const sendSupportRequestConfirmation = async (userEmail, username, ticketId, subject) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #2563eb;">
        <h1 style="color: #2563eb;">CivicLens Support</h1>
      </div>
      <div style="padding: 20px 0;">
        <p>Dear ${username},</p>
        <p>Thank you for contacting CivicLens Support. Your request has been received and a support ticket has been created.</p>
        <p><strong>Ticket ID:</strong> ${ticketId}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p>We'll get back to you as soon as possible. You can reply to this email if you have any additional information to provide.</p>
      </div>
      <div style="padding: 20px 0; border-top: 1px solid #eaeaea;">
        <p>Best regards,</p>
        <p>The CivicLens Support Team</p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: userEmail,
    subject: `[CivicLens Support] Request Received - ${ticketId}`,
    text: `Dear ${username}, thank you for contacting CivicLens Support. Your request has been received with Ticket ID: ${ticketId}. We'll get back to you as soon as possible.`,
    html
  });
};

const sendSupportRequestNotification = async (supportRequest) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #2563eb;">
        <h1 style="color: #2563eb;">New Support Request</h1>
      </div>
      <div style="padding: 20px 0;">
        <p><strong>Ticket ID:</strong> ${supportRequest._id}</p>
        <p><strong>From:</strong> ${supportRequest.username} (${supportRequest.email})</p>
        <p><strong>Subject:</strong> ${supportRequest.subject}</p>
        <p><strong>Category:</strong> ${supportRequest.category}</p>
        <p><strong>Message:</strong></p>
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 10px 0;">
          ${supportRequest.message}
        </div>
        <p><strong>Time Submitted:</strong> ${new Date(supportRequest.createdAt).toLocaleString()}</p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: process.env.EMAIL_USER, // Send to support team email
    subject: `New Support Request - ${supportRequest.subject}`,
    text: `New support request from ${supportRequest.username}. Subject: ${supportRequest.subject}. Category: ${supportRequest.category}.`,
    html
  });
};

module.exports = {
  sendEmail,
  sendSupportRequestConfirmation,
  sendSupportRequestNotification
};