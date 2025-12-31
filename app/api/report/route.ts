import nodemailer from "nodemailer"
import { NextResponse } from "next/server"
import { client } from "@/lib/mongo"

export async function POST(req: Request) {
  try {
    const { type } = await req.json()

    await client.connect()
    const col = client.db("invoiceDB").collection("invoices")

    const now = new Date()
    const data = await col.find({}).toArray()

    const list = data.filter(i => {
      const d = new Date(i.createdAt)
      if (type === "daily") return d.toDateString() === now.toDateString()
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })

    const total = list.reduce((s, i) => s + (i.finalPayable || 0), 0)

    const html = `<h3>${type.toUpperCase()} REPORT</h3><p>Total Bills: ${list.length}</p><p>Total Sale: ₹${total}</p>`

    const t = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.MAIL_USER!, pass: process.env.MAIL_PASS! }
    })

    await t.sendMail({
      from: `R P Gupta Invoice <${process.env.MAIL_USER!}>`,
      to: process.env.MAIL_USER!,
      subject: `${type.toUpperCase()} SALE REPORT`,
      html
    })

    return NextResponse.json({ sent: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
