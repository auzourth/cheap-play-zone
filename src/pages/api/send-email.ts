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

  const { to, subject, text } = req.body;

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
    await transporter.sendMail({
      from:
        process.env.NEXT_PUBLIC_SMTP_FROM || process.env.NEXT_PUBLIC_SMTP_USER,
      to,
      subject,
      text,
    });
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Email send error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
