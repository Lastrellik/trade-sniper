export interface IExchange {
  apiKey: string; 
  apiSecret: string;
  getTokenAskRate(tokenSymbol: string): Promise<number>;
  buyToken(bitcoinBalance: number, tokenBidRate: number, tokenSymbol: string);
}
