import { IExchange } from './exchange/IExchange';
import { getExchange } from './exchange/ExchangeFactory';
import { Strategy } from './Strategy';
const commander = require('commander');
const program = new commander.Command();

program.version('0.0.1');

program
  .option('-k, --apiKey <value>', 'Api Key from the exchange')
  .option('-s, --secret <value>', 'Api Secret from the exchange')
  .option('-e, --exchange <value>', 'The name of the exchange');

program.parse(process.argv);

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
exchange.preloadPrices();
const strategy: Strategy = new Strategy(exchange);
const inquirer = require('inquirer');
const questions = [
  {
    type: 'number', 
    name: 'btcBalance',
    message: 'Enter the BTC Balance you would like to play with'
  },
  {
    type: 'number',
    name: 'threshold',
    message: 'Enter the threshold percentage before aborting pump'
  },
  {
    type: 'number',
    name: 'percent',
    message: 'Enter the target percent you would like to gain'
  },
  {
    type: 'input',
    name: 'symbol',
    message: 'Enter the symbol of the token to pump'
  }
]

inquirer.prompt(questions).then(answers => {
  strategy.limitBuyLimitSell(answers.btcBalance, answers.symbol, answers.threshold, answers.percent);
  //strategy.marketBuyLimitSell(answers.btcBalance, answers.symbol, answers.percent);
})
/*
exchange.getAccountBTCBalance().then(balance => {
  console.log('btc balance of ' + balance)
  exchange.getTokenBuyPrice(balance, program.symbol).then(price => {
    console.log('buy price of ' + price);
    exchange.calculateAmountOfTokenToBuy(balance, price).then(amount => {
      console.log('amount to buy ' + amount);
      exchange.limitBuy(amount, price, program.symbol).then(console.log);
    });
  });
})
 */

/*
exchange.getAccountTokenBalance('PINK').then(balance => {
  console.log('PINK balance of ' + balance);
  exchange.getTokenSellPrice(balance, 'PINK').then(sellPrice => {
    console.log('sell price of ' + sellPrice);
    exchange.limitSell(balance, sellPrice, 'PINK').then(console.log);
  });
})
*/

//Market buy then market sell
  /*
exchange.getAccountBTCBalance().then(balance => {
  console.log('Beginning BTC Balance ', balance);
  exchange.getTokenBuyPrice(balance, program.symbol).then(price => {
    console.log('Purchase price: ' + price);
    exchange.calculateAmountOfTokenToBuy(balance, price).then(amountToBuy => {
      console.log('Purchasing ' + amountToBuy + ' of ' + program.symbol);
      exchange.marketBuy(amountToBuy, program.symbol).then(() => {
        setTimeout(() => {
          exchange.getAccountTokenBalance(program.symbol).then(tokenBalance => {
            exchange.limitSell(Math.floor(tokenBalance), +((price * 1.1).toFixed(8)), program.symbol).then(() => {
              exchange.getAccountBTCBalance().then(newBalance => {
                console.log('Ending BTC Balance: ' + newBalance);
                console.log('Difference of ' + (newBalance - balance));
              })
            });
          })
        }, 3000);
      });
    });
  });
});
   */

// limit buy then limit sell with full btc balance
/*
exchange.getAccountBTCBalance().then(balance => {
  console.log('Beginning BTC Balance ', balance);
  exchange.getTokenBuyPrice(balance, program.symbol).then(price => {
    console.log('Purchase price: ' + price);
    exchange.calculateAmountOfTokenToBuy(balance, price).then(amountToBuy => {
      console.log('Purchasing ' + amountToBuy + ' of ' + program.symbol);
      exchange.limitBuy(amountToBuy, price, program.symbol).then(() => {
        setTimeout(() => {
          exchange.getAccountTokenBalance(program.symbol).then(tokenBalance => {
            exchange.getTokenSellPrice(tokenBalance, program.symbol).then(sellPrice => {
              exchange.limitSell(Math.floor(tokenBalance), sellPrice, program.symbol).then(() => {
                exchange.getAccountBTCBalance().then(newBalance => {
                  console.log('Ending BTC Balance: ' + newBalance);
                  console.log('Difference of ' + (newBalance - balance).toFixed(8));
                })
              });
            })
          })
        }, 5000);
      });
    });
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
