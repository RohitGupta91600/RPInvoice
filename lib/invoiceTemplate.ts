export default function invoiceTemplate(inv: any) {
  return `
  <div style="font-family:Arial;max-width:800px;margin:auto;border:2px solid #000;padding:12px">

    <h2 style="text-align:center">R. P. GUPTA</h2>
    <p style="text-align:center">Hallmark Shop & Bartan Bhandar</p>
    <hr/>

    <p><b>Invoice No:</b> ${inv.invoiceNo}</p>
    <p><b>Date:</b> ${inv.createdAt}</p>

    <h3>Customer</h3>
    <p>${inv.customer?.name || ""}</p>
    <p>${inv.customer?.phone || ""}</p>
    <p>${inv.customer?.email || ""}</p>

    <table width="100%" border="1" cellspacing="0" cellpadding="4">
      <tr>
        <th>Item</th>
        <th>Metal</th>
        <th>Wt</th>
        <th>Rate</th>
        <th>Making%</th>
        <th>Total</th>
      </tr>
      ${(inv.items || []).map((i:any)=>`
        <tr>
          <td>${i.name}</td>
          <td>${i.metal}</td>
          <td>${i.weight}</td>
          <td>${i.rate}</td>
          <td>${i.makingPercent}%</td>
          <td>${(i.weight*i.rate).toFixed(2)}</td>
        </tr>
      `).join("")}
    </table>

    <h3>Final Amount: ₹${inv.finalPayable}</h3>
    <p>Paid: ₹${inv.paidAmount}</p>
    <p>Due: ₹${inv.dueAmount}</p>

    ${inv.status === "CANCELLED" ? `<h1 style="color:red;text-align:center">CANCELLED</h1>` : ``}

  </div>
  `
}
