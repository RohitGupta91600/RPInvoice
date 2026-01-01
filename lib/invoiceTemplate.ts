export default function invoiceTemplate(inv: any) {

  const purchaseTotal = (inv.items || []).reduce((s: number, i: any) => {
    const base = i.weight * i.rate
    return s + base + (base * (i.makingPercent || 0)) / 100
  }, 0)

  const gst = inv.gstEnabled ? purchaseTotal * 0.03 : 0
  const purchaseFinal = purchaseTotal + gst

  const exchangeTotal = (inv.exchangeItems || []).reduce((s: number, e: any) => {
    const purity = Number(e.purity) || 0
    return s + e.weight * ((e.rate * purity) / 100)
  }, 0)

  const finalPayable = purchaseFinal - exchangeTotal
  const due = Math.max(finalPayable - (inv.paidAmount || 0), 0)

  return `
<div style="max-width:800px;margin:auto;border:2px solid #000;padding:12px;font-family:Arial">

<h2 style="text-align:center;margin:0">R. P. GUPTA</h2>
<p style="text-align:center;margin:2px 0">Hallmark Shop & Bartan Bhandar</p>
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
<tr><th>Description</th><th>Metal</th><th>Purity%</th><th>Wt</th><th>Rate</th><th>Amount</th></tr>
${(inv.exchangeItems||[]).map((e:any)=>`
<tr>
<td>${e.description}</td>
<td>${e.metal}</td>
<td>${e.purity}</td>
<td>${e.weight}</td>
<td>${e.rate}</td>
<td>${(e.weight*((e.rate*(Number(e.purity)||0))/100)).toFixed(2)}</td>
</tr>
`).join("")}
</table>

<h3>Final Payable: ₹${finalPayable.toFixed(2)}</h3>
<p>Paid: ₹${(inv.paidAmount||0).toFixed(2)}</p>
<p>Due: ₹${due.toFixed(2)}</p>

${inv.status==="CANCELLED" ? `<h1 style="color:red;text-align:center">CANCELLED</h1>` : ``}

</div>
`
}
