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

  public async limitBuyLimitSell(btcBalance: number, tokenSymbol: string) {

  }

}
