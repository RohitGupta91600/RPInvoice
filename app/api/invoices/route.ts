import fs from "fs"
import path from "path"
import { NextResponse } from "next/server"

const file = path.join(process.cwd(), "data", "invoices.json")

export async function GET() {
  if (!fs.existsSync(file)) {
    return NextResponse.json({ invoices: [], nextInvoiceNo: "000001" })
  }

  const list = JSON.parse(fs.readFileSync(file, "utf8"))

  const nextInvoiceNo = String(
    (Number(list[list.length - 1]?.invoiceNo || "0") + 1)
  ).padStart(6, "0")

  return NextResponse.json({ invoices: list, nextInvoiceNo })
}

export async function POST(req: Request) {
  const body = await req.json()

  let list: any[] = []
  if (fs.existsSync(file)) list = JSON.parse(fs.readFileSync(file, "utf8"))

  const idx = list.findIndex(i => i.invoiceNo === body.invoiceNo)

  if (idx >= 0) {
    if (list[idx].status === "CANCELLED" && body.status !== "CANCELLED") {
      return NextResponse.json({ error: "Invoice cancelled" }, { status: 403 })
    }

    list[idx] = {
      ...list[idx],
      ...body,
      editedAt: new Date().toISOString(),
    }
  } else {
    list.push({
      ...body,
      status: "ACTIVE",
      cancelReason: null,
      cancelledAt: null,
      createdAt: new Date().toISOString(),
      editedAt: null,
    })
  }

  fs.writeFileSync(file, JSON.stringify(list, null, 2))
  return NextResponse.json({ success: true })
}
