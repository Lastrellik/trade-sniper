import { BittrexApi } from './BittrexApi';
const commander = require('commander');
const program = new commander.Command();

program.version('0.0.1');

program
  .option('-b, --bitcoin <number>', 'Exact amount of bitcoin in your Bittrex wallet', parseFloat)
  .option('-s, --symbol <symbol>', 'Symbol of token to purchase with full bitcoin amount')
  .option('-k, --apiKey <value>', 'Api Key from Bittrex.com')
  .option('-S, --secret <value>', 'Api Secret from Bittrex.com');

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
  console.error('You must pass the Bittrex API Secret with -s <value> or --secret <value>');
  process.exit();
}

const bittrexApi = new BittrexApi(program.apiKey, program.secret);

bittrexApi.getTokenBidRate(program.symbol).then(bidRate => bittrexApi.buyToken(program.bitcoin, bidRate, program.symbol));

