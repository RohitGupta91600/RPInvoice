export default function invoiceTemplate(data:any){
return `
<html>
<head>
<style>
body{font-family:Arial;font-size:12px}
table{width:100%;border-collapse:collapse}
th,td{border:1px solid black;padding:4px;text-align:center}
th:last-child,td:last-child{text-align:right}
.header{display:flex;justify-content:space-between;font-weight:bold;border-bottom:1px solid black;margin-bottom:6px}
</style>
</head>
<body>

<div class="header">
<div>
<b>R P Gupta Hall Mark Shop & Bartan Bhandar</b><br/>
Nagina Shah Market, Station Road, Mashrak, Saran 841417<br/>
Phone: 9931864811<br/>
GSTIN: 07ABCDE1234F
</div>
<div>
Invoice No: ${data.invoiceNo}<br/>
Date: ${data.createdAt}
</div>
</div>

<b>Bill To:</b> ${data.customer.name}<br/><br/>

<table>
<tr><th>Sr</th><th>Description</th><th>Metal</th><th>Purity</th><th>Wt</th><th>Rate</th><th>Making%</th><th>Amount</th></tr>
${data.items.map((i:any,idx:number)=>`
<tr>
<td>${idx+1}</td>
<td>${i.name}</td>
<td>${i.metal}</td>
<td>${i.purityValue}</td>
<td>${i.weight}</td>
<td>${i.rate}</td>
<td>${i.makingPercent}%</td>
<td>${((i.weight*i.rate)*(1+i.makingPercent/100)).toFixed(2)}</td>
</tr>`).join("")}
<tr><td colspan="7"><b>Final Payable</b></td><td><b>${data.finalPayable}</b></td></tr>
</table>

</body>
</html>`;
}
