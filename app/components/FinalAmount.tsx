type Props = {
  finalPayable: number
  actualTotal: number
}

export default function FinalAmount({ finalPayable, actualTotal }: Props) {
  return (
    <div className="mt-3 border-2 border-black p-2">
      <div className="flex justify-between text-lg font-extrabold">
        <span>Final Payable Amount</span>
        <span>₹{finalPayable.toFixed(2)}</span>
      </div>

      <div className="flex justify-end text-xs mt-1">
        Actual Total: ₹{actualTotal.toFixed(2)}
      </div>
    </div>
  )
}
