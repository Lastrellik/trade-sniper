"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BittrexApi_1 = require("./BittrexApi");
const commander = require('commander');
const program = new commander.Command();
program.version('0.0.1');
program
    .option('-b, --bitcoin <number>', 'Exact amount of bitcoin in your Bittrex wallet', parseFloat)
    .option('-s, --symbol <symbol>', 'Symbol of token to purchase with full bitcoin amount')
    .option('-r, --requestVerificationToken <value>', 'Token parsed from bittrex.com');
program.parse(process.argv);
if (program.symbol === undefined) {
    console.error('Symbol must be passed with -s <symbol> or --symbol <symbol>');
    process.exit();
}
if (program.bitcoin === undefined) {
    console.error('Bitcoin balance must be passed with -b <balance> or --bitcoin <balance>');
    process.exit();
}
if (program.requestVerificationToken === undefined) {
    console.error('requestVerificationToken must be passed with -r <value> or --requestVerificationToken <value>');
    process.exit();
}
const bittrexApi = new BittrexApi_1.BittrexApi(program.requestVerificationToken);
bittrexApi.getTokenBidRate(program.symbol).then(bidRate => bittrexApi.buyToken(program.bitcoin, bidRate, program.symbol));
//# sourceMappingURL=main.js.map