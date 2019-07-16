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

  //TODO
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

  //TODO
  public getTokenSellPrice(amountOfToken: number, tokenSymbol: string): Promise<number> {
    console.log(amountOfToken, tokenSymbol)
    return new Promise(resolve => resolve(0));
  }

  //TODO
  public getAccountTokenBalance(tokenSymbol: string): Promise<number> {
    console.log(tokenSymbol)
    return new Promise(resolve => resolve(0));
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

  //TODO
  public calculateAmountOfTokenToBuy(bitcoinBalance: number, bidRate: number): Promise<number> {
    console.log(bitcoinBalance, bidRate)
    return new Promise(resolve => resolve(0));
  }

  //TODO
  public marketBuy(amountOfToken: number, tokenSymbol: string): Promise<any> {
    console.log(amountOfToken, tokenSymbol)
    return new Promise(resolve => resolve(0));
  }

  //TODO
  public limitBuy(amountOfToken: number, bidRate: number, tokenSymbol: string): Promise<any> {
    console.log(amountOfToken, bidRate, tokenSymbol)
    return new Promise(resolve => resolve(0));
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
