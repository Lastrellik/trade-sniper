export interface IExchange {
  constructor(apiKey: string, apiSecret: string);
  getTokenAskRate(tokenSymbol: string);
  buyToken(bitcoinBalance: string, tokenBidRate: number, tokenSymbol: string);
}
