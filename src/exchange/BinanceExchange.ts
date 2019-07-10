import { IExchange } from './IExchange';

export class BinanceExchange implements IExchange {
  public apiKey: string;
  public apiSecret: string;
  private binance;

  constructor(apiKey: string, apiSecret: string){
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.binance = require('node-binance-api')().options({
      APIKEY: this.apiKey,
      APISECRET: this.apiSecret,
      userServerTime: true
    });
  }

  public async getTokenAskRate(tokenSymbol: string): Promise<number> {
    return new Promise(resolve => {
      this.binance.prices(tokenSymbol.toUpperCase() + 'BTC', (error, ticker) => {
        if(error) {
          console.log(error);
        }
        resolve(+ticker[tokenSymbol.toUpperCase() + 'BTC']);
      });
    })
  }

  public async buyToken(bitcoinBalance: number, tokenBidRate: number,  tokenSymbol: string) {
    console.log(bitcoinBalance, tokenBidRate, tokenSymbol);
    //IMPLEMENT ME
  }

  public async getAccountBalances(): Promise<any> {
    return new Promise(resolve => resolve('ass'));
  }

  public async getMarketSummaries(): Promise<any> {
    return new Promise(resolve => resolve('ass'));
  }
  
}
