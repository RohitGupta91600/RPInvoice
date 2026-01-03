"use client";

import { useEffect, useState, Fragment } from "react";

/* ================= TYPES ================= */

type Payment = {
  _id: string;
  amount: number;
  createdAt: string;
};

type DueEntry = {
  invoiceNo: string;
  createdAt: string;
  dueDateTime?: string;
  totalAmount: number;
  dueAmount: number;
  customer: {
    name: string;
    phone: string;
    address: string;
    email: string;
  };
  payments: Payment[];
};

/* ================= HELPERS ================= */

function formatDateTime(v?: string) {
  if (!v) return "-";
  const d = new Date(v);
  if (isNaN(d.getTime())) return "-";
  return (
    d.toLocaleDateString() +
    " " +
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
}

function statusFromAmounts(received: number, remaining: number) {
  if (received === 0) return { label: "DUE", color: "text-red-600" };
  if (remaining === 0) return { label: "PAID", color: "text-green-600" };
  return { label: "PARTIAL", color: "text-orange-500" };
}

/* ================= PAGE ================= */

export default function DueBookPage() {
  const [dues, setDues] = useState<DueEntry[]>([]);
  const [newPayments, setNewPayments] = useState<Record<string, string>>({});

  // filters
  const [filterType, setFilterType] = useState<"all" | "month" | "year">("all");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  /* ================= LOAD ================= */

  const loadData = async () => {
    const r = await fetch("/api/due-book");
    const d = await r.json();
    setDues(d.dueBook || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ================= FILTER ================= */

  const filteredDues = dues.filter((d) => {
    const date = new Date(d.createdAt);

    if (filterType === "month" && month) {
      const [y, m] = month.split("-");
      return (
        date.getFullYear() === Number(y) &&
        date.getMonth() + 1 === Number(m)
      );
    }

    if (filterType === "year" && year) {
      return date.getFullYear() === Number(year);
    }

    return true;
  });

  /* ================= ACTIONS ================= */

  const addPayment = async (invoiceNo: string) => {
    const amt = newPayments[invoiceNo];
    if (!amt) return alert("Enter amount");

    await fetch("/api/add-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceNo, amount: Number(amt) }),
    });

    setNewPayments((p) => ({ ...p, [invoiceNo]: "" }));
    loadData();
  };

  const deletePayment = async (invoiceNo: string, paymentId: string) => {
    if (!confirm("Delete this payment entry?")) return;

    await fetch("/api/delete-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceNo, paymentId }),
    });

    loadData();
  };

  /* ================= UI ================= */

  return (
    <div className="p-4">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-3 print:hidden">
        <h1 className="text-xl font-bold">📒 Due Book (Khata)</h1>

        <div className="flex gap-2 items-center">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="border px-2 py-1 text-sm"
          >
            <option value="all">All</option>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </select>

          {filterType === "month" && (
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="border px-2 py-1 text-sm"
            />
          )}

          {filterType === "year" && (
            <input
              type="number"
              placeholder="Year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="border px-2 py-1 w-24 text-sm"
            />
          )}

          <button
            onClick={() => window.print()}
            className="px-4 py-1 bg-blue-700 text-white rounded text-sm"
          >
            Print
          </button>
        </div>
      </div>

      {/* PRINT TITLE */}
      <div className="hidden print:block text-center mb-2">
        <div className="font-bold text-sm">Due Book Report</div>
        <div className="text-[10px]">
          {filterType === "month" && `Month: ${month}`}
          {filterType === "year" && `Year: ${year}`}
          {filterType === "all" && "All Records"}
        </div>
      </div>

      {/* TABLE */}
      <table className="w-full border border-black text-[11px]">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-1 w-[110px]">Invoice</th>
            <th className="border p-1">Customer</th>
            <th className="border p-1 w-[160px]">Due</th>
            <th className="border p-1 w-[180px]">Received / Remaining</th>
            <th className="border p-1 w-[70px]">Status</th>
          </tr>
        </thead>

        <tbody>
          {filteredDues.map((d) => {
            const received = d.payments.reduce((s, p) => s + p.amount, 0);
            const remaining = Math.max(d.dueAmount - received, 0);
            const status = statusFromAmounts(received, remaining);

            return (
              <Fragment key={d.invoiceNo}>
                {/* MAIN ROW */}
                <tr>
                  <td className="border p-1 align-top">
                    <div className="font-bold">{d.invoiceNo}</div>
                    <div className="text-[10px]">
                      {formatDateTime(d.createdAt)}
                    </div>
                  </td>

                  <td className="border p-1 align-top">
                    <div className="font-semibold">{d.customer.name}</div>
                    <div>{d.customer.phone}</div>
                    <div className="text-[10px]">{d.customer.address}</div>
                    {d.customer.email && (
                      <div className="text-[10px]">{d.customer.email}</div>
                    )}
                  </td>

                  {/* DUE COLUMN */}
                  <td className="border p-1 align-top">
                    <div className="text-red-700 font-bold">
                      ₹{d.dueAmount.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-gray-700 mt-1">
                      Due Date: {formatDateTime(d.dueDateTime)}
                    </div>
                  </td>

                  {/* RECEIVED / REMAINING */}
                  <td className="border p-1 align-top">
                    <div className="text-green-700">
                      <b>Received:</b> ₹{received.toFixed(2)}
                    </div>
                    <div className="text-red-700">
                      <b>Remaining:</b> ₹{remaining.toFixed(2)}
                    </div>
                  </td>

                  <td
                    className={`border p-1 text-center font-bold ${status.color}`}
                  >
                    {status.label}
                  </td>
                </tr>

                {/* PAYMENTS */}
                {d.payments.map((p) => (
                  <tr key={p._id}>
                    <td colSpan={4} className="border p-1 pl-6">
                      ₹{p.amount} received on {formatDateTime(p.createdAt)}
                    </td>
                    <td className="border p-1 text-center print:hidden">
                      <button
                        onClick={() => deletePayment(d.invoiceNo, p._id)}
                        className="text-red-600 text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {/* ADD PAYMENT */}
                <tr className="print:hidden">
                  <td colSpan={4} className="border p-1">
                    <input
                      type="number"
                      placeholder="Amount"
                      className="border px-2 py-1 w-32 text-sm"
                      value={newPayments[d.invoiceNo] ?? ""}
                      onChange={(e) =>
                        setNewPayments((x) => ({
                          ...x,
                          [d.invoiceNo]: e.target.value,
                        }))
                      }
                    />
                    <button
                      onClick={() => addPayment(d.invoiceNo)}
                      className="ml-2 px-3 py-1 bg-blue-700 text-white text-sm rounded"
                    >
                      + Add
                    </button>
                  </td>
                  <td className="border"></td>
                </tr>
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
