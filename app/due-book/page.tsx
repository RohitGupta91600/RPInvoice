"use client";

import { useEffect, useState, Fragment } from "react";

type Payment = {
  _id: string;
  amount: number;
  createdAt: string;
};

type DueEntry = {
  invoiceNo: string;
  createdAt: string;
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

function formatDateTime(v: string) {
  const d = new Date(v);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString();
}

export default function DueBookPage() {
  const [dues, setDues] = useState<DueEntry[]>([]);
  const [newPayments, setNewPayments] = useState<Record<string, string>>({});

  // 🔁 Load data
  const loadData = async () => {
    const r = await fetch("/api/due-book");
    const d = await r.json();
    setDues(d.dueBook || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  // ➕ Add payment
  const addPayment = async (invoiceNo: string) => {
    const amt = newPayments[invoiceNo];
    if (!amt) return alert("Enter amount");

    await fetch("/api/add-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        invoiceNo,
        amount: Number(amt),
      }),
    });

    setNewPayments((p) => ({ ...p, [invoiceNo]: "" }));
    loadData();
  };

  // 🗑️ Delete payment
  const deletePayment = async (
    invoiceNo: string,
    paymentId: string
  ) => {
    if (!confirm("Delete this payment entry?")) return;

    await fetch("/api/delete-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        invoiceNo,
        paymentId,
      }),
    });

    loadData();
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between mb-4 print:hidden">
        <h1 className="text-2xl font-bold">📒 Due Book (Khata)</h1>
        <button
          onClick={() => window.print()}
          className="px-6 py-2 bg-blue-700 text-white rounded"
        >
          Print Due Book
        </button>
      </div>

      <table className="w-full border border-black text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2">Invoice</th>
            <th className="border p-2">Customer</th>
            <th className="border p-2">Total</th>
            <th className="border p-2 text-red-700">Due</th>
            <th className="border p-2">Status</th>
          </tr>
        </thead>

        <tbody>
          {dues.map((d) => {
            const totalReceived = d.payments.reduce(
              (s, p) => s + p.amount,
              0
            );

            return (
              <Fragment key={d.invoiceNo}>
                {/* MAIN ROW */}
                <tr>
                  <td className="border p-2 font-bold">
                    {d.invoiceNo}
                  </td>

                  <td className="border p-2">
                    <div className="font-semibold">
                      {d.customer.name}
                    </div>
                    <div>{d.customer.phone}</div>
                    <div className="text-xs">
                      {d.customer.address}
                    </div>
                    {d.customer.email && (
                      <div className="text-xs">
                        {d.customer.email}
                      </div>
                    )}
                  </td>

                  <td className="border p-2 text-right">
                    ₹{d.totalAmount.toFixed(2)}
                  </td>

                  <td className="border p-2 text-right font-bold text-red-700">
                    ₹{d.dueAmount.toFixed(2)}
                  </td>

                  <td className="border p-2 text-center text-orange-700 font-bold">
                    DUE
                  </td>
                </tr>

                {/* PAYMENT BOX */}
                <tr>
                  <td colSpan={5} className="border p-3 bg-gray-50">
                    <div className="font-semibold mb-1">
                      💰 Payment History (Total Received: ₹
                      {totalReceived.toFixed(2)})
                    </div>

                    {d.payments.length === 0 && (
                      <div className="text-sm text-gray-500">
                        No payments recorded
                      </div>
                    )}

                    {d.payments.map((p) => (
                      <div
                        key={p._id}
                        className="flex justify-between items-center border-b py-1"
                      >
                        <div>
                          ₹{p.amount} received on{" "}
                          {formatDateTime(p.createdAt)}
                        </div>

                        <button
                          onClick={() =>
                            deletePayment(d.invoiceNo, p._id)
                          }
                          className="print:hidden px-3 py-1 bg-red-700 text-white text-xs rounded"
                        >
                          Delete
                        </button>
                      </div>
                    ))}

                    {/* ADD PAYMENT */}
                    <div className="mt-2 flex gap-2 print:hidden">
                      <input
                        type="number"
                        placeholder="Add payment amount"
                        className="border px-2 py-1 w-40"
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
                        className="px-4 py-1 bg-blue-700 text-white rounded text-sm"
                      >
                        ➕ Add Payment
                      </button>
                    </div>
                  </td>
                </tr>
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
