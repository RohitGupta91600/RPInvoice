type Props = {
  purchaseTotal: number;
  gstEnabled: boolean;
  gstAmount: number;
  purchaseFinal: number;
};

export default function PurchaseTotal({
  purchaseTotal,
  gstEnabled,
  gstAmount,
  purchaseFinal,
}: Props) {
  return (
    <div className="mt-3 border-2 border-black p-2 bg-gray-100">
      <div className="flex justify-between">
        <span>New Purchase Total</span>
        <span>₹{purchaseTotal.toFixed(2)}</span>
      </div>

      {gstEnabled && (
        <div className="flex justify-between">
          <span>GST (3%)</span>
          <span>₹{gstAmount.toFixed(2)}</span>
        </div>
      )}

      <div className="flex justify-between font-bold border-t mt-1 pt-1">
        <span>New Purchase Final</span>
        <span>₹{purchaseFinal.toFixed(2)}</span>
      </div>
    </div>
  );
}
