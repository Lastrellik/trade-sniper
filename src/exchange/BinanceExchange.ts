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
          console.log(error.body);
        }
        resolve(+(+ticker[tokenSymbol.toUpperCase() + 'BTC'] * 1.03).toFixed(8));
      });
    })
  }

  public async getAccountTokenBalance(tokenSymbol: string): Promise<number> {
    console.log(tokenSymbol);
    return new Promise(resolve => {
      this.binance.balance((error, balances) => {
        if(error) {
          console.log(error);
        }
        resolve(+balances[tokenSymbol].available);
      });
    })
  }
  
  public calculateAmountOfTokenToBuy(bitcoinBalance: number, bidRate: number): Promise<number> {
    const BITCOIN_ADJUSTMENT = 0.9975;
    return new Promise(resolve => resolve(Math.floor((bitcoinBalance / bidRate) * BITCOIN_ADJUSTMENT)));
  }

  public async buyToken(amountOfToken: number, bidRate: number, tokenSymbol: string) {
    console.log('amountOfToken', amountOfToken);
    console.log('bidRate', bidRate);
    this.binance.buy(tokenSymbol.toUpperCase() + 'BTC', amountOfToken, bidRate, {type: 'MARKET'}, (response) => {
      if(response !== null) {
        console.log(response.body);
      } else {
        console.log('Purchase successful');
      }
    });
  }

  public async sellToken(amountOfToken: number, askRate: number,  tokenSymbol: string) {
    console.log('amountOfToken', amountOfToken);
    console.log('askRate', askRate);
    //this.binance.marketSell(tokenSymbol.toUpperCase() + 'BTC', amountOfToken);
    this.binance.sell(tokenSymbol.toUpperCase() + 'BTC', amountOfToken, 0, {type: 'MARKET'}, (error, response) => {
      if(error) {
        console.log(error.body);
      }
      if(response !== null) {
        console.log(response.body);
      } else {
        console.log('Sell successful');
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
