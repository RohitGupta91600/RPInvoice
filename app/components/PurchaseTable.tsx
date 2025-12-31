import { PurchaseItem } from "../types";

type Props = {
  items: PurchaseItem[];
  addItem: () => void;
  updateItem: (i: number, key: keyof PurchaseItem, v: string | number) => void;
  deleteItem: (i: number) => void;
  isReadOnly?: boolean;
};

export default function PurchaseTable({
  items,
  addItem,
  updateItem,
  deleteItem,
  isReadOnly = false,
}: Props) {
  const canEdit = !isReadOnly;

  return (
    <>
      <p className="font-bold bg-cyan-800 mt-2 p-1 print:bg-transparent">
        New Purchase
      </p>

      <div className="overflow-x-auto print:overflow-visible">
        <table className="w-full border border-black min-w-[800px] print:min-w-0 print:text-xs">
          <thead className="bg-blue-900 text-white print:bg-transparent print:text-black">
            <tr>
              <th className="border p-1">Sr</th>
              <th className="border p-1">Item</th>
              <th className="border p-1">Metal</th>
              <th className="border p-1">Purity</th>
              <th className="border p-1">Wt (gm)</th>
              <th className="border p-1">₹/gm</th>
              <th className="border p-1">Making %</th>
              <th className="border p-1">Total</th>
              <th className="border p-1 print:hidden">❌</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item, i) => {
              const base = item.weight * item.rate;
              const making = (base * item.makingPercent) / 100;
              const total = base + making;

              return (
                <tr key={i} className="text-center">
                  {/* SR */}
                  <td className="border p-1">{i + 1}</td>

                  {/* ITEM */}
                  <td className="border p-1">
                    <input
                      className="border w-full px-1 print:border-0"
                      value={item.name}
                      disabled={!canEdit}
                      onChange={(e) =>
                        updateItem(i, "name", e.target.value)
                      }
                    />
                  </td>

                  {/* METAL */}
                  <td className="border p-1">
                    <select
                      className="border print:border-0"
                      value={item.metal}
                      disabled={!canEdit}
                      onChange={(e) =>
                        updateItem(i, "metal", e.target.value)
                      }
                    >
                      <option value="Gold">Gold</option>
                      <option value="Silver">Silver</option>
                    </select>
                  </td>

                  {/* PURITY */}
                  <td className="border p-1">
                    {item.metal === "Gold" ? (
                      <>
                        {/* GOLD → DROPDOWN */}
                        <select
                          className="border print:border-0 print:hidden"
                          value={item.purityType}
                          disabled={!canEdit}
                          onChange={(e) =>
                            updateItem(i, "purityType", e.target.value)
                          }
                        >
                          <option value="18k">18k</option>
                          <option value="22k">22k</option>
                          <option value="24k">24k</option>
                          <option value="custom">Custom</option>
                        </select>

                        {/* PRINT VIEW */}
                        <span className="hidden print:inline">
                          {item.purityType === "custom"
                            ? item.purityValue
                            : item.purityType}
                        </span>

                        {/* CUSTOM INPUT */}
                        {item.purityType === "custom" && (
                          <input
                            className="border w-14 ml-1 px-1 print:hidden"
                            placeholder="Purity"
                            value={item.purityValue}
                            disabled={!canEdit}
                            onChange={(e) =>
                              updateItem(i, "purityValue", e.target.value)
                            }
                          />
                        )}
                      </>
                    ) : (
                      <>
                        {/* SILVER → ONLY INPUT */}
                        <span className="hidden print:inline">
                          {item.purityValue}
                        </span>

                        <input
                          className="border w-14 px-1 print:hidden"
                          placeholder="Purity"
                          value={item.purityValue}
                          disabled={!canEdit}
                          onChange={(e) =>
                            updateItem(i, "purityValue", e.target.value)
                          }
                        />
                      </>
                    )}
                  </td>

                  {/* WEIGHT */}
                  <td className="border p-1">
                    <input
                      type="number"
                      className="border w-16 print:border-0"
                      value={item.weight || ""}
                      disabled={!canEdit}
                      onChange={(e) =>
                        updateItem(i, "weight", Number(e.target.value))
                      }
                    />
                  </td>

                  {/* RATE */}
                  <td className="border p-1">
                    <input
                      type="number"
                      className="border w-24 print:border-0"
                      value={item.rate || ""}
                      disabled={!canEdit}
                      onChange={(e) =>
                        updateItem(i, "rate", Number(e.target.value))
                      }
                    />
                  </td>

                  {/* MAKING */}
                  <td className="border p-1">
                    <select
                      className="border w-20 print:border-0"
                      value={item.makingPercent}
                      disabled={!canEdit}
                      onChange={(e) =>
                        updateItem(
                          i,
                          "makingPercent",
                          Number(e.target.value)
                        )
                      }
                    >
                      {Array.from({ length: 28 }, (_, k) => 8 + k).map((p) => (
                        <option key={p} value={p}>
                          {p}%
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* TOTAL */}
                  <td className="border p-1 font-bold whitespace-nowrap">
                    ₹{total.toFixed(2)}
                  </td>

                  {/* DELETE */}
                  <td className="border p-1 print:hidden">
                    {canEdit && (
                      <button
                        onClick={() => deleteItem(i)}
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

      {canEdit && (
        <button
          onClick={addItem}
          className="bg-green-600 text-white px-3 py-1 mt-1 print:hidden"
        >
          + Add Item
        </button>
      )}
    </>
  );
}
