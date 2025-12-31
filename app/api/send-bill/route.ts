import nodemailer from "nodemailer"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const data = await req.json()

  const COMPANY = process.env.MAIL_USER!
  const PASS = process.env.MAIL_PASS!

  const recipients = ["rohitgupta91600@gmail.com"]
  if (data.customer?.email) recipients.push(data.customer.email)

  const t = nodemailer.createTransport({
    service: "gmail",
    auth: { user: COMPANY, pass: PASS }
  })

  await t.sendMail({
    from: `R P Gupta Invoice <${COMPANY}>`,
    to: recipients,
    subject: `Invoice #${data.invoiceNo}`,
    html: data.html
  })

  return NextResponse.json({ sent: true })
}
