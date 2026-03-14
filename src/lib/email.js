const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// ── EMAIL TEMPLATES ──

const baseStyle = `
  font-family: 'Georgia', serif;
  background: #faf7f2;
  color: #2c1a17;
  max-width: 560px;
  margin: 0 auto;
  padding: 48px 40px;
`
const headerStyle = `
  text-align: center;
  border-bottom: 1px solid rgba(200,169,126,0.3);
  padding-bottom: 24px;
  margin-bottom: 32px;
`
const logoStyle = `
  font-size: 26px;
  font-weight: 300;
  color: #6b3d38;
  letter-spacing: 0.02em;
`
const goldSpan = `color: #c8a97e;`
const bodyStyle = `font-size: 15px; line-height: 1.8; color: #6b3d38; font-weight: 300;`
const btnStyle = `
  display: inline-block;
  background: #6b3d38;
  color: #faf7f2;
  padding: 12px 32px;
  text-decoration: none;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-top: 24px;
`
const footerStyle = `
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid rgba(200,169,126,0.2);
  text-align: center;
  font-size: 11px;
  color: rgba(107,61,56,0.4);
  font-family: 'DM Sans', sans-serif;
`

function wrapEmail(body) {
  return `
    <!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
    <body style="margin:0;padding:0;background:#f0ebe4;">
      <div style="${baseStyle}">
        <div style="${headerStyle}">
          <p style="${logoStyle}">Wish<span style="${goldSpan}">Story</span></p>
        </div>
        ${body}
        <div style="${footerStyle}">
          <p>© 2025 WishStory · wishstory.in</p>
          <p style="margin-top:4px;">Crafted with love, delivered with care.</p>
        </div>
      </div>
    </body></html>
  `
}

// ── SEND FUNCTIONS ──

async function sendWelcomeEmail(user) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: 'Welcome to WishStory — Your first story awaits',
    html: wrapEmail(`
      <p style="${bodyStyle}">Dear ${user.name},</p>
      <p style="${bodyStyle}">Welcome to WishStory. We're honoured to help you turn your memories into something truly beautiful.</p>
      <p style="${bodyStyle}">Whenever you're ready, begin by creating your first story.</p>
      <a href="${process.env.CLIENT_URL}/dashboard/create" style="${btnStyle}">Create Your First Story</a>
    `),
  })
}

async function sendPaymentConfirmationEmail(user, story) {
  const pkg = story.packageType === 'luxe' ? 'Luxe Film' : 'Signature Story'
  const delivery = story.packageType === 'luxe' ? '12 hours' : '24 hours'
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: `Payment Confirmed — Your WishStory for ${story.recipientName}`,
    html: wrapEmail(`
      <p style="${bodyStyle}">Dear ${user.name},</p>
      <p style="${bodyStyle}">Your payment has been confirmed and your story request has been received.</p>
      <table style="width:100%;margin:24px 0;border-collapse:collapse;">
        <tr><td style="padding:8px 0;color:#9d6e65;font-size:13px;font-weight:300;">Story for</td><td style="padding:8px 0;color:#6b3d38;font-size:13px;text-align:right;">${story.recipientName}</td></tr>
        <tr><td style="padding:8px 0;color:#9d6e65;font-size:13px;font-weight:300;">Package</td><td style="padding:8px 0;color:#6b3d38;font-size:13px;text-align:right;">${pkg}</td></tr>
        <tr><td style="padding:8px 0;color:#9d6e65;font-size:13px;font-weight:300;">Estimated delivery</td><td style="padding:8px 0;color:#6b3d38;font-size:13px;text-align:right;">Within ${delivery}</td></tr>
        <tr style="border-top:1px solid rgba(200,169,126,0.25);"><td style="padding:12px 0;color:#6b3d38;font-weight:500;">Amount paid</td><td style="padding:12px 0;color:#6b3d38;font-size:20px;font-weight:300;text-align:right;">$${story.packagePrice}</td></tr>
      </table>
      <p style="${bodyStyle}">Our team is now beginning to craft something beautiful for you. We'll send you another email the moment your story is ready.</p>
      <a href="${process.env.CLIENT_URL}/dashboard" style="${btnStyle}">View Dashboard</a>
    `),
  })
}

async function sendStoryCompletedEmail(user, story) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: `Your WishStory for ${story.recipientName} is ready ✨`,
    html: wrapEmail(`
      <p style="${bodyStyle}">Dear ${user.name},</p>
      <p style="${bodyStyle}">Your WishStory is ready. Our team has crafted a cinematic story for <strong style="color:#6b3d38;font-weight:500;">${story.recipientName}</strong> — we hope it moves them as much as you hoped it would.</p>
      <p style="text-align:center;margin:32px 0;">
        <a href="${story.storyLink}" style="${btnStyle}">Open Your Story →</a>
      </p>
      <p style="${bodyStyle};font-size:13px;color:#9d6e65;">Share this private link with ${story.recipientName} whenever the moment feels right.</p>
      ${story.passwordProtected ? `<p style="font-size:12px;color:#c9968a;margin-top:12px;">This story is password protected. Please share the password along with the link.</p>` : ''}
    `),
  })
}

module.exports = {
  sendWelcomeEmail,
  sendPaymentConfirmationEmail,
  sendStoryCompletedEmail,
}
