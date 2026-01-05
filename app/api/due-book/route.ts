import { NextResponse } from "next/server";
import { client } from "@/lib/mongo";

export async function GET() {
  try {
    await client.connect();
    const col = client.db("invoiceDB").collection("invoices");

    const invoices = await col
      .find({ status: { $ne: "CANCELLED" } })
      .sort({ createdAt: 1 })
      .toArray();

    const dueBook = invoices
      .map((inv: any) => {
        // -----------------------------
        // 1️⃣ PURCHASE TOTAL
        // -----------------------------
        const purchaseTotal = (inv.items || []).reduce(
          (sum: number, item: any) => {
            const base = Number(item.weight || 0) * Number(item.rate || 0);
            const making =
              (base * Number(item.makingPercent || 0)) / 100;
            return sum + base + making;
          },
          0
        );

        // -----------------------------
        // 2️⃣ GST
        // -----------------------------
        const gst = inv.gstEnabled ? purchaseTotal * 0.03 : 0;

        // -----------------------------
        // 3️⃣ FINAL PURCHASE
        // -----------------------------
        const purchaseFinal = purchaseTotal + gst;

        // -----------------------------
        // 4️⃣ EXCHANGE TOTAL
        // -----------------------------
        const exchangeTotal = (inv.exchangeItems || []).reduce(
          (sum: number, ex: any) => {
            return sum + (Number(ex.amount) || 0);
          },
          0
        );

        // -----------------------------
        // 5️⃣ RAW ACTUAL TOTAL
        // -----------------------------
        const rawFinal = purchaseFinal - exchangeTotal;

        // -----------------------------
        // 6️⃣ ROUND FIGURE FINAL PAYABLE
        // -----------------------------
        const totalAmount =
          rawFinal >= 0
            ? Math.round(rawFinal / 100) * 100
            : -Math.round(Math.abs(rawFinal) / 100) * 100;

        // -----------------------------
        // 7️⃣ SAFE PAID & DUE
        // -----------------------------
        const safePaid = Math.min(Number(inv.paidAmount || 0), Math.max(totalAmount, 0));

        const dueAmount =
          totalAmount > 0
            ? Math.max(totalAmount - safePaid, 0)
            : 0;

        return {
          invoiceNo: inv.invoiceNo,
          createdAt: inv.createdAt,
          dueDateTime: inv.dueDateTime || "",

          totalAmount,
          paidAmount: safePaid,
          dueAmount,

          payments: Array.isArray(inv.payments)
            ? inv.payments
            : [],

          customer: {
            name: inv.customer?.name || "",
            phone: inv.customer?.phone || "",
            address: inv.customer?.address || "",
            email: inv.customer?.email || "",
          },
        };
      })
      .filter((d) => Number(d.dueAmount) > 0);

    return NextResponse.json({ dueBook });
  } catch (error) {
    console.error("❌ DUE BOOK API ERROR:", error);
    return NextResponse.json(
      { error: "Failed to load due book" },
      { status: 500 }
    );
  }
}
