const axios = require('axios');
const qs = require('qs');
import curlirize from 'axios-curlirize';
curlirize(axios);

export class BittrexApi {
  private requestVerificationToken: string;
  private cookies: string;

  constructor(cookies: string, requestVerificationToken: string) {
    this.requestVerificationToken = requestVerificationToken;
    this.cookies = cookies;
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
    const amountOfToken = this.calculateAmountOfToken(+bitcoinBalance, tokenBidRate);
    axios.interceptors.request.use(request => {
        console.log('Starting Request', request)
        return request
    })
    const data = {
      'MarketName': 'BTC-' + symbol,
      'OrderType': 'LIMIT',
      'Quantity': amountOfToken,
      'Rate': tokenBidRate,
      'TimeInEffect': 'IMMEDIATE_OR_CANCEL',
      '__RequestVerificationToken': this.requestVerificationToken
    }
    await axios({
      url: 'https://bittrex.com/api/v2.0/auth/market/TradeBuy',
      method: 'post',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:67.0) Gecko/20100101 Firefox/67.0',
        'Host': 'bittrex.com',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://bittrex.com/Market/Index?MarketName=BTC-' + symbol,
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest',
        'Connection': 'keep-alive',
        'TE': 'Trailers',
        'Cookie': this.cookies
      },
      data: qs.stringify(data)
    }).then(console.log);
  }

  private parsePriceRequest(jsonData: any, tokenSymbol: string) {
    return jsonData.result.filter(x => x.Market.MarketName.includes('BTC-' + tokenSymbol.toUpperCase()))[0].Summary.Ask;
  }
}
