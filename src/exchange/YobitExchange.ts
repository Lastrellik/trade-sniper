import { IExchange } from './IExchange';
const axios = require('axios');
const crypto = require('crypto');
const querystring = require('querystring');

export class YobitExchange implements IExchange {
  public apiKey: string; 
  public apiSecret: string;
  private prices: any;

  constructor(apiKey: string, apiSecret: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }
  
  //TODO
  public preloadPrices(): Promise<void> {
    return new Promise(resolve => resolve())
  }

  public getPreloadedTokenBuyPrice(tokenSymbol: string): number {
    return this.prices[tokenSymbol];
  }

  public getTokenBuyPrice(btcAmount: number, tokenSymbol: string): Promise<number> {
    const fullRequestUri = 'https://yobit.net/api/3/depth/' + tokenSymbol.toLowerCase() + '_btc';
    return new Promise((resolve, reject) => {
      axios.get(fullRequestUri).then(response => {
        const asks = response.data[tokenSymbol.toLowerCase() + '_btc'].asks;
        let sumSoFar = 0;
        console.log(asks);
        const startingAskRate = asks[0][0];
        for(let i = 0; i < asks.length; i++) {
          sumSoFar += asks[i][0] * asks[i][1];
          if (sumSoFar >= btcAmount) {
            const percentGainFromMyBuy = ((+asks[i][0] - startingAskRate) / startingAskRate) * 100;
            if(percentGainFromMyBuy > 30) {
              reject('Cancelling purchase. My buy would have raised the price %' + percentGainFromMyBuy);
            }
            resolve(+(asks[i][0]).toFixed(8));
            break;
          }
        }
        reject('Bitcoin balance is too high');
      }) 
    });
  }

  public getTokenSellPrice(amountOfToken: number, tokenSymbol: string): Promise<number> {
    const fullRequestUri = 'https://yobit.net/api/3/depth/' + tokenSymbol.toLowerCase() + '_btc';
    return new Promise((resolve, reject) => {
      axios.get(fullRequestUri).then(response => {
        const bids = response.data[tokenSymbol.toLowerCase() + '_btc'].bids;
        console.log(bids);
        let amountSoFar = 0;
        for(let i = 0; i < bids.length; i++) {
          const bidRate = bids[i][0];
          const amount = bids[i][1];
          amountSoFar += amount;
          if (amountSoFar >= amountOfToken) {
            resolve(bidRate);
            break;
          }
        }
        reject('Trying to sell too much of the token');
      }) 
    });
  }

  public getAccountTokenBalance(tokenSymbol: string): Promise<number> {
    const fullRequestUri = 'https://yobit.net/tapi';
    const params = {
      'method': 'getInfo',
      'nonce': '' + this.generateNonce()
    }
    const queryStringParams = querystring.stringify(params);
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Key': this.apiKey,
      'Sign': this.getApiSignature(params),
    }
    return new Promise(resolve => {
      axios({
        url: fullRequestUri,
        method: 'POST',
        headers: headers,
        data: queryStringParams
      }).then(response => {
        const amount = response.data.return.funds[tokenSymbol.toLowerCase()];
        const tokenBalance = amount === undefined ? 0 : amount;
        resolve(tokenBalance);
      }).catch(err => console.log(err.response.data));
    });
  }

  public getAccountBTCBalance(): Promise<number> {
    const fullRequestUri = 'https://yobit.net/tapi';
    const params = {
      'method': 'getInfo',
      'nonce': '' + this.generateNonce()
    }
    const queryStringParams = querystring.stringify(params);
    console.log(queryStringParams);
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Key': this.apiKey,
      'Sign': this.getApiSignature(params),
    }
    return new Promise(resolve => {
      axios({
        url: fullRequestUri,
        method: 'POST',
        headers: headers,
        data: queryStringParams
      }).then(response => resolve(+response.data.return.funds.btc)).catch(err => console.log(err.response.data));
    })
  }

  private getApiSignature(dataToSign: any) {
    const data = querystring.stringify(dataToSign);
    var hash = crypto.createHmac('sha512', this.apiSecret);
    hash.update(data);
    return hash.digest('hex');
  }

  private generateNonce() {
    var n = require('nonce')();
    return n() % 2147483646;
  }

  public calculateAmountOfTokenToBuy(bitcoinBalance: number, bidRate: number): Promise<number> {
    const BITCOIN_ADJUSTMENT = 0.9975;
    return new Promise(resolve => resolve(Math.floor((bitcoinBalance / bidRate) * BITCOIN_ADJUSTMENT)));
  }

  public marketBuy(amountOfToken: number, tokenSymbol: string): Promise<any> {
    throw new Error(`Unable to buy ${amountOfToken} of ${tokenSymbol}. Market buys are not supported with Yobit`);
  }

  public limitBuy(amountOfToken: number, bidRate: number, tokenSymbol: string): Promise<any> {
    const fullRequestUri = 'https://yobit.net/tapi';
    const params = {
      'method': 'Trade',
      'pair': tokenSymbol.toLowerCase() + '_btc',
      'type': 'buy',
      'rate': bidRate,
      'amount': amountOfToken,
      'nonce': '' + this.generateNonce()
    }
    const queryStringParams = querystring.stringify(params);
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Key': this.apiKey,
      'Sign': this.getApiSignature(params),
    }
    return new Promise(resolve => {
      axios({
        url: fullRequestUri,
        method: 'POST',
        headers: headers,
        data: queryStringParams
      }).then(response => {
        if(response.data.success === 1) {
          console.log('Buy Successful!');
        } else {
          console.log(response.data);
          console.log('There was an issue with the buy');
        }
        resolve();
      });
    })
  }

  public marketSell(amountOfToken: number, tokenSymbol: string): Promise<any> {
    throw new Error(`Unable to sell ${amountOfToken} of ${tokenSymbol}. Market sells are not supported with Yobit`);
  }

  public limitSell(amountOfToken: number, askRate: number, tokenSymbol: string): Promise<any> {
    const fullRequestUri = 'https://yobit.net/tapi';
    const params = {
      'method': 'Trade',
      'pair': tokenSymbol.toLowerCase() + '_btc',
      'type': 'sell',
      'rate': askRate,
      'amount': amountOfToken,
      'nonce': '' + this.generateNonce()
    }
    const queryStringParams = querystring.stringify(params);
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Key': this.apiKey,
      'Sign': this.getApiSignature(params),
    }
    return new Promise(resolve => {
      axios({
        url: fullRequestUri,
        method: 'POST',
        headers: headers,
        data: queryStringParams
      }).then(response => {
        if(response.data.success === 1) {
          console.log('sell successful');
        } else {
          console.log(response.data);
          console.log('There was an issue with the sell!');
        }
        resolve();
      }).catch(err => console.log(err.response.data));
    })
  }

  //TODO
  public async getOrderStatus(tokenSymbol: string, orderId: number): Promise<any> {
    console.log(tokenSymbol, orderId);
    return new Promise(resolve => resolve('resolution'));
  }
  
  //TODO
  public async cancelOrder(tokenSymbol: string, orderId: number): Promise<any> {
    console.log(tokenSymbol, orderId);
    return new Promise(resolve => resolve('resolution'));
  }

}
