type Customer = {
  name: string
  phone: string
  address: string
  email: string
}

type Props = {
  customer: Customer
  setCustomer: React.Dispatch<React.SetStateAction<Customer>>
  isReadOnly?: boolean
}

export default function CustomerForm({
  customer,
  setCustomer,
  isReadOnly = false,
}: Props) {
  return (
    <div className="border-b-2 border-black p-2 mb-2">
      <p className="font-bold mb-1">Bill To</p>

      <input
        type="text"
        className="border w-full mb-1 px-1"
        placeholder="Customer Name"
        value={customer.name}
        disabled={isReadOnly}
        onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
      />

      <input
        type="text"
        className="border w-full mb-1 px-1"
        placeholder="Phone"
        value={customer.phone}
        disabled={isReadOnly}
        onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
      />

      <input
        type="email"
        className="border w-full mb-1 px-1 print:hidden"
        placeholder="Email (optional)"
        value={customer.email}
        disabled={isReadOnly}
        onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
      />

      <input
        type="text"
        className="border w-full px-1"
        placeholder="Address"
        value={customer.address}
        disabled={isReadOnly}
        onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
      />
    </div>
  )
}
