export interface IExchange {
  apiKey: string; 
  apiSecret: string;
  getTokenAskRate(tokenSymbol: string): Promise<number>;
  buyToken(bitcoinBalance: string, tokenBidRate: number, tokenSymbol: string);
}
