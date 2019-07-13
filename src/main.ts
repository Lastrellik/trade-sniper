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

//exchange.getAccountTokenBalance(program.symbol).then(console.log);
exchange.getTokenAskRate(program.symbol).then(askRate => {
  exchange.calculateAmountOfTokenToBuy(program.bitcoin, askRate).then(amountOfToken => {
    exchange.buyToken(amountOfToken, askRate, program.symbol).then(() => {
      setTimeout(() => {
        exchange.getAccountTokenBalance(program.symbol).then(tokenBalance => {
          exchange.sellToken(Math.floor(tokenBalance), 0, program.symbol);
        })
      }, 8000);
    });
  })
});
