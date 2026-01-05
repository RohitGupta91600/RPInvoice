type Props = {
  finalPayable: number;
};

export default function FinalAmount({ finalPayable }: Props) {
  const rounded =
    finalPayable >= 0
      ? Math.round(finalPayable / 100) * 100
      : -Math.round(Math.abs(finalPayable) / 100) * 100;

  return (
    <div className="mt-3 border-2 border-black p-2">
      <div className="flex justify-between text-lg font-extrabold">
        <span>Final Payable Amount</span>
        <span>₹{rounded.toFixed(2)}</span>
      </div>

      <div className="flex justify-end text-xs mt-1">
        Actual Total: ₹{finalPayable.toFixed(2)}
      </div>
    </div>
  );
}
