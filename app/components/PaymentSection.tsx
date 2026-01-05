type Props = {
  paidAmount: number
  setPaidAmount: (v: number) => void
  dueAmount: number
  dueDateTime: string
  setDueDateTime: (v: string) => void
  remark: string
  setRemark: (v: string) => void
  isReadOnly?: boolean
}

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
  const canEdit = !isReadOnly

  const handlePaidChange = (v: string) => {
    const n = Number(v || 0)

    if (n > dueAmount + paidAmount) {
      alert("Paid amount final payable se zyada nahi ho sakta")
      return
    }

    setPaidAmount(n)
  }

  return (
    <div className="mt-3 border border-black p-2">

      <div className="flex justify-between items-center">
        <span>Paid Amount</span>

        <input
          type="number"
          className="border px-1 w-32 text-right print:hidden"
          value={paidAmount === 0 ? "" : paidAmount}
          disabled={!canEdit}
          onChange={(e) => handlePaidChange(e.target.value)}
        />

        <span className="hidden print:block">
          ₹{paidAmount.toFixed(2)}
        </span>
      </div>

      <div className="flex justify-between font-bold mt-1">
        <span>Due Amount</span>
        <span>₹{dueAmount.toFixed(2)}</span>
      </div>

      {dueAmount > 0 && (
        <div className="flex justify-between mt-1">
          <span>Due Date / Time</span>

          <input
            type="datetime-local"
            className="border px-1 print:hidden"
            value={dueDateTime}
            disabled={!canEdit}
            onChange={(e) => setDueDateTime(e.target.value)}
          />

          <span className="hidden print:block">
            {dueDateTime ? new Date(dueDateTime).toLocaleString() : ""}
          </span>
        </div>
      )}

      <div className="mt-2">
        <p className="font-bold">Remark / Note</p>

        <textarea
          className="border w-full px-1 mt-1 print:hidden"
          rows={2}
          placeholder="Note / cancellation reason / issue..."
          value={remark}
          disabled={!canEdit}
          onChange={(e) => setRemark(e.target.value)}
        />

        {remark && (
          <p className="hidden print:block text-sm mt-1">
            {remark}
          </p>
        )}
      </div>

    </div>
  )
}
