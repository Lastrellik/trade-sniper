"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const axios = require('axios');
const qs = require('qs');
const axios_curlirize_1 = require("axios-curlirize");
axios_curlirize_1.default(axios);
class BittrexApi {
    constructor(cookies, requestVerificationToken) {
        this.requestVerificationToken = requestVerificationToken;
        this.cookies = cookies;
    }
    getTokenBidRate(tokenSymbol) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const hostUrl = 'https://bittrex.com/api/v2.0/pub/Markets/GetMarketSummaries';
            let price;
            const adjustmentAmount = 1.05;
            yield axios.get(hostUrl).then(data => price = (+this.parsePriceRequest(data.data, tokenSymbol)) * adjustmentAmount);
            return price.toFixed(8);
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
                'TimeInEffect': 'IMMEDIATE_OR_CANCEL',
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
                    'Cookie': this.cookies
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