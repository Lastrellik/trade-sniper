"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const axios = require('axios');
const qs = require('qs');
const axios_curlirize_1 = require("axios-curlirize");
axios_curlirize_1.default(axios);
class BittrexApi {
    constructor(requestVerificationToken) {
        this.requestVerificationToken = requestVerificationToken;
    }
    getTokenBidRate(tokenSymbol) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const hostUrl = 'https://bittrex.com/api/v2.0/pub/Markets/GetMarketSummaries';
            let price;
            yield axios.get(hostUrl).then(data => price = this.parsePriceRequest(data.data, tokenSymbol));
            return price;
        });
    }
    calculateAmountOfToken(bitcoinBalance, bidRate) {
        return ((bitcoinBalance / bidRate) * .9975).toFixed(8);
    }
    buyToken(bitcoinBalance, tokenBidRate, symbol) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const amountOfToken = this.calculateAmountOfToken(+bitcoinBalance, tokenBidRate);
            axios.interceptors.request.use(request => {
                console.log('Starting Request', request);
                return request;
            });
            const data = {
                'MarketName': 'BTC-' + symbol,
                'OrderType': 'LIMIT',
                'Quantity': amountOfToken,
                'Rate': tokenBidRate,
                'TimeInEffect': 'GOOD_TIL_CANCELLED',
                '__RequestVerificationToken': this.requestVerificationToken
            };
            yield axios({
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
                    'Cookie': '__cfduid=d72c4993499e2412439af07aab77970c11561496912; cookie-banner-accepted=1; _UL=eyJVc2VyVXVpZCI6IjNkMGQ1Y2QzLTBlZmQtNGMxYi1hZmFiLWQ4MjdiMDlmMzdlMSIsIlVzZXJMb2NhbGl0eSI6MSwiVGltZXN0YW1wIjoiMjAxOS0wNi0yNlQwMTozNzo1MS41Mzg3ODA2KzAwOjAwIn0=; .AspNet.ApplicationCookie=-nLevLDHCyrxz0T20ZDRoAvgUgn-CHRBlb2N-vKbw8WKAmaA3GkXYmA5gNnfRFTsJLt8OaIwlnTuvGugtetLTiGH2b7sHi7pjGZUJTIKUx1oh_Q-sfZLfnNiJGtZ6Pq81TFvkoPuqD8DqOh0t1yXtzAfXLqT_lRWXszt5sj-njSGVt2cgMxbt7G551HCUFcXmbdlvzaO5xZ0Rb9s-2alaJmKsh1obbptC5UnSVuMZ05RqopNEoabFob7SVWDf3D8AKRn4IV5gb4XVr5ArKqo_7AaRMAl9vq5Yu7O2UkrR1iQ5rXnQ79cInccLD3amqC2yATF3GRZCmCqsdXC_JVnBJamhJWq2Hxh41ax6VM5avuTBHi-cAY93uchF8Gf84OCqHoDitA-2cDnl_h5Mack4C-JokRNZS3Vxw4TLCdeXyoi0czoAtkV2IWAasQJsB_d34Mq9pgjACA8vz9sNCpmjKDZ-vzaImAtelSpR9RjVrsA1_vcr2d9d2MRVv7mzAs1n7YCDw; __cfruid=9759e5a32412c5cfe6257f0c419ce1811d4932da-1561496915; __RequestVerificationToken=hWbz419Ql5U2yMQ5X2xTnm0v2BQ-WqMObfal6v2zCxA9Aai5migCEi0FriKwME8C4tQ9BkC6vz5UCFv9zR8cCBqHLzM1; left-nav-expanded=true; selectedBaseMarket=BTC; marketFilter=PINK'
                },
                data: qs.stringify(data)
            }).then(console.log);
        });
    }
    parsePriceRequest(jsonData, tokenSymbol) {
        return jsonData.result.filter(x => x.Market.MarketName.includes('BTC-' + tokenSymbol.toUpperCase()))[0].Summary.Ask;
    }
}
exports.BittrexApi = BittrexApi;
//# sourceMappingURL=BittrexApi.js.map