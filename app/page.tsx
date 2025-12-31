"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

import CompanyHeader from "./components/CompanyHeader"
import BillHeader from "./components/BillHeader"
import CustomerForm from "./components/CustomerForm"
import PurchaseTable from "./components/PurchaseTable"
import PurchaseTotal from "./components/PurchaseTotal"
import ExchangeTable from "./components/ExchangeTable"
import FinalAmount from "./components/FinalAmount"
import PaymentSection from "./components/PaymentSection"
import BillFooter from "./components/BillFooter"

import { PurchaseItem, ExchangeItem } from "./types"

type Customer = { name: string; phone: string; address: string; email: string }

export default function Page() {
  const router = useRouter()
  const isPrintingRef = useRef(false)

  useEffect(() => {
    if (!document.cookie.includes("logged_in=true")) router.replace("/login")
  }, [])

  const emptyCustomer: Customer = { name: "", phone: "", address: "", email: "" }
  const emptyItem: PurchaseItem = { name: "", metal: "Gold", purityType: "22k", purityValue: "22k", weight: 0, rate: 0, makingPercent: 8 }

  const [invoiceNo, setInvoiceNo] = useState("")
  const [createdAt, setCreatedAt] = useState("")
  const [status, setStatus] = useState<"ACTIVE" | "CANCELLED">("ACTIVE")
  const [cancelReason, setCancelReason] = useState("")
  const [customer, setCustomer] = useState<Customer>(emptyCustomer)
  const [savedInvoices, setSavedInvoices] = useState<any[]>([])
  const [selectedInvoiceIndex, setSelectedInvoiceIndex] = useState<number | "">("")
  const [gstEnabled, setGstEnabled] = useState(true)
  const [items, setItems] = useState<PurchaseItem[]>([emptyItem])
  const [exchangeItems, setExchangeItems] = useState<ExchangeItem[]>([])
  const [paidAmount, setPaidAmount] = useState(0)
  const [dueDateTime, setDueDateTime] = useState("")
  const [remark, setRemark] = useState("")

  const canEdit = selectedInvoiceIndex === "" && status !== "CANCELLED"

  useEffect(() => {
    fetch("/api/invoices").then(r => r.json()).then(d => {
      setSavedInvoices(d.invoices || [])
      setInvoiceNo(d.nextInvoiceNo || "000001")
      setCreatedAt(new Date().toLocaleString())
    })
  }, [])

  const loadOldInvoice = (i: number) => {
    const inv = savedInvoices[i]
    if (!inv) return

    setSelectedInvoiceIndex(i)
    setInvoiceNo(inv.invoiceNo)
    setCreatedAt(new Date(inv.createdAt).toLocaleString())
    setStatus(inv.status || "ACTIVE")
    setCancelReason(inv.cancelReason || "")
    setCustomer(inv.customer || emptyCustomer)
    setGstEnabled(inv.gstEnabled)
    setItems(inv.items || [])
    setExchangeItems(inv.exchangeItems || [])
    setPaidAmount(inv.paidAmount || 0)
    setDueDateTime(inv.dueDateTime || "")
    setRemark(inv.remark || "")
  }

  const updateItem = (i: number, field: keyof PurchaseItem, value: any) => {
    if (!canEdit) return
    setItems(prev =>
      prev.map((item, idx) => {
        if (idx !== i) return item
        if (field === "metal") {
          if (value === "Gold") return { ...item, metal: "Gold", purityType: "22k", purityValue: "22k" }
          return { ...item, metal: "Silver", purityType: "", purityValue: "" }
        }
        if (field === "purityType") return { ...item, purityType: value, purityValue: value === "custom" ? "" : value }
        return { ...item, [field]: value }
      })
    )
  }

  const purchaseTotal = items.reduce((s, i) => {
    const base = i.weight * i.rate
    return s + base + (base * i.makingPercent) / 100
  }, 0)

  const gstAmount = gstEnabled ? purchaseTotal * 0.03 : 0
  const purchaseFinal = purchaseTotal + gstAmount

  const exchangeTotal = exchangeItems.reduce((s, e) => {
    const purity = Number(e.purity) || 0
    return s + e.weight * ((e.rate * purity) / 100)
  }, 0)

  const finalPayable = purchaseFinal - exchangeTotal
  const dueAmount = Math.max(finalPayable - paidAmount, 0)

  const saveInvoice = async () => {
    if (!canEdit) return
    await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceNo, customer, gstEnabled, items, exchangeItems, paidAmount, dueDateTime, remark, status, cancelReason })
    })
  }

  const handlePrint = async () => {
    if (isPrintingRef.current) return
    isPrintingRef.current = true
    await saveInvoice()
    window.print()
    setTimeout(() => (isPrintingRef.current = false), 800)
  }

  const cancelInvoice = async () => {
    const reason = prompt("Cancel reason?")
    if (!reason) return
    await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceNo, status: "CANCELLED", cancelReason: reason })
    })
    setStatus("CANCELLED")
    setCancelReason(reason)
  }

  const createNewBill = () => location.reload()

  return (
    <div className="p-4">

      <div className="print-meta print:block hidden">
        <span>Invoice No: {invoiceNo}</span>
        <span>Date: {createdAt}</span>
      </div>

      {status === "CANCELLED" && (
        <div className="cancelled print:block hidden">CANCELLED</div>
      )}

      <div className="print-page border-2 border-black p-3">

        <select className="border p-1 mb-2 print:hidden" onChange={e => loadOldInvoice(Number(e.target.value))}>
          <option value="">-- Select Old Invoice --</option>
          {savedInvoices.map((i, idx) => <option key={idx} value={idx}>{i.invoiceNo}</option>)}
        </select>

        {selectedInvoiceIndex !== "" && status !== "CANCELLED" && (
          <button onClick={cancelInvoice} className="bg-red-700 text-white px-4 py-1 print:hidden ml-2">
            Cancel Invoice
          </button>
        )}

        <CompanyHeader gstEnabled={gstEnabled} />
        <BillHeader invoiceNo={invoiceNo} createdAt={createdAt} gstEnabled={gstEnabled} setGstEnabled={setGstEnabled} />
        <CustomerForm customer={customer} setCustomer={setCustomer} isReadOnly={!canEdit} />
        <PurchaseTable items={items} addItem={() => canEdit && setItems([...items, emptyItem])} updateItem={updateItem} deleteItem={i => canEdit && setItems(items.filter((_, idx) => idx !== i))} />
        <PurchaseTotal purchaseTotal={purchaseTotal} gstEnabled={gstEnabled} gstAmount={gstAmount} purchaseFinal={purchaseFinal} />
        <ExchangeTable exchangeItems={exchangeItems} addExchange={() => canEdit && setExchangeItems([...exchangeItems, { description: "", metal: "Gold", purity: "", weight: 0, rate: 0 }])} updateExchange={(i, f, v) => canEdit && setExchangeItems(prev => prev.map((e, idx) => idx === i ? { ...e, [f]: v } : e))} deleteExchange={i => canEdit && setExchangeItems(exchangeItems.filter((_, idx) => idx !== i))} />
        <FinalAmount finalPayable={finalPayable} />
        <PaymentSection paidAmount={paidAmount} setPaidAmount={setPaidAmount} dueAmount={dueAmount} dueDateTime={dueDateTime} setDueDateTime={setDueDateTime} remark={remark} setRemark={setRemark} isReadOnly={!canEdit} />
        <BillFooter />

        <div className="flex gap-4 mt-4 print:hidden">
          {canEdit && <button onClick={handlePrint} className="bg-blue-600 text-white px-6 py-1">Print Bill</button>}
          <button onClick={createNewBill} className="bg-gray-600 text-white px-6 py-1">Create New Bill</button>
        </div>

      </div>
    </div>
  )
}
