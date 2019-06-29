import { ASK_RATE_OFFSET } from '../config';
import { calculateAmountOfTokenToBuy } from '../utils';
const axios = require('axios');
const CryptoJS = require('crypto-js');

export class BittrexExchange {
  private apiKey: string;
  private apiSecret: string;

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

  public async buyToken(bitcoinBalance: number, tokenBidRate: number,  tokenSymbol: string) {
    const timestamp = new Date().getTime();
    const fullRequestUri = 'https://api.bittrex.com/v3/orders';
    const httpRequestMethod = 'POST';
    const amountOfToken = calculateAmountOfTokenToBuy(bitcoinBalance, tokenBidRate);
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
