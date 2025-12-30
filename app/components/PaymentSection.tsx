type Props = {
  paidAmount: number;
  setPaidAmount: (v: number) => void;
  dueAmount: number;
  dueDateTime: string;
  setDueDateTime: (v: string) => void;
  remark: string;
  setRemark: (v: string) => void;
  isReadOnly?: boolean;
};

export default function PaymentSection({
  paidAmount,
  setPaidAmount,
  dueAmount,
  dueDateTime,
  setDueDateTime,
  remark,
  setRemark,
  isReadOnly = false,
}: Props) {
  const canEdit = !isReadOnly;

  return (
    <div className="mt-3 border border-black p-2">
      {/* ================= PAID AMOUNT ================= */}
      <div className="flex justify-between items-center">
        <span>Paid Amount</span>

        {/* INPUT (SCREEN) */}
        <input
          type="number"
          className="border px-1 w-32 text-right print:hidden"
          value={paidAmount === 0 ? "" : paidAmount}
          disabled={!canEdit}
          onChange={(e) => setPaidAmount(Number(e.target.value) || 0)}
        />

        {/* PRINT */}
        <span className="hidden print:block">
          ₹{paidAmount.toFixed(2)}
        </span>
      </div>

      {/* ================= DUE AMOUNT ================= */}
      <div className="flex justify-between font-bold mt-1">
        <span>Due Amount</span>
        <span>₹{dueAmount.toFixed(2)}</span>
      </div>

      {/* ================= DUE DATE ================= */}
      {dueAmount > 0 && (
        <div className="flex justify-between mt-1">
          <span>Due Date / Time</span>

          {/* INPUT */}
          <input
            type="datetime-local"
            className="border px-1 print:hidden"
            value={dueDateTime}
            disabled={!canEdit}
            onChange={(e) => setDueDateTime(e.target.value)}
          />

          {/* PRINT */}
          <span className="hidden print:block">
            {dueDateTime
              ? new Date(dueDateTime).toLocaleString()
              : ""}
          </span>
        </div>
      )}

      {/* ================= REMARK / NOTE ================= */}
      <div className="mt-2">
        <p className="font-bold">Remark / Note</p>

        {/* INPUT */}
        <textarea
          className="border w-full px-1 mt-1 print:hidden"
          rows={2}
          placeholder="Note / cancellation reason / issue..."
          value={remark}
          disabled={!canEdit}
          onChange={(e) => setRemark(e.target.value)}
        />

        {/* PRINT */}
        {remark && (
          <p className="hidden print:block text-sm mt-1">
            {remark}
          </p>
        )}
      </div>
    </div>
  );
}
