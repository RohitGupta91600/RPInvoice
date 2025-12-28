type Props = {
  invoiceNo: string;
  gstEnabled: boolean;
  setGstEnabled: (v: boolean) => void;
};

export default function BillHeader({
  invoiceNo,
  gstEnabled,
  setGstEnabled,
}: Props) {
  return (
    <div className="flex border-b-2 border-black">
      <div className="w-1/2 bg-blue-600 text-white py-2 font-bold text-lg">
        Jewellery Bill
      </div>

      <div className="w-1/2 p-2 text-right">
        <p><b>Invoice No:</b> {invoiceNo}</p>
        <p><b>Date:</b> {new Date().toLocaleString()}</p>

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
