import nodemailer from "nodemailer"
import { NextResponse } from "next/server"

export async function GET() {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.MAIL_USER!,
      pass: process.env.MAIL_PASS!
    },
    tls: { rejectUnauthorized: false }
  })

  await transporter.sendMail({
    from: `R P Gupta Invoice <${process.env.MAIL_USER}>`,
    to: "rohitgupta91600@gmail.com",
    subject: "Mail Test",
    text: "Mail working"
  })

  return NextResponse.json({ ok: true })
}
