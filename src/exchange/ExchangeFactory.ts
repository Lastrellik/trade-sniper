import { IExchange } from './IExchange';
import { BittrexExchange } from './BittrexExchange';
import { BinanceExchange } from './BinanceExchange';
import { YobitExchange } from './YobitExchange';

const exchanges = {
  'bittrex': BittrexExchange,
  'binance': BinanceExchange,
  'yobit': YobitExchange
}

export function getExchange(exchangeName: string, apiKey: string, apiSecret: string): IExchange {
  return new exchanges[exchangeName.toLowerCase()](apiKey, apiSecret);
}
