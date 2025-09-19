export type SelectionMethod = { fixedOrder: object } | { random: object } | { auction: object }
export type CycleDuration = { weekly: object } | { monthly: object } | { custom: { duration: number } }
export type AuctionConfig = {
  auctionDuration: number
  minBidIncrement: number
  maxInterestRate: number
}
