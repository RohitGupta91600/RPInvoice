type Props = {
  paidAmount: number;
  setPaidAmount: (v: number) => void;
  dueAmount: number;
  dueDateTime: string;
  setDueDateTime: (v: string) => void;
};

export default function PaymentSection({
  paidAmount,
  setPaidAmount,
  dueAmount,
  dueDateTime,
  setDueDateTime,
}: Props) {
  return (
    <div className="mt-2 border border-black p-2">
      <div className="flex justify-between">
        <span>Paid Amount</span>

        <input
          type="number"
          className="border px-1 w-32 text-right print:hidden"
          onChange={(e) => setPaidAmount(+e.target.value)}
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
            onChange={(e) => setDueDateTime(e.target.value)}
          />

          <span className="hidden print:block">{dueDateTime}</span>
        </div>
      )}
    </div>
  );
}
