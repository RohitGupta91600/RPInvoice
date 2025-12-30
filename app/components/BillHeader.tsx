type Props = {
  invoiceNo: string;
  createdAt: string;        // ✅ parent se aayega
  gstEnabled: boolean;
  setGstEnabled: (v: boolean) => void;
};

export default function BillHeader({
  invoiceNo,
  createdAt,
  gstEnabled,
  setGstEnabled,
}: Props) {
  return (
    <div className="flex border-b-2 border-black">
      {/* LEFT */}
      <div className="w-1/2 bg-cyan-800 text-white py-2 font-bold text-lg">
        Jewellery Bill
      </div>

      {/* RIGHT */}
      <div className="w-1/2 p-2 text-right">
        <p>
          <b>Invoice No:</b> {invoiceNo}
        </p>

        <p>
          <b>Date:</b> {createdAt}
        </p>

        <label className="inline-flex gap-1 items-center print:hidden">
          <input
            type="checkbox"
            checked={gstEnabled}
            onChange={() => setGstEnabled(!gstEnabled)}
          />
          GST (3%)
        </label>
      </div>
    </div>
  );
}
