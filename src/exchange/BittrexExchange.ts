import { BID_PRECISION} from '../config';
import { IExchange } from './IExchange';
const axios = require('axios');
const CryptoJS = require('crypto-js');

export class BittrexExchange implements IExchange {
  public apiKey: string;
  public apiSecret: string;

  constructor(apiKey: string, apiSecret: string){
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  public async getTokenBuyPrice(btcAmount: number, tokenSymbol: string): Promise<number> {
    const hostUrl = 'https://api.bittrex.com/v3/markets/' + tokenSymbol + '-BTC/orderbook';
    return new Promise((resolve, reject) => {
      axios.get(hostUrl).then(data => {
        let sumSoFar = 0;
        for(var entry of data.data.ask) {
          const askRate = entry.rate;
          const amount = entry.quantity;
          sumSoFar += askRate * amount;
          if (sumSoFar >= btcAmount) {
            resolve(+askRate);
            break;
          }
        }
        reject('Bitcoin balance is too high');
      }).catch(err => reject(err));;
    });
  }

  public async getTokenSellPrice(amountOfToken: number, tokenSymbol: string): Promise<number> {
    const hostUrl = 'https://api.bittrex.com/v3/markets/' + tokenSymbol + '-BTC/orderbook';
    return new Promise((resolve, reject) => {
      axios.get(hostUrl).then(data => {
        const bids = data.data.bid;
        let amountSoFar = 0;
        for(var entry of bids) {
          const bidRate = entry.rate;
          const amount = entry.quantity;
          amountSoFar += +amount;
          if (amountSoFar >= amountOfToken) {
            resolve(bidRate);
            break;
          }
        }
        reject('Trying to sell too much of the token');
      }) 
    });
  }

  //TODO
  public async getAccountTokenBalance(tokenSymbol: string): Promise<number> {
    console.log(tokenSymbol);
    return new Promise(resolve => resolve(0));
    //IMPLEMENT ME
  }

  //TODO
  public async getAccountBTCBalance(): Promise<number> {
    return new Promise(resolve => resolve(0));
    //IMPLEMENT ME
  }

  public calculateAmountOfTokenToBuy(bitcoinBalance: number, bidRate: number): Promise<number> {
    const BITCOIN_ADJUSTMENT = 0.9975;
    return new Promise(resolve => resolve(+(((bitcoinBalance / bidRate) * BITCOIN_ADJUSTMENT).toFixed(BID_PRECISION))));
  }

  public async marketBuy(amountOfToken: number,  tokenSymbol: string) {
    const timestamp = new Date().getTime();
    const fullRequestUri = 'https://api.bittrex.com/v3/orders';
    const httpRequestMethod = 'POST';
    const data = {
      "marketSymbol": tokenSymbol + "-BTC",
      "direction": "BUY",
      "type": "MARKET",
      "quantity": amountOfToken,
      "timeInForce": "IMMEDIATE_OR_CANCEL"
    }
    const apiContentHash = this.getApiContentHash(JSON.stringify(data));
    const headers = {
      'Api-Key': this.apiKey,
      'Api-Timestamp': timestamp,
      'Api-Content-Hash': apiContentHash,
      'Api-Signature': this.getApiSignature(timestamp, fullRequestUri, httpRequestMethod, apiContentHash) 
    }
    await axios({
      url: fullRequestUri,
      method: httpRequestMethod,
      headers: headers,
      data: data
    }).then(console.log).catch(err => console.log(err.response.data));
  }

  public async limitBuy(amountOfToken: number, tokenBidRate: number,  tokenSymbol: string) {
    console.log(tokenBidRate);
    const timestamp = new Date().getTime();
    const fullRequestUri = 'https://api.bittrex.com/v3/orders';
    const httpRequestMethod = 'POST';
    const data = {
      "marketSymbol": tokenSymbol + "-BTC",
      "direction": "BUY",
      "type": "MARKET",
      "quantity": amountOfToken,
      "timeInForce": "IMMEDIATE_OR_CANCEL"
    }
    const apiContentHash = this.getApiContentHash(JSON.stringify(data));
    const headers = {
      'Api-Key': this.apiKey,
      'Api-Timestamp': timestamp,
      'Api-Content-Hash': apiContentHash,
      'Api-Signature': this.getApiSignature(timestamp, fullRequestUri, httpRequestMethod, apiContentHash) 
    }
    await axios({
      url: fullRequestUri,
      method: httpRequestMethod,
      headers: headers,
      data: data
    }).then(console.log).catch(err => console.log(err.response.data));
  }

  //TODO
  public async marketSell(amountOfToken: number, tokenSymbol: string): Promise<any> {
    const timestamp = new Date().getTime();
    const fullRequestUri = 'https://api.bittrex.com/v3/orders';
    const httpRequestMethod = 'POST';
    const data = {
      "marketSymbol": tokenSymbol + "-BTC",
      "direction": "SELL",
      "type": "MARKET",
      "quantity": amountOfToken,
      "timeInForce": "IMMEDIATE_OR_CANCEL"
    }
    const apiContentHash = this.getApiContentHash(JSON.stringify(data));
    const headers = {
      'Api-Key': this.apiKey,
      'Api-Timestamp': timestamp,
      'Api-Content-Hash': apiContentHash,
      'Api-Signature': this.getApiSignature(timestamp, fullRequestUri, httpRequestMethod, apiContentHash) 
    }
    await axios({
      url: fullRequestUri,
      method: httpRequestMethod,
      headers: headers,
      data: data
    }).then(console.log).catch(err => console.log(err.response.data));
  }
  
  //TODO
  public async limitSell(amountOfToken: number, askRate: number, tokenSymbol: string): Promise<any> {
    console.log(askRate);
    const timestamp = new Date().getTime();
    const fullRequestUri = 'https://api.bittrex.com/v3/orders';
    const httpRequestMethod = 'POST';
    const data = {
      "marketSymbol": tokenSymbol + "-BTC",
      "direction": "SELL",
      "type": "MARKET",
      "quantity": amountOfToken,
      "timeInForce": "IMMEDIATE_OR_CANCEL"
    }
    const apiContentHash = this.getApiContentHash(JSON.stringify(data));
    const headers = {
      'Api-Key': this.apiKey,
      'Api-Timestamp': timestamp,
      'Api-Content-Hash': apiContentHash,
      'Api-Signature': this.getApiSignature(timestamp, fullRequestUri, httpRequestMethod, apiContentHash) 
    }
    await axios({
      url: fullRequestUri,
      method: httpRequestMethod,
      headers: headers,
      data: data
    }).then(console.log).catch(err => console.log(err.response.data));
  }

  private getApiContentHash(content: string) {
    return CryptoJS.SHA512(content).toString(CryptoJS.enc.Hex);
  }

  private getApiSignature(timestamp: number, fullRequestUri: string, httpRequestMethod: string, apiContentHash: string) {
    const preSign = [timestamp.toString(), fullRequestUri, httpRequestMethod, apiContentHash, ''].join('');
    console.log('presign', preSign)
    return CryptoJS.HmacSHA512(preSign, this.apiSecret).toString(CryptoJS.enc.Hex);
  }

}
