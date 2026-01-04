export type PurchaseItem = {
  name: string
  metal: "Gold" | "Silver" | ""
  purityType: "18k" | "22k" | "24k" | "custom" | ""
  purityValue: string
  weight: number
  rate: number
  makingPercent: number
}


export type ExchangeItem = {
  description: string
  metal: "Gold" | "Silver"
  weight: number
  rate: number
  amount: number
}
