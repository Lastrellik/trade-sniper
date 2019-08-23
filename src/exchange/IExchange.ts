export interface IExchange {
  apiKey: string; 
  apiSecret: string;
  preloadPrices(): Promise<void>;
  getPreloadedTokenBuyPrice(tokenSymbol: string): number;
  getTokenBuyPrice(btcAmount: number, tokenSymbol: string): Promise<number>;
  getTokenSellPrice(amountOfToken: number, tokenSymbol: string): Promise<number>;
  getAccountTokenBalance(tokenSymbol: string): Promise<number>;
  getAccountBTCBalance(): Promise<number>;
  calculateAmountOfTokenToBuy(bitcoinBalance: number, bidRate: number): Promise<number>;
  marketBuy(amountOfToken: number, tokenSymbol: string): Promise<any>;
  limitBuy(amountOfToken: number, bidRate: number, tokenSymbol: string): Promise<any>;
  marketSell(amountOfToken: number, tokenSymbol: string): Promise<any>;
  limitSell(amountOfToken: number, askRate: number, tokenSymbol: string): Promise<any>;
  getOrderStatus(tokenSymbol: string, orderId: number): Promise<any>;
  cancelOrder(tokenSymbol: string, orderId: number): Promise<any>;
}
