export default function invoiceTemplate(inv: any) {

  const purchaseTotal = (inv.items || []).reduce((s: number, i: any) => {
    const base = i.weight * i.rate
    return s + base + (base * (i.makingPercent || 0)) / 100
  }, 0)

  const gst = inv.gstEnabled ? purchaseTotal * 0.03 : 0
  const purchaseFinal = purchaseTotal + gst

  const exchangeTotal = (inv.exchangeItems || []).reduce((s: number, e: any) => {
    return s + (Number(e.amount) || 0)
  }, 0)

  const finalPayable = purchaseFinal - exchangeTotal
  const due = Math.max(finalPayable - (inv.paidAmount || 0), 0)

  const watermark = Array.from({ length: 120 }).map(() =>
    `<div style="font-size:34px;font-weight:900;color:#000;opacity:0.04;transform:rotate(-30deg)">R P GUPTA</div>`
  ).join("")

  return `
<div style="max-width:800px;margin:auto;border:2px solid #000;padding:12px;font-family:Arial;position:relative">

<div style="
position:absolute;
inset:0;
display:grid;
grid-template-columns:repeat(3,1fr);
gap:60px;
align-content:center;
justify-items:center;
pointer-events:none;
z-index:0;
">
</div>

<div style="position:relative;z-index:2">

<h2 style="text-align:center;margin:0">R. P. GUPTA</h2>
<p style="text-align:center;margin:2px 0">Hallmark Shop & Bartan Bhandar</p>
<p style="text-align:center;margin:2px 0">Mobile: 9931864811 | Email: rpguptainvoice@gmail.com</p>
<hr>

<b>Invoice No:</b> ${inv.invoiceNo}<br>
<b>Date:</b> ${new Date(inv.createdAt).toLocaleString()}<br><br>

<b>Customer</b><br>
${inv.customer?.name || ""}<br>
${inv.customer?.phone || ""}<br>
${inv.customer?.email || ""}<br><br>

<b>New Purchase</b>
<table width="100%" border="1" cellspacing="0" cellpadding="4">
<tr><th>Item</th><th>Metal</th><th>Purity</th><th>Wt</th><th>Rate</th><th>Making%</th><th>Total</th></tr>
${(inv.items || []).map((i:any)=>`
<tr>
<td>${i.name}</td>
<td>${i.metal}</td>
<td>${i.purityValue}</td>
<td>${i.weight}</td>
<td>${i.rate}</td>
<td>${i.makingPercent}%</td>
<td>${((i.weight*i.rate)+((i.weight*i.rate*i.makingPercent)/100)).toFixed(2)}</td>
</tr>
`).join("")}
</table>

<p>Purchase Total: ₹${purchaseTotal.toFixed(2)}</p>
<p>GST (3%): ₹${gst.toFixed(2)}</p>
<p>Purchase Final: ₹${purchaseFinal.toFixed(2)}</p>

<b>Old Gold / Silver Exchange</b>
<table width="100%" border="1" cellspacing="0" cellpadding="4">
<tr><th>Description</th><th>Metal</th><th>Wt</th><th>Rate</th><th>Amount</th></tr>
${(inv.exchangeItems||[]).map((e:any)=>`
<tr>
<td>${e.description}</td>
<td>${e.metal}</td>
<td>${e.weight}</td>
<td>${e.rate}</td>
<td>${Number(e.amount || 0).toFixed(2)}</td>
</tr>
`).join("")}
</table>

<p><b>Total Exchange:</b> ₹${exchangeTotal.toFixed(2)}</p>

<h3>Final Payable: ₹${finalPayable.toFixed(2)}</h3>
<p>Paid: ₹${(inv.paidAmount||0).toFixed(2)}</p>
<p>Due: ₹${due.toFixed(2)}</p>

<b>Due Date / Time:</b> ${inv.dueDateTime || ""}<br>
<b>Remark / Note:</b> ${inv.remark || ""}<br><br>

${inv.status==="CANCELLED" ? `<h1 style="color:red;text-align:center">CANCELLED</h1>` : ``}

</div>
</div>
`
}
