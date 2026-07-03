import nodemailer from 'nodemailer'

// Create transporter (configure with your email service)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export interface EmailParams {
  to: string
  subject: string
  body: string
  html?: string
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: params.to,
      subject: params.subject,
      text: params.body,
      html: params.html || params.body,
    })
    return true
  } catch (error) {
    console.error('Email send error:', error)
    return false
  }
}

// Template: Acknowledgement Email
export function getAcknowledgementEmailTemplate(
  leadName: string,
  industry: string
): { subject: string; body: string; html: string } {
  const subject = `Thank you for your inquiry - ${industry} Solutions`

  const body = `Hi ${leadName},

Thank you for reaching out to us! We've received your inquiry about your ${industry} project and we're excited to learn more about your needs.

Our team will review your project details and get back to you shortly with next steps.

In the meantime, if you have any questions, feel free to reply to this email.

Best regards,
The Delipat Team`

  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">Thank You for Your Inquiry</h2>
          <p>Hi ${leadName},</p>
          <p>Thank you for reaching out to us! We've received your inquiry about your <strong>${industry}</strong> project and we're excited to learn more about your needs.</p>
          <p>Our team will review your project details and get back to you shortly with next steps.</p>
          <p>In the meantime, if you have any questions, feel free to reply to this email.</p>
          <p style="margin-top: 30px;">Best regards,<br><strong>The Delipat Team</strong></p>
          <hr style="margin-top: 40px; border: none; border-top: 1px solid #ccc;">
          <p style="font-size: 12px; color: #999;">This is an automated acknowledgement email. Please do not reply with sensitive information.</p>
        </div>
      </body>
    </html>
  `

  return { subject, body, html }
}

// Template: Follow-up Email
export function getFollowUpEmailTemplate(
  leadName: string,
  nextAction: string
): { subject: string; body: string; html: string } {
  const subject = `Let's Discuss Your Project - Next Steps`

  const body = `Hi ${leadName},

Thank you for providing detailed information about your project. Our team has reviewed your submission and we think there could be a great fit here.

Next step: ${nextAction}

We're looking forward to working with you.

Best regards,
The Delipat Team`

  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">Let's Discuss Your Project</h2>
          <p>Hi ${leadName},</p>
          <p>Thank you for providing detailed information about your project. Our team has reviewed your submission and we think there could be a great fit here.</p>
          <div style="background-color: #f0f9ff; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0;">
            <p style="margin: 0;"><strong>Next Step:</strong> ${nextAction}</p>
          </div>
          <p>We're looking forward to working with you.</p>
          <p style="margin-top: 30px;">Best regards,<br><strong>The Delipat Team</strong></p>
        </div>
      </body>
    </html>
  `

  return { subject, body, html }
}
