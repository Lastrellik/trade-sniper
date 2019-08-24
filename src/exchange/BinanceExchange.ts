import { IExchange } from './IExchange';

export class BinanceExchange implements IExchange {
  public apiKey: string;
  public apiSecret: string;
  private binance;
  private prices: any;

  constructor(apiKey: string, apiSecret: string){
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.binance = require('node-binance-api')().options({
      APIKEY: this.apiKey,
      APISECRET: this.apiSecret,
      userServerTime: true
    });
  }

  public preloadPrices(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.binance.prices((error, ticker) => {
        if(error) {
          reject(error)
        }
        this.prices = ticker;
        resolve();
      });
    });
  }

  public getPreloadedTokenBuyPrice(tokenSymbol: string): number {
    if(!this.prices) {
      throw new Error('Prices have not been preloaded');
    }
    return +(this.prices[tokenSymbol.toUpperCase() + 'BTC']);
  }

  public async getTokenBuyPrice(btcAmount: number, tokenSymbol: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.binance.depth(tokenSymbol.toUpperCase() + 'BTC', async (error, json) => {
        if(error) {
          reject(error);
        }
        let sumSoFar = 0;
        for(let i = 0; i < Object.keys(json.asks).length; i++) {
          const askRate = +Object.keys(json.asks)[i];
          const amount = json.asks[Object.keys(json.asks)[i]];
          sumSoFar += askRate * amount
          if (sumSoFar >= btcAmount) {
            const buyPrice = +(askRate).toFixed(8);
            console.log('Buy price: ' + buyPrice);
            resolve(buyPrice);
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
          reject(error);
        }
        let amountSoFar = 0;
        for(let i = 0; i < Object.keys(json.bids).length; i++) {
          const bidRate = +Object.keys(json.bids)[i];
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
    return new Promise((resolve, reject) => {
      this.binance.balance((error, balances) => {
        if(error) {
          reject(error);
        }
        resolve(+balances[tokenSymbol].available);
      });
    })
  }

  public async getAccountBTCBalance(): Promise<number> {
    return this.getAccountTokenBalance('BTC');
  }
  
  public calculateAmountOfTokenToBuy(bitcoinBalance: number, bidRate: number): Promise<number> {
    const BITCOIN_ADJUSTMENT = 0.9975;
    return new Promise(resolve => resolve(Math.floor((bitcoinBalance / bidRate) * BITCOIN_ADJUSTMENT)));
  }

  public async marketBuy(amountOfToken: number, tokenSymbol: string): Promise<any> {
    console.log(`market buying ${amountOfToken} of ${tokenSymbol}`);
    return new Promise((resolve, reject) => {
      this.binance.buy(tokenSymbol.toUpperCase() + 'BTC', amountOfToken, 0, {type: 'MARKET'}, (error, response) => {
        if(error) {
          reject(error);
        }
        resolve(response);
      });
    })
  }

  public async limitBuy(amountOfToken: number, bidRate: number, tokenSymbol: string): Promise<any> {
    const formattedBidRate = bidRate.toFixed(await this.getTickSize(tokenSymbol));
    return new Promise((resolve, reject) => {
      this.binance.buy(tokenSymbol.toUpperCase() + 'BTC', amountOfToken, formattedBidRate, {type: 'LIMIT'}, (error, response) => {
        if(error) {
          console.log('Error in limit buy', error.body);
          reject(error);
        }
        resolve(response);
      });
    })
  }

  public async marketSell(amountOfToken: number,  tokenSymbol: string) {
    console.log(`market selling ${amountOfToken} of ${tokenSymbol}`)
    this.binance.sell(tokenSymbol.toUpperCase() + 'BTC', amountOfToken, 0, {type: 'MARKET'}, (error, response) => {
      if(error) {
        console.log(error.body);
      }
      if(response !== null && response !== {}) {
        console.log('market sell successful');
      }     
    });
  }

  public async limitSell(amountOfToken: number, askRate: number, tokenSymbol: string): Promise<any> {
    const formattedAskRate = askRate.toFixed(await this.getTickSize(tokenSymbol));
    console.log(`Limit selling ${Math.floor(amountOfToken)} of ${tokenSymbol} with askRate of ${formattedAskRate}`);
    return new Promise((resolve, reject) => {
      this.binance.sell(tokenSymbol.toUpperCase() + 'BTC', Math.floor(amountOfToken), formattedAskRate, {type: 'LIMIT'}, (error, response) => {
        if(error) {
          console.log('Issue with limit sell', error.body)
          reject(error);
        }
        console.log('Limit sell successful');
        resolve(response);
      });
    });
  }

  public async getOrderStatus(tokenSymbol: string, orderId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.binance.orderStatus(tokenSymbol.toUpperCase() + 'BTC', orderId, (error, orderStatus) => {
        if(error) {
          reject(error);
        }
        resolve(orderStatus);
      })
    });
  }

  public async cancelOrder(tokenSymbol: string, orderId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.binance.cancel(tokenSymbol.toUpperCase() + 'BTC', orderId, (error, response) => {
        if(error) {
          reject(error)
        }
        resolve(response);
      })
    });
  }

  private async getTickSize(symbol: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.binance.exchangeInfo((error, data) => {
        if(error) {
          console.log('Error getting tick size');
          reject(error);
        }
        const tickSize = data.symbols.filter(x => x.symbol === symbol.toUpperCase() + 'BTC')[0].filters.filter(x => x.filterType === 'PRICE_FILTER')[0].tickSize;
        const precision = Math.log10(1 / +tickSize);
        resolve(precision);
      });
    });
  }

}
