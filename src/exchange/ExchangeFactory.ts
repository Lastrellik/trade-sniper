import { IExchange } from './IExchange';
import { BittrexExchange } from './BittrexExchange';
import { YobitExchange } from './YobitExchange';

const exchanges = {
  'bittrex': BittrexExchange,
  'yobit': YobitExchange
}

export function getExchange(exchangeName: string, apiKey: string, apiSecret: string): IExchange {
  return new exchanges[exchangeName.toLowerCase()](apiKey, apiSecret);
}
