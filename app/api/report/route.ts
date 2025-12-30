import fs from "fs"
import path from "path"
import nodemailer from "nodemailer"
import {NextResponse} from "next/server"

const file=path.join(process.cwd(),"data","invoices.json")

export async function POST(req:Request){
const {type}:{type:"daily"|"monthly"}=await req.json()
if(!fs.existsSync(file))return NextResponse.json({sent:false})

const list=JSON.parse(fs.readFileSync(file,"utf8"))
const now=new Date()

const data=list.filter((i:any)=>{
const d=new Date(i.createdAt)
if(type==="daily")return d.toDateString()===now.toDateString()
return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear()
})

const total=data.reduce((s:any,i:any)=>s+(i.finalPayable||0),0)

const html=`<h3>${type.toUpperCase()} REPORT</h3><p>Total Bills: ${data.length}</p><p>Total Sale: ₹${total}</p>`

const t=nodemailer.createTransport({
service:"gmail",
auth:{user:process.env.MAIL_USER!,pass:process.env.MAIL_PASS!}
})

await t.sendMail({
from:"R P Gupta Jewellers <rpguptainvoice@gmail.com>",
replyTo:"rpguptainvoice@gmail.com",
to:"rohitgupta91600@gmail.com",
subject:`${type.toUpperCase()} SALE REPORT`,
html
})

return NextResponse.json({sent:true})
}
