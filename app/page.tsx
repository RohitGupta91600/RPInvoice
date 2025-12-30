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

/* ================= TYPES ================= */
type Customer = {
  name: string;
  phone: string;
  address: string;
  email: string;
};

export default function Page() {
  const router = useRouter();
  const isPrintingRef = useRef(false);

  /* ================= AUTH ================= */
  useEffect(() => {
    if (!document.cookie.includes("logged_in=true")) {
      router.replace("/login");
    }
  }, [router]);

  /* ================= CONSTANTS ================= */
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

  /* ================= META ================= */
  const [invoiceNo, setInvoiceNo] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [editedAt, setEditedAt] = useState("");

  /* ================= STATUS ================= */
  const [status, setStatus] = useState<"ACTIVE" | "CANCELLED">("ACTIVE");
  const [cancelReason, setCancelReason] = useState("");

  /* ================= CUSTOMER ================= */
  const [customer, setCustomer] = useState<Customer>(emptyCustomer);

  /* ================= INVOICES ================= */
  const [savedInvoices, setSavedInvoices] = useState<any[]>([]);
  const [selectedInvoiceIndex, setSelectedInvoiceIndex] = useState<number | "">(
    ""
  );

  const [isReadOnly, setIsReadOnly] = useState(false);
  const canEdit = !isReadOnly && status !== "CANCELLED";

  /* ================= GST ================= */
  const [gstEnabled, setGstEnabled] = useState(true);

  /* ================= ITEMS ================= */
  const [items, setItems] = useState<PurchaseItem[]>([emptyItem]);
  const [exchangeItems, setExchangeItems] = useState<ExchangeItem[]>([]);
  const [paidAmount, setPaidAmount] = useState(0);
  const [dueDateTime, setDueDateTime] = useState("");
  const [remark, setRemark] = useState("");

  /* ================= LOAD INVOICES ================= */
  useEffect(() => {
    const loadInvoices = async () => {
      const res = await fetch("/api/invoices");
      const data = await res.json();

      setSavedInvoices(Array.isArray(data.invoices) ? data.invoices : []);
      setInvoiceNo(data.nextInvoiceNo || "000001");
      setCreatedAt(new Date().toLocaleString());

      setStatus("ACTIVE");
      setCancelReason("");
      setIsReadOnly(false);
    };

    loadInvoices();
  }, []);

  /* ================= LOAD OLD INVOICE ================= */
  const loadOldInvoice = (index: number) => {
    const inv = savedInvoices[index];
    if (!inv) return;

    setSelectedInvoiceIndex(index);
    setIsReadOnly(true);

    setInvoiceNo(inv.invoiceNo);
    setCreatedAt(new Date(inv.createdAt).toLocaleString());
    setEditedAt(inv.editedAt ? new Date(inv.editedAt).toLocaleString() : "");

    setStatus(inv.status || "ACTIVE");
    setCancelReason(inv.cancelReason || "");

    setCustomer({
      name: inv.customer?.name || "",
      phone: inv.customer?.phone || "",
      address: inv.customer?.address || "",
      email: inv.customer?.email || "",
    });

    setGstEnabled(inv.gstEnabled);
    setItems(inv.items || []);
    setExchangeItems(inv.exchangeItems || []);
    setPaidAmount(inv.paidAmount || 0);
    setDueDateTime(inv.dueDateTime || "");
    setRemark(inv.remark || "");
  };

  /* ================= ENABLE EDIT ================= */
  const enableEditOld = () => {
    if (status === "CANCELLED") return;
    setIsReadOnly(false);
    setEditedAt(new Date().toLocaleString());
  };

  /* ================= ITEM HELPERS ================= */
  const addItem = () => canEdit && setItems([...items, emptyItem]);

  const deleteItem = (i: number) =>
    canEdit && setItems(items.filter((_, idx) => idx !== i));

  const updateItem = (i: number, field: keyof PurchaseItem, value: any) => {
    if (!canEdit) return;
    const copy = [...items];
    copy[i] = { ...copy[i], [field]: value };
    setItems(copy);
  };

  /* ================= EXCHANGE HELPERS ================= */
  const addExchange = () =>
    canEdit &&
    setExchangeItems([
      ...exchangeItems,
      { description: "", metal: "Gold", purity: "", weight: 0, rate: 0 },
    ]);

  const deleteExchange = (i: number) =>
    canEdit && setExchangeItems(exchangeItems.filter((_, idx) => idx !== i));

  const updateExchange = (
    i: number,
    field: keyof ExchangeItem,
    value: string | number
  ) => {
    if (!canEdit) return;
    const copy = [...exchangeItems];
    copy[i] = { ...copy[i], [field]: value };
    setExchangeItems(copy);
  };

  /* ================= TOTALS ================= */
  const purchaseTotal = items.reduce((sum, i) => {
    const base = i.weight * i.rate;
    return sum + base + (base * i.makingPercent) / 100;
  }, 0);

  const gstAmount = gstEnabled ? purchaseTotal * 0.03 : 0;
  const purchaseFinal = purchaseTotal + gstAmount;

  const exchangeTotal = exchangeItems.reduce((sum, e) => {
    const purity = Number(e.purity) || 0;
    return sum + e.weight * ((e.rate * purity) / 100);
  }, 0);

  const finalPayable = purchaseFinal - exchangeTotal;
  const dueAmount = Math.max(finalPayable - paidAmount, 0);

  /* ================= SAVE ================= */
  const saveInvoice = async () => {
    await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        invoiceNo,
        customer,
        gstEnabled,
        items,
        exchangeItems,
        paidAmount,
        dueDateTime,
        remark,
        status,
        cancelReason,
      }),
    });
  };

  /* ================= PRINT ================= */
  const handlePrint = async () => {
    if (isPrintingRef.current) return;
    isPrintingRef.current = true;

    await saveInvoice();

    await fetch("/api/send-bill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: customer.email || "rpguptainvoice@gmail.com",
        invoiceNo,
        customer,
        finalPayable,
      }),
    });

    window.print();
    setTimeout(() => (isPrintingRef.current = false), 800);
  };

  /* ================= CANCEL ================= */
  const cancelInvoice = async () => {
    const reason = prompt("Cancel reason?");
    if (!reason) return;

    await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        invoiceNo,
        status: "CANCELLED",
        cancelReason: reason,
      }),
    });

    location.reload();
  };

  /* ================= NEW BILL ================= */
  const createNewBill = async () => {
    const res = await fetch("/api/invoices");
    const data = await res.json();

    setInvoiceNo(data.nextInvoiceNo);
    setCreatedAt(new Date().toLocaleString());
    setEditedAt("");
    setSelectedInvoiceIndex("");
    setIsReadOnly(false);

    setStatus("ACTIVE");
    setCancelReason("");

    setCustomer(emptyCustomer);
    setItems([emptyItem]);
    setExchangeItems([]);
    setPaidAmount(0);
    setDueDateTime("");
    setRemark("");
  };

  /* ================= UI ================= */
  return (
    <div className="bg-gray-300 min-h-screen p-4">
      {/* PRINT HEADER (REPEATS EVERY PAGE VIA CSS) */}
      <div className="print-meta">
        <span>Invoice No: {invoiceNo}</span>
        <span>Date: {createdAt}</span>
      </div>

      {/* CANCEL WATERMARK */}
      {status === "CANCELLED" && (
        <div className="cancelled print:block hidden">CANCELLED</div>
      )}

      <div className="print-page mx-auto bg-white border-2 border-black p-3">
        {/* OLD INVOICE */}
        <div className="flex gap-3 my-2 print:hidden">
          <select
            className="border px-2 py-1"
            value={selectedInvoiceIndex}
            onChange={(e) => loadOldInvoice(Number(e.target.value))}
          >
            <option value="">-- Select Old Invoice --</option>
            {savedInvoices.map((inv, i) => (
              <option key={i} value={i}>
                {inv.invoiceNo}
              </option>
            ))}
          </select>

          {isReadOnly && status !== "CANCELLED" && (
            <>
              <button
                onClick={enableEditOld}
                className="bg-orange-600 text-white px-4 py-1"
              >
                Edit
              </button>

              <button
                onClick={cancelInvoice}
                className="bg-red-700 text-white px-4 py-1"
              >
                Cancel Invoice
              </button>
            </>
          )}
        </div>

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
          addItem={addItem}
          updateItem={updateItem}
          deleteItem={deleteItem}
        />

        <PurchaseTotal
          purchaseTotal={purchaseTotal}
          gstEnabled={gstEnabled}
          gstAmount={gstAmount}
          purchaseFinal={purchaseFinal}
        />

        <ExchangeTable
          exchangeItems={exchangeItems}
          addExchange={addExchange}
          updateExchange={updateExchange}
          deleteExchange={deleteExchange}
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

        <div className="flex justify-center gap-4 mt-4 print:hidden">
          <button
            onClick={handlePrint}
            className="bg-blue-600 text-white px-6 py-1"
          >
            Print Bill
          </button>

          <button
            onClick={createNewBill}
            className="bg-gray-600 text-white px-6 py-1"
          >
            Create New Bill
          </button>
        </div>
      </div>
    </div>
  );
}
