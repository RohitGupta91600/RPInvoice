"use client"
import {useRouter} from "next/navigation"
import {useState} from "react"

export default function Login(){
const r=useRouter()
const [u,setU]=useState("")
const [p,setP]=useState("")

const submit=()=>{
if(u==="admin"&&p==="1234"){
document.cookie="logged_in=true; path=/"
r.replace("/")
}
}

return(
<div className="min-h-screen flex items-center justify-center bg-gray-200">
<div className="bg-white p-6 border-2 border-black w-80">
<div className="font-bold text-lg mb-3 text-center">Login</div>
<input value={u} onChange={e=>setU(e.target.value)} placeholder="Username" className="border w-full px-2 py-1 mb-2"/>
<input type="password" value={p} onChange={e=>setP(e.target.value)} placeholder="Password" className="border w-full px-2 py-1 mb-3"/>
<button onClick={submit} className="bg-blue-600 text-white w-full py-1">Login</button>
</div>
</div>
)
}
