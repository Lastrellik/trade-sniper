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

  public async getTokenBuyPrice(btcAmount: number, tokenSymbol: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.binance.depth(tokenSymbol.toUpperCase() + 'BTC', (error, json) => {
        if(error) {
          console.log(error);
          reject(error);
        }
        let sumSoFar = 0;
        for(let i = 0; i < Object.keys(json.asks).length; i++) {
          const askRate = +Object.keys(json.asks)[i];
          const amount = json.asks[Object.keys(json.asks)[i]];
          sumSoFar += askRate * amount
          if (sumSoFar >= btcAmount) {
            resolve(+(askRate).toFixed(8));
            break;
          }
        }
        reject('Bitcoin balance is too high');
      });
    });
  }

  public async getTokenSellPrice(amountOfToken: number, tokenSymbol: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.binance.depth(tokenSymbol.toUpperCase() + 'BTC', (error, json) => {
        if(error) {
          console.log(error);
          reject(error);
        }
        console.log(json.bids);
        let amountSoFar = 0;
        for(let i = 0; i < Object.keys(json.bids).length; i++) {
          const bidRate = +Object.keys(json.bids)[i];
          console.log('bidRate ' + i, bidRate)
          const amount = json.bids[Object.keys(json.bids)[i]];
          amountSoFar += amount;
          if (amountSoFar >= amountOfToken) {
            resolve(bidRate);
            break;
          }
        }
        reject('Trying to sell too much of the token');
      });
    });
  }

  public async getAccountTokenBalance(tokenSymbol: string): Promise<number> {
    return new Promise(resolve => {
      this.binance.balance((error, balances) => {
        if(error) {
          console.log(error);
        }
        resolve(+balances[tokenSymbol].available);
      });
    })
  }

  //TODO
  public async getAccountBTCBalance(): Promise<number> {
    return new Promise(resolve => resolve(0));
  }
  
  public calculateAmountOfTokenToBuy(bitcoinBalance: number, bidRate: number): Promise<number> {
    const BITCOIN_ADJUSTMENT = 0.9975;
    return new Promise(resolve => resolve(Math.floor((bitcoinBalance / bidRate) * BITCOIN_ADJUSTMENT)));
  }

  public async marketBuy(amountOfToken: number, tokenSymbol: string): Promise<any> {
    console.log('amountOfToken', amountOfToken);
    this.binance.buy(tokenSymbol.toUpperCase() + 'BTC', amountOfToken, 0, {type: 'MARKET'}, (response) => {
      if(response !== null) {
        console.log(response.body);
      } else {
        console.log('Purchase successful');
      }
    });
  }

  public async limitBuy(amountOfToken: number, bidRate: number, tokenSymbol: string) {
    console.log('amountOfToken', amountOfToken);
    console.log('bidRate', bidRate);
    this.binance.buy(tokenSymbol.toUpperCase() + 'BTC', amountOfToken, 0, {type: 'MARKET'}, (response) => {
      if(response !== null) {
        console.log(response.body);
      } else {
        console.log('Purchase successful');
      }
    });
  }

  public async marketSell(amountOfToken: number,  tokenSymbol: string) {
    console.log('amountOfToken', amountOfToken);
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

  //TODO
  public async limitSell(amountOfToken: number, askRate: number, tokenSymbol: string): Promise<any> {
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

}
