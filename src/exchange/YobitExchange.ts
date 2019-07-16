import { IExchange } from './IExchange';
const axios = require('axios');
const crypto = require('crypto');
const querystring = require('querystring');

export class YobitExchange implements IExchange {
  public apiKey: string; 
  public apiSecret: string;

  constructor(apiKey: string, apiSecret: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  public getTokenBuyPrice(btcAmount: number, tokenSymbol: string): Promise<number> {
    const fullRequestUri = 'https://yobit.net/api/3/depth/' + tokenSymbol.toLowerCase() + '_btc';
    return new Promise((resolve, reject) => {
      axios.get(fullRequestUri).then(response => {
        const asks = response.data[tokenSymbol.toLowerCase() + '_btc'].asks;
        let sumSoFar = 0;
        for(let i = 0; i < asks.length; i++) {
          sumSoFar += asks[i][0] * asks[i][1];
          if (sumSoFar >= btcAmount) {
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
    const keySeed = parseInt(this.apiKey.substring(0,5), 16);
    const dateSeed = Date.now() / 1000;
    return Math.floor(dateSeed + keySeed);
  }

  public calculateAmountOfTokenToBuy(bitcoinBalance: number, bidRate: number): Promise<number> {
    const BITCOIN_ADJUSTMENT = 0.9975;
    return new Promise(resolve => resolve(Math.floor((bitcoinBalance / bidRate) * BITCOIN_ADJUSTMENT)));
  }

  //TODO
  public marketBuy(amountOfToken: number, tokenSymbol: string): Promise<any> {
    console.log(amountOfToken, tokenSymbol)
    return new Promise(resolve => resolve(0));
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
      }).then(response => resolve(+response.data.return.funds.btc)).catch(err => console.log(err.response.data));
    })
  }

  //TODO
  public marketSell(amountOfToken: number, tokenSymbol: string): Promise<any> {
    console.log(amountOfToken, tokenSymbol)
    return new Promise(resolve => resolve(0));
  }

  //TODO
  public limitSell(amountOfToken: number, askRate: number, tokenSymbol: string): Promise<any> {
    console.log(amountOfToken, askRate, tokenSymbol)
    return new Promise(resolve => resolve(0));
  }
}
