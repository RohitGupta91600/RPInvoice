import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

/* ======================================================
   GET : ALL INVOICES + NEXT INVOICE NUMBER
====================================================== */
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("invoiceDB");
    const collection = db.collection("invoices");

    // 🔹 Fetch all invoices sorted numerically
    const invoices = await collection
      .find({})
      .sort({ invoiceNo: 1 })
      .toArray();

    // 🔹 Calculate next invoice number
    let nextInvoiceNo = "000001";
    if (invoices.length > 0) {
      const lastInvoiceNo = invoices[invoices.length - 1].invoiceNo;
      nextInvoiceNo = String(Number(lastInvoiceNo) + 1).padStart(6, "0");
    }

    return NextResponse.json({
      invoices,
      nextInvoiceNo,
    });
  } catch (error) {
    console.error("GET /api/invoices error:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

/* ======================================================
   POST : CREATE / UPDATE / CANCEL INVOICE
====================================================== */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.invoiceNo) {
      return NextResponse.json(
        { error: "Invoice number is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("invoiceDB");
    const collection = db.collection("invoices");

    const existingInvoice = await collection.findOne({
      invoiceNo: body.invoiceNo,
    });

    /* ======================================================
       ❌ BLOCK EDIT IF ALREADY CANCELLED
    ====================================================== */
    if (
      existingInvoice &&
      existingInvoice.status === "CANCELLED" &&
      body.status !== "CANCELLED"
    ) {
      return NextResponse.json(
        { error: "Cancelled invoice cannot be modified" },
        { status: 403 }
      );
    }

    /* ======================================================
       UPDATE EXISTING INVOICE
    ====================================================== */
    if (existingInvoice) {
      await collection.updateOne(
        { invoiceNo: body.invoiceNo },
        {
          $set: {
            customer: body.customer,
            gstEnabled: body.gstEnabled,
            items: body.items,
            exchangeItems: body.exchangeItems,
            paidAmount: body.paidAmount,
            dueDateTime: body.dueDateTime,
            remark: body.remark ?? "",

            // ✅ STATUS (ACTIVE / CANCELLED)
            status: body.status ?? existingInvoice.status ?? "ACTIVE",

            cancelReason:
              body.status === "CANCELLED"
                ? body.cancelReason ?? existingInvoice.cancelReason ?? ""
                : null,

            cancelledAt:
              body.status === "CANCELLED"
                ? existingInvoice.cancelledAt ?? new Date()
                : null,

            // ❗ createdAt NEVER changes
            createdAt: existingInvoice.createdAt,

            // ✅ edited date
            editedAt: new Date(),
          },
        }
      );
    }

    /* ======================================================
       CREATE NEW INVOICE
    ====================================================== */
    else {
      await collection.insertOne({
        invoiceNo: body.invoiceNo,
        customer: body.customer,
        gstEnabled: body.gstEnabled,
        items: body.items,
        exchangeItems: body.exchangeItems,
        paidAmount: body.paidAmount,
        dueDateTime: body.dueDateTime,
        remark: body.remark ?? "",

        // ✅ DEFAULT STATUS
        status: body.status ?? "ACTIVE",
        cancelReason: null,
        cancelledAt: null,

        createdAt: new Date(),
        editedAt: null,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/invoices error:", error);
    return NextResponse.json(
      { error: "Failed to save invoice" },
      { status: 500 }
    );
  }
}
