import { IExchange } from './exchange/IExchange'; export class Strategy { private exchange: IExchange; 
  constructor(exchange: IExchange) {
    this.exchange = exchange;
  }

  public async marketBuyMarketSell(btcBalance: number, tokenSymbol: string, secondsToHold: number) {
    const buyPrice: number = await this.exchange.getTokenBuyPrice(btcBalance, tokenSymbol);
    const amountOfTokenToBuy: number = await this.exchange.calculateAmountOfTokenToBuy(btcBalance, buyPrice);
    this.exchange.marketBuy(amountOfTokenToBuy, tokenSymbol).then(() => {
      setTimeout(async () => {
        const amountOfTokensInWallet: number = await this.exchange.getAccountTokenBalance(tokenSymbol);
        await this.exchange.marketSell(amountOfTokensInWallet, tokenSymbol);
      }, (secondsToHold * 1000));
    });
  }

  public async marketBuyLimitSell(btcBalance: number, tokenSymbol: string, targetGainPercent: number) {
    const buyPrice: number = await this.exchange.getTokenBuyPrice(btcBalance, tokenSymbol);
    const amountOfTokenToBuy: number = await this.exchange.calculateAmountOfTokenToBuy(btcBalance, buyPrice);
    this.exchange.marketBuy(amountOfTokenToBuy, tokenSymbol).then(() => {
      setTimeout(async () => {
        const amountOfTokensInWallet: number = await this.exchange.getAccountTokenBalance(tokenSymbol);
        const sellPrice: number = +(buyPrice * (1 + (targetGainPercent / 100)));
        console.log('sellPrice', sellPrice)
        await this.exchange.limitSell(amountOfTokensInWallet, sellPrice, tokenSymbol);
      }, 1000);
    });
  }

  public async limitBuyLimitSell(btcBalance: number, tokenSymbol: string, buyingThresholdPercent: number, targetGainPercent: number) {
    const buyPrice: number = await this.exchange.getPreloadedTokenBuyPrice(tokenSymbol);
    console.log('buyPrice', buyPrice);
    const buyPricePlusPercent: number = buyPrice * (1 + (buyingThresholdPercent / 100));
    const amountOfTokenToBuy: number = await this.exchange.calculateAmountOfTokenToBuy(btcBalance, buyPricePlusPercent);
    console.log('amountOfTokenToBuy', amountOfTokenToBuy);
    this.exchange.limitBuy(amountOfTokenToBuy, buyPricePlusPercent, tokenSymbol).then(async response => {
      const orderId = response.orderId;
      //console.log('limit buy response', response)
      const orderStatus = (await this.exchange.getOrderStatus(tokenSymbol, orderId)).status;
      console.log('orderStatus', orderStatus);
      if(orderStatus !== 'FILLED') {
        console.log('Order did not fill. Aborting.');
        await this.exchange.cancelOrder(tokenSymbol, orderId);
        process.exit();
      }
      console.log('response.fills', response.fills);
      const confirmedBuyPrice = Math.max(response.fills.map(x => +x.price));
      console.log('confirmedBuyPrice', confirmedBuyPrice);
      const amountOfTokensInWallet: number = await this.exchange.getAccountTokenBalance(tokenSymbol);
      const sellPrice: number = +(confirmedBuyPrice * (1 + (targetGainPercent / 100)));
      console.log('sellPrice', sellPrice)
      const sellResponse = await this.exchange.limitSell(amountOfTokensInWallet, sellPrice, tokenSymbol);
      const sellOrderId = sellResponse.orderId;
      let maxPriceAfterSell = confirmedBuyPrice;
      const stopLossPercent = 3;
      for(let i = 0; i < 3000000; i++) {
        await new Promise(resolve => {
          setTimeout(resolve, 1000);
        })
        await this.exchange.preloadPrices();
        const newPrice = this.exchange.getPreloadedTokenBuyPrice(tokenSymbol);
        console.log(newPrice + ' out of ' + sellPrice + ' ' + (100 * newPrice) / sellPrice);
        if(newPrice > maxPriceAfterSell) {
          console.log('new max price! ' + newPrice + ' goal price: ' + sellPrice);
          maxPriceAfterSell = newPrice;
          continue;
        }
        if((newPrice / maxPriceAfterSell) * 100 < 100 - stopLossPercent) {
          //cancel the order
          console.log('Price dropped below stop loss percent. Aborting limit sell.');
          await this.exchange.cancelOrder(tokenSymbol, sellOrderId);
          const amountOfTokensInWallet: number = await this.exchange.getAccountTokenBalance(tokenSymbol);
          await this.exchange.marketSell(amountOfTokensInWallet, tokenSymbol);
          break;
        }
        const sellOrderStatus = (await this.exchange.getOrderStatus(tokenSymbol, sellOrderId)).status;
        if(sellOrderStatus !== 'NEW') {
          console.log('Sell order filled! Pump Successful!');
          break;
        }
      }
    })
  }

}
