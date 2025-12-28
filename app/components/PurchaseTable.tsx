import { PurchaseItem } from "../types";

type Props = {
  items: PurchaseItem[];
  addItem: () => void;
  updateItem: (i: number, key: keyof PurchaseItem, v: string | number) => void;
  deleteItem: (i: number) => void;
};

export default function PurchaseTable({
  items,
  addItem,
  updateItem,
  deleteItem,
}: Props) {
  return (
    <>
      <p className="font-bold bg-yellow-200 mt-2 p-1">New Purchase</p>

      <table className="w-full border border-black">
        <thead className="bg-blue-600 text-white">
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
            const value = item.weight * item.rate;
            const making = (value * item.makingPercent) / 100;

            return (
              <tr key={i} className="text-center">
                <td className="border p-1">{i + 1}</td>

                {/* ITEM NAME */}
                <td className="border p-1">
                  <input
                    className="border w-full px-1"
                    value={item.name}
                    onChange={(e) => updateItem(i, "name", e.target.value)}
                  />
                </td>

                {/* METAL */}
                <td className="border p-1">
                  <select
                    className="border"
                    value={item.metal}
                    onChange={(e) => {
                      const metal = e.target.value as "Gold" | "Silver";
                      updateItem(i, "metal", metal);

                      // reset purity when metal changes
                      updateItem(
                        i,
                        "purityType",
                        metal === "Gold" ? "22k" : "custom"
                      );
                      updateItem(i, "purityValue", "");
                    }}
                  >
                    <option value="Gold">Gold</option>
                    <option value="Silver">Silver</option>
                  </select>
                </td>

                {/* PURITY */}
                <td className="border p-1">
                  {item.metal === "Gold" ? (
                    <>
                      <select
                        className="border"
                        value={item.purityType}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateItem(i, "purityType", val);
                          if (val !== "custom") {
                            updateItem(i, "purityValue", val);
                          }
                        }}
                      >
                        <option value="18k">18k</option>
                        <option value="22k">22k</option>
                        <option value="24k">24k</option>
                        <option value="custom">Custom</option>
                      </select>

                      {item.purityType === "custom" && (
                        <input
                          className="border w-14 ml-1 px-1"
                          placeholder="Purity"
                          value={item.purityValue}
                          onChange={(e) =>
                            updateItem(i, "purityValue", e.target.value)
                          }
                        />
                      )}
                    </>
                  ) : (
                    // SILVER → MANUAL INPUT
                    <input
                      className="border w-20 px-1"
                      placeholder="Purity"
                      value={item.purityValue}
                      onChange={(e) =>
                        updateItem(i, "purityValue", e.target.value)
                      }
                    />
                  )}
                </td>

                {/* WEIGHT */}
                <td className="border p-1">
                  <input
                    type="number"
                    className="border w-16"
                    placeholder="gm"
                    value={item.weight === 0 ? "" : item.weight}
                    onChange={(e) =>
                      updateItem(i, "weight", Number(e.target.value))
                    }
                  />
                </td>

                {/* RATE */}
                <td className="border p-1">
                  <input
                    type="number"
                    className="border w-24"
                    placeholder="Rate"
                    value={item.rate === 0 ? "" : item.rate}
                    onChange={(e) =>
                      updateItem(i, "rate", Number(e.target.value))
                    }
                  />
                </td>

                {/* MAKING */}
                <td className="border p-1">
                  <select
                    className="border w-20"
                    value={item.makingPercent}
                    onChange={(e) =>
                      updateItem(i, "makingPercent", Number(e.target.value))
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
                <td className="border p-1 font-bold">
                  ₹{(value + making).toFixed(2)}
                </td>

                {/* DELETE */}
                <td className="border p-1 print:hidden">
                  <button
                    onClick={() => deleteItem(i)}
                    className="text-red-600"
                  >
                    X
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <button
        onClick={addItem}
        className="bg-green-600 text-white px-3 py-1 mt-1 print:hidden"
      >
        + Add Item
      </button>
    </>
  );
}
