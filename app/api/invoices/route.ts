import { NextResponse } from "next/server";
import { client } from "@/lib/mongo";

/* ================= GET ================= */
export async function GET() {
  try {
    await client.connect();

    const col = client.db("invoiceDB").collection("invoices");

    const invoices = await col
      .find({})
      .sort({ invoiceNo: 1 })
      .toArray();

    const lastNo =
      invoices.length > 0 ? invoices[invoices.length - 1].invoiceNo : "000000";

    const nextInvoiceNo = String(Number(lastNo) + 1).padStart(6, "0");

    return NextResponse.json({
      invoices,
      nextInvoiceNo,
    });
  } catch (err) {
    console.error("GET /api/invoices error:", err);
    return NextResponse.json(
      { error: "Failed to load invoices" },
      { status: 500 }
    );
  }
}

/* ================= POST ================= */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.invoiceNo) {
      return NextResponse.json(
        { error: "Invoice number missing" },
        { status: 400 }
      );
    }

    await client.connect();
    const col = client.db("invoiceDB").collection("invoices");

    const existing = await col.findOne({ invoiceNo: body.invoiceNo });

    /* ---------- CANCEL ---------- */
    if (body.status === "CANCELLED") {
      await col.updateOne(
        { invoiceNo: body.invoiceNo },
        {
          $set: {
            status: "CANCELLED",
            cancelReason: body.cancelReason || "",
            cancelledAt: new Date(),
          },
        }
      );

      return NextResponse.json({ cancelled: true });
    }

    /* ---------- BLOCK EDIT CANCELLED ---------- */
    if (existing && existing.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Cancelled invoice cannot be edited" },
        { status: 403 }
      );
    }

    /* ---------- CALCULATIONS ---------- */
    const purchaseTotal = (body.items || []).reduce((s: number, i: any) => {
      const base = i.weight * i.rate;
      return s + base + (base * i.makingPercent) / 100;
    }, 0);

    const exchangeTotal = (body.exchangeItems || []).reduce(
      (s: number, e: any) => {
        const purity = Number(e.purity) || 0;
        return s + e.weight * ((e.rate * purity) / 100);
      },
      0
    );

    const finalPayable = purchaseTotal - exchangeTotal;

    /* ---------- UPSERT SAVE ---------- */
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
        $setOnInsert: {
          createdAt: new Date(),
          cancelReason: null,
          cancelledAt: null,
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ saved: true });
  } catch (err) {
    console.error("POST /api/invoices error:", err);
    return NextResponse.json(
      { error: "Failed to save invoice" },
      { status: 500 }
    );
  }
}
