import { IExchange } from './exchange/IExchange';
import { getExchange } from './exchange/ExchangeFactory';
const commander = require('commander');
const program = new commander.Command();

program.version('0.0.1');

program
  .option('-b, --bitcoin <number>', 'Exact amount of bitcoin in your Bittrex wallet', parseFloat)
  .option('-s, --symbol <symbol>', 'Symbol of token to purchase with full bitcoin amount')
  .option('-k, --apiKey <value>', 'Api Key from the exchange')
  .option('-S, --secret <value>', 'Api Secret from the exchange')
  .option('-e, --exchange <value>', 'The name of the exchange');

program.parse(process.argv);

if(program.symbol === undefined) {
  console.error('Symbol must be passed with -s <symbol> or --symbol <symbol>');
  process.exit();
}

if(program.bitcoin === undefined) {
  console.error('Bitcoin balance must be passed with -b <balance> or --bitcoin <balance>');
  process.exit();
}

if(program.apiKey === undefined) {
  console.error('apiKey must be passed with -k <value> or --apiKey <value>');
  process.exit();
}

if(program.secret === undefined) {
  console.error('You must pass the exchange API Secret with -s <value> or --secret <value>');
  process.exit();
}

if(program.exchange === undefined) {
  console.error('You must pass the exchange with -e <value> or --exchange <value>');
  process.exit();
}

const exchange: IExchange = getExchange(program.exchange, program.apiKey, program.secret);
exchange.getAccountTokenBalance('NLG').then(console.log);
//exchange.getTokenBuyPrice(program.bitcoin, program.symbol).then(console.log);
//exchange.getAccountTokenBalance(program.symbol).then(console.log);

//Market buy then market sell
/*
exchange.getAccountBTCBalance().then(balance => {
  exchange.getTokenBuyPrice(balance, program.symbol).then(price => {
    exchange.calculateAmountOfTokenToBuy(balance, price).then(amountToBuy => {
      exchange.marketBuy(amountToBuy, program.symbol).then(() => {
        setTimeout(() => {
          exchange.getAccountTokenBalance(program.symbol).then(tokenBalance => {
            exchange.marketSell(Math.floor(tokenBalance), program.symbol);
          })
        }, 10000);
      });
    });
  });
});
 */

// limit buy then limit sell with full btc balance
/*
exchange.getTokenBuyPrice(program.bitcoin, program.symbol).then(price => {
  console.log('Would have bought at ' + price);
  exchange.getTokenSellPrice(100, program.symbol).then(sellPrice => {
    console.log('Would have sold at ' + sellPrice);
  });
});
 */

//limit buy then limit sell with passed btc balance
/*
exchange.getTokenBuyPrice(program.bitcoin, program.symbol).then(price => {
  exchange.calculateAmountOfTokenToBuy(program.bitcoin, price).then(amountToBuy => {
    exchange.limitBuy(amountToBuy, price, program.symbol).then(() => {
      setTimeout(() => {
        exchange.getAccountTokenBalance(program.symbol).then(tokenBalance => {
          exchange.getTokenSellPrice(tokenBalance, program.symbol).then(sellPrice => {
            exchange.limitSell(Math.floor(tokenBalance), sellPrice, program.symbol);
          });
        })
      }, 10000);
    });
  });
});
 */

// limit buy 
/*
exchange.getAccountBTCBalance().then(balance => {
  exchange.getTokenBuyPrice(balance, program.symbol).then(price => {
    exchange.calculateAmountOfTokenToBuy(balance, price).then(amountToBuy => {
      console.log('buying ', amountToBuy);
      exchange.limitBuy(amountToBuy, price, program.symbol);
    });
  });
});
 */
