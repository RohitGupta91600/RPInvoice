"use client";

import { useEffect, useState } from "react";

type DueEntry = {
  invoiceNo: string;
  createdAt: string;
  dueDateTime: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  customer: {
    name: string;
    phone: string;
    address: string;
    email: string;
  };
};

export default function DueBookPage() {
  const [dues, setDues] = useState<DueEntry[]>([]);

  useEffect(() => {
    fetch("/api/due-book")
      .then((r) => r.json())
      .then((d) => setDues(d.dueBook || []));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📒 Due Book (Khata)</h1>

      <table className="w-full border border-black text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2">Invoice No</th>
            <th className="border p-2">Customer Details</th>
            <th className="border p-2">Invoice Date</th>
            <th className="border p-2">Total</th>
            <th className="border p-2">Paid</th>
            <th className="border p-2 text-red-700">Due</th>
            <th className="border p-2">Due Date</th>
            <th className="border p-2">Status</th>
          </tr>
        </thead>

        <tbody>
          {dues.map((d, i) => (
            <tr key={i}>
              <td className="border p-2">{d.invoiceNo}</td>

              <td className="border p-2">
                <div className="font-semibold">{d.customer.name}</div>
                <div>📞 {d.customer.phone}</div>
                <div className="text-xs">{d.customer.address}</div>
                {d.customer.email && (
                  <div className="text-xs">✉ {d.customer.email}</div>
                )}
              </td>

              <td className="border p-2">
                {new Date(d.createdAt).toLocaleString()}
              </td>

              <td className="border p-2">₹{d.totalAmount.toFixed(2)}</td>
              <td className="border p-2">₹{d.paidAmount.toFixed(2)}</td>

              <td className="border p-2 text-red-700 font-bold">
                ₹{d.dueAmount.toFixed(2)}
              </td>

              <td className="border p-2">
                {d.dueDateTime
                  ? new Date(d.dueDateTime).toLocaleString()
                  : "-"}
              </td>

              <td className="border p-2 font-semibold text-orange-700">
                DUE
              </td>
            </tr>
          ))}

          {dues.length === 0 && (
            <tr>
              <td colSpan={8} className="text-center p-4">
                🎉 No pending dues
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
