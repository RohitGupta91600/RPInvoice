import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import invoiceTemplate from "@/lib/invoiceTemplate";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const companyEmail = process.env.COMPANY_EMAIL!;
    const companyPass = process.env.COMPANY_EMAIL_PASS!;

    const recipients = data.customer?.email
      ? [companyEmail, data.customer.email]
      : [companyEmail];

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: companyEmail,
        pass: companyPass,
      },
    });

    await transporter.sendMail({
      from: `"RP Invoice" <${companyEmail}>`,
      to: recipients,
      subject: `Invoice #${data.invoiceNo}`,
      html: invoiceTemplate(data), // 🔥 SAME PRINT TEMPLATE
    });

    return NextResponse.json({ sent: true });
  } catch (err: any) {
    console.error("MAIL ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
