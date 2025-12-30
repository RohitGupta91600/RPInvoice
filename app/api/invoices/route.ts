import { NextResponse } from "next/server"
import { client } from "@/lib/mongo"

export async function GET() {
  await client.connect()
  const col = client.db("invoiceDB").collection("invoices")
  const invoices = await col.find({}).sort({ invoiceNo: 1 }).toArray()
  const nextInvoiceNo = String(
    (Number(invoices[invoices.length - 1]?.invoiceNo || 0) + 1)
  ).padStart(6, "0")
  return NextResponse.json({ invoices, nextInvoiceNo })
}

export async function POST(req: Request) {
  const body = await req.json()
  await client.connect()
  const col = client.db("invoiceDB").collection("invoices")

  const finalPayable =
    (body.items || []).reduce((s: number, i: any) => {
      const base = i.weight * i.rate
      return s + base + (base * i.makingPercent) / 100
    }, 0) - (body.exchangeItems || []).reduce((s: number, e: any) => {
      const purity = Number(e.purity) || 0
      return s + e.weight * ((e.rate * purity) / 100)
    }, 0)

  const existing = await col.findOne({ invoiceNo: body.invoiceNo })

  if (existing && existing.status === "CANCELLED") {
    return NextResponse.json({ error: "Invoice cancelled" }, { status: 403 })
  }

  await col.updateOne(
    { invoiceNo: body.invoiceNo },
    {
      $set: {
        customer: body.customer,
        gstEnabled: body.gstEnabled,
        items: body.items,
        exchangeItems: body.exchangeItems,
        paidAmount: body.paidAmount,
        dueDateTime: body.dueDateTime,
        remark: body.remark || "",
        finalPayable,
        status: body.status || "ACTIVE",
        cancelReason: body.cancelReason || null,
        editedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() }
    },
    { upsert: true }
  )

  return NextResponse.json({ success: true })
}
