import { BittrexApi } from './BittrexApi';
const commander = require('commander');
const program = new commander.Command();

program.version('0.0.1');

program
  .option('-b, --bitcoin <number>', 'Exact amount of bitcoin in your Bittrex wallet', parseFloat)
  .option('-s, --symbol <symbol>', 'Symbol of token to purchase with full bitcoin amount')
  .option('-r, --requestVerificationToken <value>', 'Token parsed from bittrex.com')
  .option('-c, --cookies <value>', 'Cookies parsed from bittrex.com');

program.parse(process.argv);

if(program.symbol === undefined) {
  console.error('Symbol must be passed with -s <symbol> or --symbol <symbol>');
  process.exit();
}

if(program.bitcoin === undefined) {
  console.error('Bitcoin balance must be passed with -b <balance> or --bitcoin <balance>');
  process.exit();
}

if(program.requestVerificationToken === undefined) {
  console.error('requestVerificationToken must be passed with -r <value> or --requestVerificationToken <value>');
  process.exit();
}

if(program.cookies === undefined) {
  console.error('You must pass the request cookies with -c <value> or --cookies <value>');
  process.exit();
}

const bittrexApi = new BittrexApi(program.cookies, program.requestVerificationToken);

bittrexApi.getTokenBidRate(program.symbol).then(bidRate => bittrexApi.buyToken(program.bitcoin, bidRate.toFixed(8), program.symbol));

