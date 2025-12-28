type Props = {
  finalPayable: number;
};

export default function FinalAmount({ finalPayable }: Props) {
  return (
    <div className="mt-3 border-2 border-black p-2 bg-yellow-100">
      <div className="flex justify-between text-lg font-extrabold">
        <span>Final Payable Amount</span>
        <span>₹{finalPayable.toFixed(2)}</span>
      </div>
    </div>
  );
}
