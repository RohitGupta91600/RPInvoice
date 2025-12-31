export default function invoiceTemplate(data: any) {
  return `
  <html>
    <head>
      <style>
        body { font-family: Arial; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 6px; }
        th, td { border: 1px solid black; padding: 4px; text-align: center; }
        th:last-child, td:last-child { text-align: right; }
        .header {
          display: flex;
          justify-content: space-between;
          font-weight: bold;
          border-bottom: 1px solid black;
          margin-bottom: 6px;
        }
      </style>
    </head>

    <body>
      <div class="header">
        <div>
          <b>R P Gupta Hall Mark Shop & Bartan Bhandar</b><br/>
          Nagina Shah Market, Station Road, Mashrak, Saran 841417<br/>
          Phone: 9931648111<br/>
          GSTIN: 07ABCDE1234F
        </div>
        <div>
          Invoice No: ${data.invoiceNo}<br/>
          Date: ${data.createdAt || ""}
        </div>
      </div>

      <b>Bill To:</b><br/>
      ${data.customer?.name || ""}<br/>
      ${data.customer?.address || ""}<br/><br/>

      <table>
        <tr>
          <th>Sr</th>
          <th>Item</th>
          <th>Metal</th>
          <th>Purity</th>
          <th>Wt (gm)</th>
          <th>Rate</th>
          <th>Making %</th>
          <th>Amount</th>
        </tr>

        ${
          (data.items || [])
            .map((i: any, idx: number) => {
              const base = i.weight * i.rate;
              const total = base + (base * i.makingPercent) / 100;

              return `
              <tr>
                <td>${idx + 1}</td>
                <td>${i.item}</td>
                <td>${i.metal}</td>
                <td>${i.purityType}</td>
                <td>${i.weight}</td>
                <td>${i.rate}</td>
                <td>${i.makingPercent}%</td>
                <td>₹${total.toFixed(2)}</td>
              </tr>
            `;
            })
            .join("")
        }
      </table>

      <h3 style="text-align:right;margin-top:10px">
        Final Payable Amount: ₹${Number(data.finalPayable).toFixed(2)}
      </h3>

      <p style="font-size:11px">
        NOTE: We deal in all kinds of Gold Jewellery, Rings, Chains, Bangles,
        Silver items, Bartan & Hallmarked Jewellery.
      </p>
    </body>
  </html>
  `;
}
