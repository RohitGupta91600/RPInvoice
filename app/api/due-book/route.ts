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
            const rate = Number(ex.rate || 0);
            const purity = Number(ex.purity || 0);
            const weight = Number(ex.weight || 0);
            return sum + weight * ((rate * purity) / 100);
          },
          0
        );

        // -----------------------------
        // 5️⃣ TOTAL AMOUNT
        // -----------------------------
        const totalAmount = Math.max(
          purchaseFinal - exchangeTotal,
          0
        );

        // -----------------------------
        // 6️⃣ PAID & DUE (FIXED)
        // -----------------------------
        const paidAmount = Number(inv.paidAmount || 0);

        // 🔒 IMPORTANT: DUE IS FIXED VALUE
        const dueAmount = Math.max(totalAmount - paidAmount, 0);

        return {
          invoiceNo: inv.invoiceNo,
          createdAt: inv.createdAt,
          dueDateTime: inv.dueDateTime || "",

          totalAmount,
          paidAmount,
          dueAmount,

          // 🧾 Ledger notes only (NO effect on due)
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
      // 🔥 ONLY SHOW PENDING DUES
      .filter((d) => d.dueAmount > 0);

    return NextResponse.json({ dueBook });
  } catch (error) {
    console.error("❌ DUE BOOK API ERROR:", error);
    return NextResponse.json(
      { error: "Failed to load due book" },
      { status: 500 }
    );
  }
}
