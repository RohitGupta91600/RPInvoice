import { NextResponse } from "next/server";
import { client } from "@/lib/mongo";

export async function GET() {
  await client.connect();
  const col = client.db("invoiceDB").collection("invoices");

  const invoices = await col
    .find({ status: { $ne: "CANCELLED" } })
    .toArray();

  const dueBook = invoices
    .map((inv: any) => {
      const purchaseTotal = inv.items.reduce((s: number, i: any) => {
        const b = i.weight * i.rate;
        return s + b + (b * i.makingPercent) / 100;
      }, 0);

      const gst = inv.gstEnabled ? purchaseTotal * 0.03 : 0;
      const purchaseFinal = purchaseTotal + gst;

      const exchangeTotal = (inv.exchangeItems || []).reduce(
        (s: number, e: any) =>
          s + e.weight * ((e.rate * (Number(e.purity) || 0)) / 100),
        0
      );

      const finalAmount = purchaseFinal - exchangeTotal;
      const paidAmount = inv.paidAmount || 0;
      const dueAmount = Math.max(finalAmount - paidAmount, 0);

      return {
        invoiceNo: inv.invoiceNo,
        createdAt: inv.createdAt,
        dueDateTime: inv.dueDateTime || "",
        totalAmount: finalAmount,
        paidAmount,
        dueAmount,
        customer: {
          name: inv.customer?.name || "",
          phone: inv.customer?.phone || "",
          address: inv.customer?.address || "",
          email: inv.customer?.email || "",
        },
      };
    })
    .filter((d) => d.dueAmount > 0); // 🔥 ONLY DUES

  return NextResponse.json({ dueBook });
}
