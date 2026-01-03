import { NextResponse } from "next/server";
import { client } from "@/lib/mongo";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { invoiceNo, amount } = body;

    // 1️⃣ VALIDATION
    if (!invoiceNo || amount === undefined) {
      return NextResponse.json(
        { error: "invoiceNo and amount are required" },
        { status: 400 }
      );
    }

    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json(
        { error: "Invalid payment amount" },
        { status: 400 }
      );
    }

    // 2️⃣ DB CONNECT
    await client.connect();

    // ✅ IMPORTANT: keep collection loosely typed
    const col = client.db("invoiceDB").collection("invoices");

    // 3️⃣ ADD LEDGER ENTRY (NOTE ONLY)
    const result = await col.updateOne(
      { invoiceNo },
      {
        $push: {
          payments: {
            _id: new ObjectId(),   // required for delete
            amount: Number(amount),
            createdAt: new Date(),
          },
        },
      } as any // 🔥 FIX FOR TYPESCRIPT
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    // 4️⃣ SUCCESS
    return NextResponse.json({
      success: true,
      message: "Payment added successfully",
    });
  } catch (err) {
    console.error("❌ ADD PAYMENT ERROR:", err);
    return NextResponse.json(
      { error: "Failed to add payment" },
      { status: 500 }
    );
  }
}
