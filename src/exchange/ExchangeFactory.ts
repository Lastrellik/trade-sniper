import { IExchange } from './IExchange';
import { BittrexExchange } from './BittrexExchange';
import { BinanceExchange } from './BinanceExchange';

const exchanges = {
  'bittrex': BittrexExchange,
  'binance': BinanceExchange
}

export function getExchange(exchangeName: string, apiKey: string, apiSecret: string): IExchange {
  return new exchanges[exchangeName.toLowerCase()](apiKey, apiSecret);
}
