"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import CompanyHeader from "./components/CompanyHeader";
import BillHeader from "./components/BillHeader";
import CustomerForm from "./components/CustomerForm";
import PurchaseTable from "./components/PurchaseTable";
import PurchaseTotal from "./components/PurchaseTotal";
import ExchangeTable from "./components/ExchangeTable";
import FinalAmount from "./components/FinalAmount";
import PaymentSection from "./components/PaymentSection";
import BillFooter from "./components/BillFooter";

import { PurchaseItem, ExchangeItem } from "./types";

type Customer = {
  name: string;
  phone: string;
  address: string;
  email: string;
};

export default function Page() {
  const router = useRouter();
  const isPrintingRef = useRef(false);

  // 🔐 login check
  useEffect(() => {
    if (!document.cookie.includes("logged_in=true")) {
      router.replace("/login");
    }
  }, []);

  const emptyCustomer: Customer = {
    name: "",
    phone: "",
    address: "",
    email: "",
  };

  const emptyItem: PurchaseItem = {
    name: "",
    metal: "Gold",
    purityType: "22k",
    purityValue: "22k",
    weight: 0,
    rate: 0,
    makingPercent: 8,
  };

  const [invoiceNo, setInvoiceNo] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "CANCELLED">("ACTIVE");
  const [cancelReason, setCancelReason] = useState("");
  const [cancelAt, setCancelAt] = useState("");
  const [customer, setCustomer] = useState<Customer>(emptyCustomer);

  const [savedInvoices, setSavedInvoices] = useState<any[]>([]);
  const [selectedInvoiceIndex, setSelectedInvoiceIndex] = useState<
    number | null
  >(null);

  const [gstEnabled, setGstEnabled] = useState(true);
  const [items, setItems] = useState<PurchaseItem[]>([emptyItem]);
  const [exchangeItems, setExchangeItems] = useState<ExchangeItem[]>([]);
  const [paidAmount, setPaidAmount] = useState(0);
  const [dueDateTime, setDueDateTime] = useState("");
  const [remark, setRemark] = useState("");

  const canEdit = selectedInvoiceIndex === null && status !== "CANCELLED";

  // 📥 load invoices
  useEffect(() => {
    fetch("/api/invoices")
      .then((r) => r.json())
      .then((d) => {
        setSavedInvoices(d.invoices || []);
        setInvoiceNo(d.nextInvoiceNo || "000001");
        setCreatedAt(new Date().toLocaleString());
      });
  }, []);

  // 📄 load old invoice
  const loadOldInvoice = (i: number) => {
    const inv = savedInvoices[i];
    if (!inv) return;

    setSelectedInvoiceIndex(i);
    setInvoiceNo(inv.invoiceNo);
    setCreatedAt(new Date(inv.createdAt).toLocaleString());
    setStatus(inv.status || "ACTIVE");
    setCancelReason(inv.cancelReason || "");
    setCancelAt(inv.cancelAt || "");
    setCustomer(inv.customer || emptyCustomer);
    setGstEnabled(inv.gstEnabled);
    setItems(inv.items || []);
    setExchangeItems(inv.exchangeItems || []);
    setPaidAmount(inv.paidAmount || 0);
    setDueDateTime(inv.dueDateTime || "");
    setRemark(inv.remark || "");
  };

  // ✏️ update purchase item
  const updateItem = (i: number, field: keyof PurchaseItem, value: any) => {
    if (!canEdit) return;

    setItems((p) =>
      p.map((it, idx) =>
        idx !== i
          ? it
          : field === "metal"
          ? value === "Gold"
            ? { ...it, metal: "Gold", purityType: "22k", purityValue: "22k" }
            : { ...it, metal: "Silver", purityType: "", purityValue: "" }
          : field === "purityType"
          ? {
              ...it,
              purityType: value,
              purityValue: value === "custom" ? "" : value,
            }
          : { ...it, [field]: value }
      )
    );
  };

  // 🧮 calculations
  const purchaseTotal = items.reduce((s, i) => {
    const b = i.weight * i.rate;
    return s + b + (b * i.makingPercent) / 100;
  }, 0);

  const gstAmount = gstEnabled ? purchaseTotal * 0.03 : 0;
  const purchaseFinal = purchaseTotal + gstAmount;

  const exchangeTotal = exchangeItems.reduce(
    (s, e) => s + (Number(e.amount) || 0),
    0
  );

  const rawFinal = purchaseFinal - exchangeTotal;

  const finalPayable =
    rawFinal >= 0
      ? Math.round(rawFinal / 100) * 100
      : -Math.round(Math.abs(rawFinal) / 100) * 100;

const dueAmount = finalPayable > 0 ? Math.max(finalPayable - paidAmount, 0) : 0

  // 🖨️ SAVE → MAIL → PRINT (FINAL FIX)
  const handlePrint = async () => {
    alert("Invoice is ready. Please click OK to proceed to printing.");

    if (isPrintingRef.current) return;
    isPrintingRef.current = true;

    try {
      // 1️⃣ save invoice
      const saveRes = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceNo,
          customer,
          gstEnabled,
          items,
          exchangeItems,
          paidAmount,
          remark,
          dueDateTime,
          status,
          cancelReason,
          cancelAt,
        }),
      });

      const saveData = await saveRes.json();
      console.log("SAVE DATA:", saveData);

      // 2️⃣ send mail (no early return anymore)
      if (saveData.invoiceId) {
        console.log("CALLING SEND BILL API");

        const mailRes = await fetch("/api/send-bill", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            invoiceId: saveData.invoiceId,
            customerEmail: customer.email || null,
          }),
        });

        const mailData = await mailRes.json();
        console.log("MAIL RESPONSE:", mailRes.status, mailData);
      }

      // 3️⃣ print
      window.print();
    } catch (err) {
      console.error("PRINT ERROR:", err);
      alert("Invoice saved but mail failed");
    } finally {
      setTimeout(() => (isPrintingRef.current = false), 1000);
    }
  };

  // ❌ cancel invoice
  const cancelInvoice = async () => {
    const reason = prompt("Cancel reason?");
    if (!reason) return;

    const now = new Date().toISOString();

    await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        invoiceNo,
        status: "CANCELLED",
        cancelReason: reason,
        cancelAt: now,
      }),
    });

    setStatus("CANCELLED");
    setCancelReason(reason);
    setCancelAt(now);
  };

  return (
    <div className="p-4">
      <div className="print-page border-2 border-black p-3 demonstrated">
        <div className="print-watermark-layer">
          <img src="/assets/watermark.png" />
        </div>
        {status === "CANCELLED" && (
          <div className="cancel-watermark">
            <div className="cancel-big">CANCELLED</div>
            <div className="cancel-small">
              Cancelled On:{" "}
              {cancelAt ? new Date(cancelAt).toLocaleString() : ""}
              <br />
              Reason: {cancelReason}
            </div>
          </div>
        )}

        <div className="print-meta flex gap-3">
          <span>Invoice No: {invoiceNo}</span>
          <span>{createdAt}</span>
        </div>

        <select
          className="border p-1 mb-2 print:hidden"
          onChange={(e) =>
            e.target.value === ""
              ? setSelectedInvoiceIndex(null)
              : loadOldInvoice(Number(e.target.value))
          }
        >
          <option value="">-- Select Old Invoice --</option>
          {savedInvoices.map((i, idx) => (
            <option key={idx} value={idx}>
              {i.invoiceNo}
            </option>
          ))}
        </select>

        {selectedInvoiceIndex !== null && status !== "CANCELLED" && (
          <button
            onClick={cancelInvoice}
            className="bg-red-700 text-white px-4 py-1 print:hidden ml-2"
          >
            Cancel Invoice
          </button>
        )}

        <CompanyHeader gstEnabled={gstEnabled} />
        <BillHeader
          invoiceNo={invoiceNo}
          createdAt={createdAt}
          gstEnabled={gstEnabled}
          setGstEnabled={setGstEnabled}
        />
        <CustomerForm
          customer={customer}
          setCustomer={setCustomer}
          isReadOnly={!canEdit}
        />
        <PurchaseTable
          items={items}
          addItem={() => canEdit && setItems([...items, emptyItem])}
          updateItem={updateItem}
          deleteItem={(i) =>
            canEdit && setItems(items.filter((_, idx) => idx !== i))
          }
        />
        <PurchaseTotal
          purchaseTotal={purchaseTotal}
          gstEnabled={gstEnabled}
          gstAmount={gstAmount}
          purchaseFinal={purchaseFinal}
        />
        <ExchangeTable
          exchangeItems={exchangeItems}
          addExchange={() =>
            canEdit &&
            setExchangeItems([
              ...exchangeItems,
              {
                description: "",
                metal: "Gold",
                weight: 0,
                rate: 0,
                amount: 0,
              },
            ])
          }
          updateExchange={(i, f, v) =>
            canEdit &&
            setExchangeItems((p) =>
              p.map((e, idx) => (idx === i ? { ...e, [f]: v } : e))
            )
          }
          deleteExchange={(i) =>
            canEdit &&
            setExchangeItems(exchangeItems.filter((_, idx) => idx !== i))
          }
        />

        <FinalAmount finalPayable={finalPayable} />
        <PaymentSection
          paidAmount={paidAmount}
          setPaidAmount={setPaidAmount}
          dueAmount={dueAmount}
          dueDateTime={dueDateTime}
          setDueDateTime={setDueDateTime}
          remark={remark}
          setRemark={setRemark}
          isReadOnly={!canEdit}
        />
        <BillFooter />

        <div className="flex justify-center gap-6 mt-6 print:hidden">
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-2 bg-gray-800 text-white rounded-md shadow"
          >
            New Invoice
          </button>
          <button
            onClick={handlePrint}
            className="px-10 py-2 bg-blue-700 text-white rounded-md shadow"
          >
            Print & Email
          </button>
          <button
            onClick={() => router.push("/due-book")}
            className="px-8 py-2 bg-green-700 text-white rounded-md shadow"
          >
            View Due Book
          </button>
        </div>
      </div>
    </div>
  );
}
