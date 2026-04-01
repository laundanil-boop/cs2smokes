import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password/confirm?token=${token}`

  await transporter.sendMail({
    from: `"CS2Smokes" <${process.env.SMTP_FROM_EMAIL}>`,
    to: email,
    subject: 'Сброс пароля - CS2Smokes',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
            .link { word-break: break-all; color: #667eea; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">CS2Smokes</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Сброс пароля</p>
            </div>
            <div class="content">
              <p>Здравствуйте!</p>
              <p>Вы запросили сброс пароля для вашего аккаунта CS2Smokes.</p>
              <p>Нажмите на кнопку ниже, чтобы установить новый пароль:</p>
              <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Сбросить пароль</a>
              </p>
              <p>Или скопируйте эту ссылку в браузер:</p>
              <p><a href="${resetUrl}" class="link">${resetUrl}</a></p>
              <p><strong>Внимание:</strong> Ссылка действительна в течение 1 часа.</p>
              <p>Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} CS2Smokes. Не affiliated with Valve Corporation.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Сброс пароля - CS2Smokes

Здравствуйте!

Вы запросили сброс пароля для вашего аккаунта CS2Smokes.

Откройте эту ссылку в браузере для установки нового пароля:
${resetUrl}

Ссылка действительна в течение 1 часа.

Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.

---
© ${new Date().getFullYear()} CS2Smokes
    `,
  })
}
