import nodemailer from "nodemailer"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const body = await req.json()

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER!,
      pass: process.env.MAIL_PASS!,
    },
  })

  await transporter.sendMail({
    from: "R P Gupta Invoice <rpguptainvoice@gmail.com>",
    to: body.to,
    subject: `Invoice #${body.invoiceNo}`,
    html: `
      <h3>Invoice ${body.invoiceNo}</h3>
      <p>Name: ${body.customer?.name}</p>
      <p>Total: ₹${body.finalPayable}</p>
    `,
  })

  return NextResponse.json({ sent: true })
}
