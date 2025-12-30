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

  const existing = await col.findOne({ invoiceNo: body.invoiceNo })

  if (existing && existing.status === "CANCELLED" && body.status !== "CANCELLED") {
    return NextResponse.json({ error: "Cancelled invoice cannot be modified" }, { status: 403 })
  }

  await col.updateOne(
    { invoiceNo: body.invoiceNo },
    {
      $set: { ...body, editedAt: new Date() },
      $setOnInsert: { createdAt: new Date(), status: "ACTIVE" }
    },
    { upsert: true }
  )

  return NextResponse.json({ success: true })
}
