import nodemailer from "nodemailer"
import invoiceTemplate from "@/lib/invoiceTemplate"
import { NextResponse } from "next/server"

export async function POST(req:Request){
const data = await req.json()

const html = invoiceTemplate(data)

const t = nodemailer.createTransport({
service:"gmail",
auth:{user:process.env.MAIL_USER,pass:process.env.MAIL_PASS}
})

await t.sendMail({
from:process.env.MAIL_USER,
to:data.to,
subject:`Invoice ${data.invoiceNo}`,
html
})

return NextResponse.json({ok:true})
}
