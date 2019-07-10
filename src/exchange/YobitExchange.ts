import { IExchange } from './IExchange';

export class YobitExchange implements IExchange {
  public apiKey: string;
  public apiSecret: string;

  constructor(apiKey: string, apiSecret: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    //IMPLEMENT ME
  }

  public getTokenAskRate(tokenSymbol: string): Promise<number> {
    console.log(tokenSymbol);
    return new Promise(resolve => resolve(0));//to quiet the compiler
    //IMPLEMENT ME
  }

  public buyToken(bitcoinBalance: number, tokenBidRate: number, tokenSymbol: string) {
    console.log(bitcoinBalance, tokenBidRate, tokenSymbol);
    //IMPLEMENT ME
  }

  public getAccountBalances(): Promise<any> {
    return new Promise(resolve => resolve('ass'));
  }

  public getMarketSummaries(): Promise<any> {
    return new Promise(resolve => resolve('ass'));
  }
}
