import nodemailer from "nodemailer"
import { NextResponse } from "next/server"
import { client } from "@/lib/mongo"
import invoiceTemplate from "@/lib/invoiceTemplate"
import { ObjectId } from "mongodb"

export async function POST(req: Request) {
  try {
    const { invoiceId, customerEmail } = await req.json()
    if (!invoiceId) return NextResponse.json({ error: "Missing invoiceId" }, { status: 400 })

    await client.connect()
    const col = client.db("invoiceDB").collection("invoices")

    const invoice = await col.findOne({ _id: new ObjectId(invoiceId) })
    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 })

    const html = invoiceTemplate(invoice)

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER!,
        pass: process.env.MAIL_PASS!
      }
    })

    await transporter.sendMail({
      from: `R P Gupta Invoice <${process.env.MAIL_USER}>`,
      to: ["rohitgupta91600@gmail.com", customerEmail].filter(Boolean),
      subject: "Invoice",
      html
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("SEND BILL ERROR:", err)
    return NextResponse.json({ error: "Mail failed" }, { status: 500 })
  }
}
