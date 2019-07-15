export interface IExchange {
  apiKey: string; 
  apiSecret: string;
  getTokenPrice(btcAmount: number, tokenSymbol: string): Promise<number>;
  getAccountTokenBalance(tokenSymbol: string): Promise<number>;
  calculateAmountOfTokenToBuy(bitcoinBalance: number, bidRate: number): Promise<number>;
  buyToken(amountOfToken: number, bidRate: number, tokenSymbol: string);
  sellToken(amountOfToken: number, askRate: number, tokenSymbol: string);
  getAccountBalances(): Promise<any>;
  getMarketSummaries(): Promise<any>;
}
