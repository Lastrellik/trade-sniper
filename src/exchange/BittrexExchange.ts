import { ASK_RATE_OFFSET } from '../config';
import { IExchange } from './IExchange';
import {BID_PRECISION} from '../config';
const axios = require('axios');
const CryptoJS = require('crypto-js');

export class BittrexExchange implements IExchange {
  public apiKey: string;
  public apiSecret: string;

  constructor(apiKey: string, apiSecret: string){
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  //TODO
  public async getTokenBuyPrice(btcAmount: number, tokenSymbol: string): Promise<number> {
    console.log(btcAmount)
    const hostUrl = 'https://api.bittrex.com/v3/markets/' + tokenSymbol + '-BTC/orderbook';
    let price;
    await axios.get(hostUrl).then(data => price = +this.parsePriceRequest(data.data));
    return price;
  }

  //TODO
  public async getTokenSellPrice(amountOfToken: number, tokenSymbol: string): Promise<number> {
    console.log(amountOfToken)
    const hostUrl = 'https://api.bittrex.com/v3/markets/' + tokenSymbol + '-BTC/orderbook';
    let price;
    await axios.get(hostUrl).then(data => price = +this.parsePriceRequest(data.data));
    return price;
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

  private parsePriceRequest(jsonData: any) {
    return (+jsonData.ask[ASK_RATE_OFFSET].rate).toFixed(8);
  }
}
