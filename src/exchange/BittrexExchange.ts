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

  public async getTokenAskRate(tokenSymbol: string): Promise<number> {
    const hostUrl = 'https://api.bittrex.com/v3/markets/' + tokenSymbol + '-BTC/orderbook';
    let price;
    await axios.get(hostUrl).then(data => price = +this.parsePriceRequest(data.data));
    return price;
  }

  public async getAccountTokenBalance(tokenSymbol: string): Promise<number> {
    console.log(tokenSymbol);
    return new Promise(resolve => resolve(0));
    //IMPLEMENT ME
  }

  public calculateAmountOfTokenToBuy(bitcoinBalance: number, bidRate: number): Promise<number> {
    const BITCOIN_ADJUSTMENT = 0.9975;
    return new Promise(resolve => resolve(+(((bitcoinBalance / bidRate) * BITCOIN_ADJUSTMENT).toFixed(BID_PRECISION))));
  }

  public async buyToken(amountOfToken: number, tokenBidRate: number,  tokenSymbol: string) {
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
  public async sellToken(amountOfToken: number, askRate: number, tokenSymbol: string) {
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

  public async getAccountBalances(): Promise<any> {
    const apiContentHash = this.getApiContentHash('');
    const timestamp = new Date().getTime();
    const fullRequestUri = 'https://api.bittrex.com/v3/balances';
    const headers = {
      'Api-Key': this.apiKey,
      'Api-Timestamp': timestamp,
      'Api-Content-Hash': apiContentHash,
      'Api-Signature': this.getApiSignature(timestamp, fullRequestUri, 'GET', apiContentHash) 
    }
    await axios({
      url: fullRequestUri,
      method: 'GET',
      headers
    }).then(console.log).catch(err => console.log(err.response.data));
  }

  public async getMarketSummaries(): Promise<any> {
    const requestUri = 'https://bittrex.com/api/v2.0/pub/markets/getMarketSummaries';
    let summaries;
    await axios(requestUri).then(response => summaries = response.data.result);
    return summaries;
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
