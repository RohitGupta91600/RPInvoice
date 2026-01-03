import { NextResponse } from "next/server";
import { client } from "@/lib/mongo";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    const { invoiceNo, paymentId } = await req.json();

    // ✅ Validation
    if (!invoiceNo || !paymentId) {
      return NextResponse.json(
        { error: "Missing invoiceNo or paymentId" },
        { status: 400 }
      );
    }

    await client.connect();
    const col = client.db("invoiceDB").collection("invoices");

    // ✅ DELETE PAYMENT (ledger only)
    const result = await col.updateOne(
      { invoiceNo },
      {
        $pull: {
          payments: { _id: new ObjectId(paymentId) },
        },
      } as any // 🔥 FIX: tell TS to trust Mongo
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ DELETE PAYMENT ERROR:", err);
    return NextResponse.json(
      { error: "Failed to delete payment" },
      { status: 500 }
    );
  }
}
