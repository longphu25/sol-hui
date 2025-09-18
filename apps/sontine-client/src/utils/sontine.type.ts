export type SelectionMethod = { fixedOrder: {} } | { random: {} } | { auction: {} }
export type CycleDuration = { weekly: {} } | { monthly: {} } | { custom: { duration: number } }
export type AuctionConfig = {
  auctionDuration: number
  minBidIncrement: number
  maxInterestRate: number
}
