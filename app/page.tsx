"use client";

import { useState, useRef, useEffect } from "react";

import CompanyHeader from "./components/CompanyHeader";
import BillHeader from "./components/BillHeader";
import CustomerForm from "./components/CustomerForm";
import PurchaseTable from "./components/PurchaseTable";
import PurchaseTotal from "./components/PurchaseTotal";
import ExchangeTable from "./components/ExchangeTable";
import FinalAmount from "./components/FinalAmount";
import PaymentSection from "./components/PaymentSection";

import { PurchaseItem, ExchangeItem } from "./types";

export default function JewelleryBillPage() {
  /* ================= PRINT LOCK ================= */
  const isPrintingRef = useRef(false);

  /* ================= INVOICE ================= */
  const [invoiceNo, setInvoiceNo] = useState("000001");
  const [dateTime, setDateTime] = useState("");            // original date
  const [editedDateTime, setEditedDateTime] = useState(""); // edit date

  /* ================= OLD INVOICES ================= */
  const [savedInvoices, setSavedInvoices] = useState<any[]>([]);
  const [selectedInvoiceIndex, setSelectedInvoiceIndex] =
    useState<number | "">("");

  /* ================= MODES ================= */
  const [isReadOnly, setIsReadOnly] = useState(false);

  /* ================= GST ================= */
  const [gstEnabled, setGstEnabled] = useState(true);

  /* ================= ITEMS ================= */
  const emptyItem: PurchaseItem = {
    name: "",
    metal: "Gold",
    purityType: "22k",
    purityValue: "22k",
    weight: 0,
    rate: 0,
    makingPercent: 8,
  };

  const [items, setItems] = useState<PurchaseItem[]>([emptyItem]);
  const [exchangeItems, setExchangeItems] = useState<ExchangeItem[]>([]);
  const [paidAmount, setPaidAmount] = useState(0);
  const [dueDateTime, setDueDateTime] = useState("");

  /* ================= LOAD INITIAL ================= */
  useEffect(() => {
    const invs = JSON.parse(localStorage.getItem("invoices") || "[]");
    setSavedInvoices(invs);

    const current = localStorage.getItem("invoice_no") || "000001";
    setInvoiceNo(current);
    setDateTime(new Date().toLocaleString());
  }, []);

  /* ================= LOAD OLD INVOICE ================= */
  const loadOldInvoice = (index: number) => {
    const inv = savedInvoices[index];
    if (!inv) return;

    setSelectedInvoiceIndex(index);
    setIsReadOnly(true);

    setInvoiceNo(inv.invoiceNo);
    setDateTime(inv.dateTime); // original date stays
    setEditedDateTime(inv.editedDateTime || "");
    setGstEnabled(inv.gstEnabled);
    setItems(inv.items);
    setExchangeItems(inv.exchangeItems);
    setPaidAmount(inv.paidAmount);
    setDueDateTime(inv.dueDateTime || "");
  };

  /* ================= ENABLE EDIT OLD ================= */
  const enableEditOld = () => {
    setIsReadOnly(false);
    setEditedDateTime(new Date().toLocaleString());
  };

  const canEdit = !isReadOnly;

  /* ================= HELPERS ================= */
  const addItem = () => canEdit && setItems([...items, emptyItem]);
  const deleteItem = (i: number) =>
    canEdit && setItems(items.filter((_, idx) => idx !== i));

  const updateItem = <K extends keyof PurchaseItem>(
    i: number,
    key: K,
    value: PurchaseItem[K]
  ) => {
    if (!canEdit) return;
    const copy = [...items];
    copy[i][key] = value;
    setItems(copy);
  };

  const addExchange = () =>
    canEdit &&
    setExchangeItems([
      ...exchangeItems,
      { description: "", metal: "Gold", purity: "", weight: 0, rate: 0 },
    ]);

  const deleteExchange = (i: number) =>
    canEdit &&
    setExchangeItems(exchangeItems.filter((_, idx) => idx !== i));

  const updateExchange = <K extends keyof ExchangeItem>(
    i: number,
    key: K,
    value: ExchangeItem[K]
  ) => {
    if (!canEdit) return;
    const copy = [...exchangeItems];
    copy[i][key] = value;
    setExchangeItems(copy);
  };

  /* ================= CALCULATIONS ================= */
  const purchaseTotal = items.reduce((sum, item) => {
    const value = item.weight * item.rate;
    const making = (value * item.makingPercent) / 100;
    return sum + value + making;
  }, 0);

  const gstAmount = gstEnabled ? purchaseTotal * 0.03 : 0;
  const purchaseFinal = purchaseTotal + gstAmount;

  const exchangeTotal = exchangeItems.reduce((sum, ex) => {
    const purity = Number(ex.purity) || 0;
    return sum + ex.weight * ((ex.rate * purity) / 100);
  }, 0);

  const finalPayable = purchaseFinal - exchangeTotal;
  const dueAmount = Math.max(finalPayable - paidAmount, 0);

  /* ================= PRINT ================= */
  const handlePrint = () => {
    if (isPrintingRef.current) return;
    isPrintingRef.current = true;

    const invoices = JSON.parse(localStorage.getItem("invoices") || "[]");

    if (selectedInvoiceIndex !== "") {
      invoices[selectedInvoiceIndex] = {
        ...invoices[selectedInvoiceIndex],
        items,
        exchangeItems,
        paidAmount,
        dueDateTime,
        gstEnabled,
        editedDateTime,
      };
    } else {
      invoices.push({
        invoiceNo,
        dateTime,
        gstEnabled,
        items,
        exchangeItems,
        paidAmount,
        dueDateTime,
      });

      const next = String(Number(invoiceNo) + 1).padStart(6, "0");
      localStorage.setItem("invoice_no", next);
    }

    localStorage.setItem("invoices", JSON.stringify(invoices));
    window.print();

    setTimeout(() => {
      isPrintingRef.current = false;
    }, 800);
  };

  /* ================= CREATE NEW BILL ================= */
  const createNewBill = () => {
    if (isPrintingRef.current) return;

    const next = String(Number(invoiceNo) + 1).padStart(6, "0");
    localStorage.setItem("invoice_no", next);

    setInvoiceNo(next);
    setDateTime(new Date().toLocaleString());
    setEditedDateTime("");
    setSelectedInvoiceIndex("");
    setIsReadOnly(false);

    setItems([emptyItem]);
    setExchangeItems([]);
    setPaidAmount(0);
    setDueDateTime("");
  };

  /* ================= UI ================= */
  return (
    <div className="bg-gray-200 min-h-screen p-4">
      <div className="print-page mx-auto bg-white border-2 border-black p-3">

        {/* ===== META ===== */}
        <div className="print-meta">
          <span>Invoice No: {invoiceNo}</span>
          <span>Date: {dateTime}</span>
        </div>

        {editedDateTime && (
          <div className="text-right text-xs font-bold">
            Edited On: {editedDateTime}
          </div>
        )}

        {/* ===== OLD INVOICE CONTROLS ===== */}
        <div className="flex gap-3 my-2 print:hidden">
          <select
            className="border px-2 py-1"
            value={selectedInvoiceIndex}
            onChange={(e) => loadOldInvoice(Number(e.target.value))}
          >
            <option value="">-- Select Old Invoice --</option>
            {savedInvoices.map((inv, idx) => (
              <option key={idx} value={idx}>
                {inv.invoiceNo}
              </option>
            ))}
          </select>

          {isReadOnly && (
            <button
              onClick={enableEditOld}
              className="bg-orange-600 text-white px-4 py-1"
            >
              Edit Invoice
            </button>
          )}
        </div>

        <CompanyHeader gstEnabled={gstEnabled} />
        <BillHeader
          invoiceNo={invoiceNo}
          gstEnabled={gstEnabled}
          setGstEnabled={setGstEnabled}
        />

        <CustomerForm />

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
        />

        {/* ===== ACTIONS ===== */}
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
