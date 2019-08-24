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
    const buyPriceDecimals: number = 8;
    const amountOfTokenToBuy: number = await this.exchange.calculateAmountOfTokenToBuy(btcBalance, buyPrice);
    this.exchange.marketBuy(amountOfTokenToBuy, tokenSymbol).then(() => {
      setTimeout(async () => {
        const amountOfTokensInWallet: number = await this.exchange.getAccountTokenBalance(tokenSymbol);
        const sellPrice: number = +(buyPrice * (1 + (targetGainPercent / 100))).toFixed(buyPriceDecimals);
        console.log('sellPrice', sellPrice)
        await this.exchange.limitSell(amountOfTokensInWallet, sellPrice, tokenSymbol);
      }, 1000);
    });
  }

  public async limitBuyLimitSell(btcBalance: number, tokenSymbol: string, buyingThresholdPercent: number, targetGainPercent: number) {
    const buyPrice: number = await this.exchange.getPreloadedTokenBuyPrice(tokenSymbol);
    console.log('buyPrice', buyPrice);
    const buyPricePlusPercent: number = buyPrice * (1 + (buyingThresholdPercent / 100));
    const formattedBuyPrice: number = +buyPricePlusPercent.toFixed(8);
    //const formattedBuyPrice: number = +(buyPricePlusPercent * .5).toFixed(8);
    console.log('formattedBuyPrice', formattedBuyPrice);
    const amountOfTokenToBuy: number = await this.exchange.calculateAmountOfTokenToBuy(btcBalance, formattedBuyPrice);
    console.log('amountOfTokenToBuy', amountOfTokenToBuy);
    this.exchange.limitBuy(amountOfTokenToBuy, formattedBuyPrice, tokenSymbol).then(async response => {
      const orderId = response.orderId;
      const confirmedBuyPrice = +response.price;
      console.log('confirmedBuyPrice', confirmedBuyPrice);
      const orderStatus = (await this.exchange.getOrderStatus(tokenSymbol, orderId)).status;
      console.log('orderStatus', orderStatus);
      if(orderStatus !== 'FILLED') {
        console.log('Order did not fill. Aborting.');
        await this.exchange.cancelOrder(tokenSymbol, orderId);
        process.exit();
      }
      const amountOfTokensInWallet: number = await this.exchange.getAccountTokenBalance(tokenSymbol);
      const sellPrice: number = +(confirmedBuyPrice * (1 + (targetGainPercent / 100))).toFixed(8);
      console.log('sellPrice', sellPrice)
      await this.exchange.limitSell(amountOfTokensInWallet, sellPrice, tokenSymbol);
    })
  }

}
