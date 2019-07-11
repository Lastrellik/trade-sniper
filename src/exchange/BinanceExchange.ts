import { IExchange } from './IExchange';
import { calculateAmountOfTokenToBuy } from '../utils';

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
        resolve(+(+ticker[tokenSymbol.toUpperCase() + 'BTC'] * 1.03).toFixed(8));
      });
    })
  }

  public async buyToken(bitcoinBalance: number, tokenBidRate: number,  tokenSymbol: string) {
    const amountOfToken = Math.floor(+calculateAmountOfTokenToBuy(bitcoinBalance, tokenBidRate));
    console.log('amountOfToken', amountOfToken);
    console.log('tokenBidRate', tokenBidRate);
    this.binance.buy(tokenSymbol.toUpperCase() + 'BTC', amountOfToken, tokenBidRate, {type: 'MARKET'}, (response) => {
      if(response !== null) {
        console.log(response.body);
      } else {
        console.log('Purchase successful');
      }
    });
  }

  public async getAccountBalances(): Promise<any> {
    return new Promise(resolve => resolve('ass'));
  }

  public async getMarketSummaries(): Promise<any> {
    return new Promise(resolve => resolve('ass'));
  }
  
}
