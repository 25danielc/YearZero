import nodemailer from "nodemailer"

// Create a reusable transporter
const createTransporter = () => {
  const emailHost = process.env.EMAIL_HOST || "smtp.gmail.com"
  const emailPort = parseInt(process.env.EMAIL_PORT || "587")
  const emailUser = process.env.EMAIL_USER
  const emailPassword = process.env.EMAIL_PASSWORD

  if (!emailUser || !emailPassword) {
    console.warn("Email credentials not configured. Notifications will not be sent.")
    return null
  }

  return nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: emailPort === 465, // true for 465, false for other ports
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  })
}

export interface DailyNotificationData {
  email: string
  userName: string
  uncheckedResolutions: Array<{
    title: string
    category: string
    currentStreak: number
  }>
  totalXP: number
  level: number
  currentStreak: number
}

export async function sendDailyNotification(data: DailyNotificationData): Promise<boolean> {
  const transporter = createTransporter()
  if (!transporter) {
    return false
  }

  const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
  
  const resolutionList = data.uncheckedResolutions.length > 0
    ? data.uncheckedResolutions
        .map(
          (r) => `  • ${r.title} (${r.category}) - ${r.currentStreak} day streak`
        )
        .join("\n")
    : "  You're all caught up! 🎉"

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Daily Check-in Reminder - YearZero</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">⚡ YearZero</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0;">Daily Check-in Reminder</p>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
          <p style="font-size: 16px; margin: 0 0 20px 0;">Hi ${data.userName || "there"},</p>
          
          <p style="font-size: 16px; margin: 0 0 20px 0;">
            It's time for your daily check-in! Here's what you need to know:
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #1f2937;">📋 Resolutions to Check In:</h2>
            <pre style="font-family: inherit; white-space: pre-wrap; margin: 0; color: #4b5563;">${resolutionList}</pre>
          </div>
          
          <div style="display: flex; gap: 15px; margin: 25px 0;">
            <div style="flex: 1; background: white; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #e5e7eb;">
              <div style="font-size: 24px; font-weight: bold; color: #667eea; margin-bottom: 5px;">⭐ ${data.totalXP}</div>
              <div style="font-size: 12px; color: #6b7280; text-transform: uppercase;">Total XP</div>
            </div>
            <div style="flex: 1; background: white; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #e5e7eb;">
              <div style="font-size: 24px; font-weight: bold; color: #667eea; margin-bottom: 5px;">🎯 ${data.level}</div>
              <div style="font-size: 12px; color: #6b7280; text-transform: uppercase;">Level</div>
            </div>
            <div style="flex: 1; background: white; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #e5e7eb;">
              <div style="font-size: 24px; font-weight: bold; color: #f59e0b; margin-bottom: 5px;">🔥 ${data.currentStreak}</div>
              <div style="font-size: 12px; color: #6b7280; text-transform: uppercase;">Day Streak</div>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${appUrl}/app/checkin" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Check In Now →
            </a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin: 30px 0 0 0; text-align: center;">
            Keep your streak alive and level up your goals! 💪
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding: 20px; color: #9ca3af; font-size: 12px;">
          <p style="margin: 0;">This is an automated reminder from YearZero</p>
          <p style="margin: 10px 0 0 0;">
            <a href="${appUrl}/app/settings" style="color: #667eea; text-decoration: none;">Manage preferences</a>
          </p>
        </div>
      </body>
    </html>
  `

  const emailText = `
YearZero - Daily Check-in Reminder

Hi ${data.userName || "there"},

It's time for your daily check-in! Here's what you need to know:

Resolutions to Check In:
${data.uncheckedResolutions.length > 0
    ? data.uncheckedResolutions
        .map((r) => `  • ${r.title} (${r.category}) - ${r.currentStreak} day streak`)
        .join("\n")
    : "  You're all caught up! 🎉"}

Stats:
  • Total XP: ${data.totalXP}
  • Level: ${data.level}
  • Current Streak: ${data.currentStreak} days

Check in now: ${appUrl}/app/checkin

Keep your streak alive and level up your goals! 💪

---
This is an automated reminder from YearZero
Manage preferences: ${appUrl}/app/settings
  `.trim()

  try {
    await transporter.sendMail({
      from: `"YearZero" <${process.env.EMAIL_USER}>`,
      to: data.email,
      subject: "⚡ Daily Check-in Reminder - YearZero",
      text: emailText,
      html: emailHtml,
    })
    return true
  } catch (error) {
    console.error("Error sending email:", error)
    return false
  }
}

