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
})
