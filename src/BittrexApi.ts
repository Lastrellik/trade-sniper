const axios = require('axios');
const CryptoJS = require('crypto-js');

export class BittrexApi {
  private apiKey: string;
  private apiSecret: string;

  constructor(apiKey: string, apiSecret: string){
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  public async getTokenBidRate(tokenSymbol: string) {
    const hostUrl = 'https://bittrex.com/api/v2.0/pub/Markets/GetMarketSummaries';
    let price;
    const adjustmentAmount = 1.05
    await axios.get(hostUrl).then(data => price = (+this.parsePriceRequest(data.data, tokenSymbol)) * adjustmentAmount);
    return price.toFixed(8);
  }

  public calculateAmountOfToken(bitcoinBalance: number, bidRate: number) {
    return ((bitcoinBalance / bidRate) * .9975).toFixed(8);
  }

  public async buyToken(bitcoinBalance: string, tokenBidRate: number,  symbol: string) {
    const timestamp = new Date().getTime();
    const fullRequestUri = 'https://api.bittrex.com/v3/orders';
    const httpRequestMethod = 'POST';
    const amountOfToken = this.calculateAmountOfToken(+bitcoinBalance, tokenBidRate);
    const data = {
      "marketSymbol": symbol + "-BTC",
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
    console.log(headers);
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

  private parsePriceRequest(jsonData: any, tokenSymbol: string) {
    return jsonData.result.filter(x => x.Market.MarketName.includes('BTC-' + tokenSymbol.toUpperCase()))[0].Summary.Ask;
  }
}
