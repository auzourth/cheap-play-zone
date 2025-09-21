import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { to, subject, text } = await request.json();

    if (!to || !subject || !text) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
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

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <pre style="margin: 0; white-space: pre-wrap; font-size: 14px; line-height: 1.4;">${text}</pre>
      </div>
    `;

    await transporter.sendMail({
      from:
        process.env.NEXT_PUBLIC_SMTP_FROM || process.env.NEXT_PUBLIC_SMTP_USER,
      to,
      subject,
      html: htmlContent,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Email send error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
