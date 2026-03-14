const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
})

// ── POST /api/contact ──
router.post('/', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('subject').trim().isLength({ min: 3 }).withMessage('Subject is required'),
  body('message').trim().isLength({ min: 20 }).withMessage('Message must be at least 20 characters'),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg })

  const { name, email, subject, category, message, orderId } = req.body

  try {
    // Email to WishStory team
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `[WishStory Contact] ${category ? `[${category}] ` : ''}${subject}`,
      html: `
        <!DOCTYPE html><html><body style="font-family:Georgia,serif;background:#faf7f2;padding:32px;color:#2c1a17;max-width:560px;margin:0 auto;">
          <div style="border-bottom:1px solid rgba(200,169,126,0.3);padding-bottom:16px;margin-bottom:24px;">
            <p style="font-size:22px;font-weight:300;color:#6b3d38;margin:0;">Wish<span style="color:#c8a97e;">Story</span> — New Message</p>
          </div>
          <table style="width:100%;font-size:14px;margin-bottom:24px;border-collapse:collapse;">
            <tr><td style="padding:6px 0;color:#9d6e65;width:120px;font-weight:300;">From</td><td style="padding:6px 0;color:#2c1a17;">${name}</td></tr>
            <tr><td style="padding:6px 0;color:#9d6e65;font-weight:300;">Email</td><td style="padding:6px 0;"><a href="mailto:${email}" style="color:#6b3d38;">${email}</a></td></tr>
            <tr><td style="padding:6px 0;color:#9d6e65;font-weight:300;">Category</td><td style="padding:6px 0;color:#2c1a17;text-transform:capitalize;">${category || 'General'}</td></tr>
            ${orderId ? `<tr><td style="padding:6px 0;color:#9d6e65;font-weight:300;">Order ID</td><td style="padding:6px 0;color:#2c1a17;">${orderId}</td></tr>` : ''}
            <tr><td style="padding:6px 0;color:#9d6e65;font-weight:300;">Subject</td><td style="padding:6px 0;color:#2c1a17;">${subject}</td></tr>
          </table>
          <div style="background:#f0ebe4;border:1px solid rgba(200,169,126,0.2);padding:16px;font-size:14px;line-height:1.7;color:#6b3d38;font-weight:300;">
            ${message.replace(/\n/g, '<br/>')}
          </div>
          <p style="margin-top:24px;font-size:11px;color:rgba(107,61,56,0.4);">Sent via wishstory.in/contact</p>
        </body></html>
      `,
    })

    // Auto-reply to sender
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'We received your message — WishStory',
      html: `
        <!DOCTYPE html><html><body style="font-family:Georgia,serif;background:#faf7f2;padding:40px;color:#2c1a17;max-width:520px;margin:0 auto;">
          <div style="text-align:center;border-bottom:1px solid rgba(200,169,126,0.3);padding-bottom:20px;margin-bottom:28px;">
            <p style="font-size:24px;font-weight:300;color:#6b3d38;margin:0;">Wish<span style="color:#c8a97e;">Story</span></p>
          </div>
          <p style="font-size:15px;line-height:1.8;color:#6b3d38;font-weight:300;">Dear ${name},</p>
          <p style="font-size:15px;line-height:1.8;color:#6b3d38;font-weight:300;">Thank you for reaching out to us. We have received your message and our team will respond within <strong style="color:#6b3d38;">2 business days</strong>.</p>
          <p style="font-size:15px;line-height:1.8;color:#6b3d38;font-weight:300;">If your enquiry is urgent or related to an ongoing story order, please email us directly at <a href="mailto:hello@wishstory.in" style="color:#c8a97e;">hello@wishstory.in</a>.</p>
          <div style="background:#f0ebe4;border-left:3px solid rgba(200,169,126,0.5);padding:14px 16px;margin:24px 0;font-size:13px;color:#9d6e65;font-style:italic;font-weight:300;">
            Your message: "${subject}"
          </div>
          <p style="font-size:14px;line-height:1.8;color:#9d6e65;font-weight:300;">With warmth,<br/>The WishStory Team</p>
          <div style="margin-top:32px;padding-top:20px;border-top:1px solid rgba(200,169,126,0.2);text-align:center;font-size:11px;color:rgba(107,61,56,0.35);font-family:'DM Sans',sans-serif;">
            <p>© 2025 WishStory · wishstory.in</p>
          </div>
        </body></html>
      `,
    })

    res.json({ success: true, message: 'Message sent successfully.' })
  } catch (err) {
    console.error('Contact email error:', err)
    res.status(500).json({ error: 'Failed to send message. Please email us directly at hello@wishstory.in' })
  }
})

module.exports = router
