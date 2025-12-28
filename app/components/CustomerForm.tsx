export default function CustomerForm() {
  return (
    <div className="border-b-2 border-black p-2">
      <p className="font-bold">Bill To</p>
      <input className="border w-full mb-1 px-1" placeholder="Customer Name" />
      <input className="border w-full mb-1 px-1" placeholder="Phone" />
      <input className="border w-full px-1" placeholder="Address" />
    </div>
  );
}
