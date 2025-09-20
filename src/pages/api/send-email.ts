import type { NextApiRequest, NextApiResponse } from 'next';

// You can use nodemailer or any transactional email service here
import nodemailer from 'nodemailer';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, subject, text, orderId } = req.body;

  if (!to || !subject || !text) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Configure your SMTP transport (replace with your real credentials)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    // host: process.env.NEXT_PUBLIC_SMTP_HOST,
    // port: Number(process.env.NEXT_PUBLIC_SMTP_PORT) || 587,
    // secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.NEXT_PUBLIC_SMTP_USER,
      pass: process.env.NEXT_PUBLIC_SMTP_PASS,
    },
    tls: { rejectUnauthorized: false },
  });

  try {
    // Create the formatted email content
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    const videoGuideUrl = `${baseUrl}/order/${orderId}`;
    const loginWebsiteUrl = `${baseUrl}/order/${orderId}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <p>Dear Customer,</p>
        
        <p>We are pleased to inform you that your account is now ready for use. To activate your account, please follow the video guide</p>
        
        <p><strong>Video Guide</strong> <a href="${videoGuideUrl}" style="color: #007bff; text-decoration: none;">click here</a></p>
        
        <p><strong>Internal Order id:</strong><br>
        Super Smash Bros ${orderId}</p>
        
        <p><strong>Log-in website</strong> <a href="${loginWebsiteUrl}" style="color: #007bff; text-decoration: none;">Click here</a></p>
        
        <p>Please carefully review the video guide. For any questions or further assistance, feel free to visit PSNAccounts and</p>
        
        <p>Additionally, a FAQ list is included in this email to address common queries.</p>
        
        <p><strong>Login Information:</strong></p>
        <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin: 15px 0;">
          <pre style="margin: 0; font-family: 'Courier New', monospace; white-space: pre-wrap;">${text}</pre>
        </div>
        
        <p>We hope you enjoy your gaming experience!</p>
      </div>
    `;

    await transporter.sendMail({
      from:
        process.env.NEXT_PUBLIC_SMTP_FROM || process.env.NEXT_PUBLIC_SMTP_USER,
      to,
      subject,
      html: htmlContent,
    });
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Email send error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
