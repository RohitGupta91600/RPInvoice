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

  return (
    <>
      <p className="font-bold bg-cyan-800 mt-3 p-1">
        Old Gold / Silver Exchange
      </p>

      <div className="overflow-x-auto">
        <table className="min-w-[700px] w-full border border-black">
          <thead className="bg-blue-900 text-white">
            <tr>
              <th className="border p-1">Sr</th>
              <th className="border p-1">Description</th>
              <th className="border p-1">Metal</th>
              <th className="border p-1">Purity %</th>
              <th className="border p-1">Wt (gm)</th>
              <th className="border p-1">₹/gm</th>
              <th className="border p-1">Amount</th>
              <th className="border p-1 print:hidden">❌</th>
            </tr>
          </thead>

          <tbody>
            {exchangeItems.map((ex, i) => {
              const purityPercent = Number(ex.purity) || 0;
              const effectiveRate = (ex.rate * purityPercent) / 100;
              const amount = ex.weight * effectiveRate;

              return (
                <tr key={i} className="text-center">
                  <td className="border p-1">{i + 1}</td>

                  {/* DESCRIPTION */}
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

                  {/* METAL */}
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

                  {/* PURITY */}
                  <td className="border p-1">
                    <input
                      type="number"
                      className="border w-16 px-1"
                      placeholder="75"
                      value={ex.purity === "0" ? "" : ex.purity}
                      disabled={!canEdit}
                      onChange={(e) =>
                        updateExchange(i, "purity", e.target.value)
                      }
                    />
                  </td>

                  {/* WEIGHT */}
                  <td className="border p-1">
                    <input
                      type="number"
                      className="border w-16"
                      placeholder="gm"
                      value={ex.weight === 0 ? "" : ex.weight}
                      disabled={!canEdit}
                      onChange={(e) =>
                        updateExchange(i, "weight", Number(e.target.value))
                      }
                    />
                  </td>

                  {/* RATE */}
                  <td className="border p-1">
                    <input
                      type="number"
                      className="border w-24"
                      placeholder="Rate"
                      value={ex.rate === 0 ? "" : ex.rate}
                      disabled={!canEdit}
                      onChange={(e) =>
                        updateExchange(i, "rate", Number(e.target.value))
                      }
                    />
                  </td>

                  {/* AMOUNT */}
                  <td className="border p-1 font-bold">
                    ₹{amount.toFixed(2)}
                  </td>

                  {/* DELETE */}
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
              );
            })}
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
    </>
  );
}
