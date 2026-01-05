import { NextResponse } from "next/server"
import { client } from "@/lib/mongo"

/* ================= GET ================= */
export async function GET() {
  try {
    await client.connect()
    const col = client.db("invoiceDB").collection("invoices")

    const invoices = await col.find({}).sort({ createdAt: 1 }).toArray()

    const PREFIX = "RP"
    const START_NO = 1
    const PAD = 3

    let nextInvoiceNo = `${PREFIX}${String(START_NO).padStart(PAD, "0")}`

    if (invoices.length > 0) {
      const lastInvoiceNo = invoices[invoices.length - 1].invoiceNo
      const lastNumber = Number(String(lastInvoiceNo).replace(PREFIX, ""))

      if (!isNaN(lastNumber)) {
        nextInvoiceNo = `${PREFIX}${String(lastNumber + 1).padStart(PAD, "0")}`
      }
    }

    return NextResponse.json({ invoices, nextInvoiceNo })
  } catch (err) {
    console.error("GET /api/invoices:", err)
    return NextResponse.json({ error: "Failed to load invoices" }, { status: 500 })
  }
}

/* ================= POST ================= */
export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body.invoiceNo) {
      return NextResponse.json({ error: "Invoice number missing" }, { status: 400 })
    }

    await client.connect()
    const col = client.db("invoiceDB").collection("invoices")

    if (body.status === "CANCELLED") {
      await col.updateOne(
        { invoiceNo: body.invoiceNo },
        {
          $set: {
            status: "CANCELLED",
            cancelReason: body.cancelReason || "",
            cancelAt: body.cancelAt ? new Date(body.cancelAt) : new Date(),
            editedAt: new Date(),
          },
        }
      )
      return NextResponse.json({ cancelled: true })
    }

    const purchaseTotal = (body.items || []).reduce((s: number, i: any) => {
      const base = i.weight * i.rate
      return s + base + (base * i.makingPercent) / 100
    }, 0)

    const exchangeTotal = (body.exchangeItems || []).reduce((s: number, e: any) => {
      return s + (Number(e.amount) || 0)
    }, 0)

    const rawFinal = purchaseTotal - exchangeTotal

    let finalPayable =
      rawFinal >= 0
        ? Math.round(rawFinal / 100) * 100
        : -Math.round(Math.abs(rawFinal) / 100) * 100

    if (finalPayable === 0 && rawFinal !== 0) {
      finalPayable = rawFinal
    }

    body.paidAmount = Number(body.paidAmount || 0)

    if (body.paidAmount > finalPayable && finalPayable > 0) {
      return NextResponse.json(
        { error: "Paid amount cannot be more than final payable" },
        { status: 400 }
      )
    }

    const exists = await col.findOne({ invoiceNo: body.invoiceNo })

    if (exists) {
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
            status: "ACTIVE",
            editedAt: new Date(),
          },
        }
      )

      return NextResponse.json({ invoiceId: exists._id.toString() })
    }

    const insert = await col.insertOne({
      invoiceNo: body.invoiceNo,
      customer: body.customer,
      gstEnabled: body.gstEnabled,
      items: body.items,
      exchangeItems: body.exchangeItems,
      paidAmount: body.paidAmount,
      dueDateTime: body.dueDateTime,
      remark: body.remark || "",
      finalPayable,
      status: "ACTIVE",
      createdAt: new Date(),
      editedAt: new Date(),
    })

    return NextResponse.json({ invoiceId: insert.insertedId.toString() })
  } catch (err) {
    console.error("POST /api/invoices:", err)
    return NextResponse.json({ error: "Failed to save invoice" }, { status: 500 })
  }
}
