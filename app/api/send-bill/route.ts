import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { client } from "@/lib/mongo";
import invoiceTemplate from "@/lib/invoiceTemplate";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const invoiceId = body.invoiceId;
    const rawEmail = body.customerEmail;

    const customerEmail =
      typeof rawEmail === "string" && rawEmail.includes("@")
        ? rawEmail.trim()
        : null;

    if (!invoiceId) {
      return NextResponse.json(
        { error: "Missing invoiceId" },
        { status: 400 }
      );
    }

    // 🔗 DB
    await client.connect();
    const col = client.db("invoiceDB").collection("invoices");

    const invoice = await col.findOne({ _id: new ObjectId(invoiceId) });
    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    const html = invoiceTemplate(invoice);

    // ✉️ Mail transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS, // Gmail App Password
      },
    });

    // 📌 OWNER MAIL (always)
    transporter
      .sendMail({
        from: `"R P Gupta Invoice" <${process.env.MAIL_USER}>`,
        to: "rohitgupta91600@gmail.com",
        subject: `Invoice ${invoice.invoiceNo}`,
        html,
      })
      .catch(console.error);

    // 📌 CUSTOMER MAIL (only if email exists)
    if (customerEmail) {
      transporter
        .sendMail({
          from: `"R P Gupta Invoice" <${process.env.MAIL_USER}>`,
          to: customerEmail,
          subject: `Invoice ${invoice.invoiceNo}`,
          html,
        })
        .catch(console.error);
    }

    // 🚀 respond immediately (no pending request)
    return NextResponse.json({
      ok: true,
      mailedTo: customerEmail ? "customer + owner" : "owner only",
    });
  } catch (err) {
    console.error("SEND BILL ERROR:", err);
    return NextResponse.json(
      { error: "Failed to send bill" },
      { status: 500 }
    );
  }
}
