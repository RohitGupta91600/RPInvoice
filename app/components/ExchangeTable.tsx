import { ExchangeItem } from "../types";

type Props = {
  exchangeItems: ExchangeItem[];
  addExchange: () => void;
  updateExchange: (
    i: number,
    key: keyof ExchangeItem,
    v: string | number
  ) => void;
  deleteExchange: (i: number) => void;
  isReadOnly?: boolean;
};

export default function ExchangeTable({
  exchangeItems,
  addExchange,
  updateExchange,
  deleteExchange,
  isReadOnly = false,
}: Props) {
  const canEdit = !isReadOnly;

  const totalExchange = exchangeItems.reduce(
    (s, e) => s + (Number(e.amount) || 0),
    0
  );

  return (
    <>
      <p className="font-bold bg-cyan-800 mt-3 p-1">
        Old Gold / Silver Exchange
      </p>

      <div className="overflow-x-auto print:overflow-visible">
        <table className="w-full border border-black min-w-[900px] print:min-w-0 print:text-xs">
          <thead className="bg-blue-900 text-white print:bg-transparent print:text-black">
            <tr>
              <th className="border p-1">Sr</th>
              <th className="border p-1">Description</th>
              <th className="border p-1">Metal</th>
              <th className="border p-1">Wt (gm)</th>
              <th className="border p-1">₹/gm</th>
              <th className="border p-1">Amount</th>
              <th className="border p-1 print:hidden">❌</th>
            </tr>
          </thead>

          <tbody>
            {exchangeItems.map((ex, i) => (
              <tr key={i} className="text-center">
                <td className="border p-1">{i + 1}</td>

                <td className="border p-1">
                  <input
                    className="border w-full px-1"
                    placeholder="Old chain / ring"
                    value={ex.description}
                    disabled={!canEdit}
                    onChange={(e) =>
                      updateExchange(i, "description", e.target.value)
                    }
                  />
                </td>

                <td className="border p-1">
                  <select
                    className="border"
                    value={ex.metal}
                    disabled={!canEdit}
                    onChange={(e) =>
                      updateExchange(
                        i,
                        "metal",
                        e.target.value as "Gold" | "Silver"
                      )
                    }
                  >
                    <option value="Gold">Gold</option>
                    <option value="Silver">Silver</option>
                  </select>
                </td>

                <td className="border p-1">
                  <input
                    type="number"
                    className="border w-20"
                    placeholder="gm"
                    value={ex.weight === 0 ? "" : ex.weight}
                    disabled={!canEdit}
                    onChange={(e) =>
                      updateExchange(i, "weight", Number(e.target.value))
                    }
                  />
                </td>

                <td className="border p-1">
                  <input
                    type="number"
                    className="border w-24"
                    placeholder="Rate"
                    value={Number(ex.rate) === 0 ? "" : ex.rate}
                    disabled={!canEdit}
                    onChange={(e) =>
                      updateExchange(i, "rate", Number(e.target.value))
                    }
                  />
                </td>

                <td className="border p-1">
                  <input
                    type="number"
                    className="border w-28 text-right font-bold"
                    placeholder="Amount"
                    value={Number(ex.amount) === 0 ? "" : ex.amount}
                    disabled={!canEdit}
                    onChange={(e) =>
                      updateExchange(i, "amount", Number(e.target.value))
                    }
                  />
                </td>

                <td className="border p-1 print:hidden">
                  {canEdit && (
                    <button
                      onClick={() => deleteExchange(i)}
                      className="text-red-600"
                    >
                      X
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!isReadOnly && (
        <button
          onClick={addExchange}
          className="bg-orange-600 text-white px-3 py-1 mt-1 print:hidden"
        >
          + Add Exchange
        </button>
      )}

      <div className="flex justify-end font-bold mt-2 pr-4">
        Total Exchange Value : ₹{totalExchange.toFixed(2)}
      </div>
    </>
  );
}
