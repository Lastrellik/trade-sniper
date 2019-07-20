import { BittrexExchange } from '../src/exchange/BittrexExchange';

describe('BittrexExchange', () => {
  let bittrexExchange: BittrexExchange;
  const nock = require('nock');
  beforeAll(() => {
    bittrexExchange = new BittrexExchange('testKey', 'testSecret');
  });

  it('Correctly calculates a token buy price', async () => {
    const tokenSymbol = 'PINK';
    nock('https://api.bittrex.com')
      .get('/v3/markets/' + tokenSymbol + '-BTC/orderbook')
      .reply(200, {
        ask: [ { quantity: '528937.00914204', rate: '0.00000025'  },
          { quantity: '65573.31807022', rate: '0.00000026'  },
          { quantity: '105682.64610893', rate: '0.00000027'  },
          { quantity: '103580.35714286', rate: '0.00000028'  },
          { quantity: '51008.49925414', rate: '0.00000029'  },
          { quantity: '33132.88267564', rate: '0.00000030'  },
          { quantity: '84850.80645161', rate: '0.00000031'  },
          { quantity: '4772.67963950', rate: '0.00000032'  },
          { quantity: '54804.54933334', rate: '0.00000033'  },
          { quantity: '53677.08333333', rate: '0.00000034'  },
          { quantity: '294334.23592569', rate: '0.00000035'  },
          { quantity: '55505.48161458', rate: '0.00000036'  },
          { quantity: '34177.08333333', rate: '0.00000037'  },
          { quantity: '82122.87461042', rate: '0.00000038'  },
          { quantity: '64949.08825140', rate: '0.00000039'  },
          { quantity: '84017.37974381', rate: '0.00000040'  },
          { quantity: '7177.08333333', rate: '0.00000041'  },
          { quantity: '7177.08333333', rate: '0.00000042'  },
          { quantity: '19103.19773301', rate: '0.00000043'  },
          { quantity: '332750.74552753', rate: '0.00000044'  },
          { quantity: '57554.46566606', rate: '0.00000045'  },
          { quantity: '73265.84883390', rate: '0.00000046'  },
          { quantity: '156596.08333333', rate: '0.00000047'  },
          { quantity: '305600.05436508', rate: '0.00000048'  },
          { quantity: '377118.40952456', rate: '0.00000049'  } ]
      });
    expect(await bittrexExchange.getTokenBuyPrice(.05, tokenSymbol)).toEqual(.00000025);
  });

  it('Rejects when trying to buy with too much BTC', async () => {
    const tokenSymbol = 'PINK';
    nock('https://api.bittrex.com')
      .get('/v3/markets/' + tokenSymbol + '-BTC/orderbook')
      .reply(200, {
        ask: [ { quantity: '528937.00914204', rate: '0.00000025'  },
          { quantity: '377118.40952456', rate: '0.00000049'  } ]
      });
    return expect(bittrexExchange.getTokenBuyPrice(1000999999000.05, tokenSymbol)).rejects.toMatch('Bitcoin balance is too high');
  });

  it('Correctly calculates sell price', async () => {
    const tokenSymbol = 'PINK';
    nock('https://api.bittrex.com')
      .get('/v3/markets/' + tokenSymbol + '-BTC/orderbook')
      .reply(200, {
        bid: [ { quantity: '46837.80900423', rate: '0.00000024'  },
          { quantity: '34682.00000000', rate: '0.00000023'  },
          { quantity: '40308.30204545', rate: '0.00000022'  },
          { quantity: '233656.60250000', rate: '0.00000021'  },
          { quantity: '158303.84334829', rate: '0.00000020'  },
          { quantity: '270803.08250000', rate: '0.00000019'  },
          { quantity: '188533.95916666', rate: '0.00000018'  },
          { quantity: '129360.08338235', rate: '0.00000017'  },
          { quantity: '467576.46255884', rate: '0.00000016'  },
          { quantity: '358274.42519807', rate: '0.00000015'  },
          { quantity: '2314411.84125000', rate: '0.00000014'  },
          { quantity: '990952.90628163', rate: '0.00000013'  },
          { quantity: '1281829.12500000', rate: '0.00000012'  },
          { quantity: '970386.53954545', rate: '0.00000011'  },
          { quantity: '2163033.37200531', rate: '0.00000010'  },
          { quantity: '554166.66666667', rate: '0.00000009'  },
          { quantity: '629796.56250000', rate: '0.00000008'  },
          { quantity: '739660.00000000', rate: '0.00000007'  },
          { quantity: '1662500.00000000', rate: '0.00000006'  },
          { quantity: '997500.00000000', rate: '0.00000005'  },
          { quantity: '1246875.00000000', rate: '0.00000004'  },
          { quantity: '93000.00000000', rate: '0.00000003'  },
          { quantity: '124750.00000000', rate: '0.00000002'  },
          { quantity: '10075000.00000000', rate: '0.00000001'  } ]
      });
    expect(await bittrexExchange.getTokenSellPrice(1000, tokenSymbol)).toEqual(.00000024);
  });

  it('Rejects when trying to sell too many tokens', async () => {
    const tokenSymbol = 'PINK';
    nock('https://api.bittrex.com')
      .get('/v3/markets/' + tokenSymbol + '-BTC/orderbook')
      .reply(200, {
        bid: [ { quantity: '46837.80900423', rate: '0.00000024'  },
          { quantity: '10075000.00000000', rate: '0.00000001'  } ]
      });
    return expect(bittrexExchange.getTokenSellPrice(1000000000000000, tokenSymbol)).rejects.toMatch('Trying to sell too much of the token');
  });

  it('Gets an account balance for a given token symbol', async () => {
    const tokenSymbol = 'PINK';
    nock('https://api.bittrex.com')
      .get('/v3/balances/' + tokenSymbol)
      .reply(200, {
        total: 139.7868 
      });
    return expect(await bittrexExchange.getAccountTokenBalance(tokenSymbol)).toEqual(139.7868);
  });

  it('Returns 0 if there the balance of a given token is 0', async () => {
    const tokenSymbol = 'MLG';
    nock('https://api.bittrex.com')
      .get('/v3/balances/' + tokenSymbol)
      .reply(200, {
        total: 0
      });
    return expect(await bittrexExchange.getAccountTokenBalance(tokenSymbol)).toEqual(0);
  });

  it('Returns the correct BTC balance', async () => {
    const tokenSymbol = 'BTC';
    nock('https://api.bittrex.com')
      .get('/v3/balances/' + tokenSymbol)
      .reply(200, {
        total: 0.094549
      });
    return expect(await bittrexExchange.getAccountBTCBalance()).toEqual(0.094549);
  });

  it('Correctly calculates amount of token to buy', async () => {
    expect(await bittrexExchange.calculateAmountOfTokenToBuy(0.5, 0.0000054)).toEqual(92361.11111111);
  });

  it('Performs a market buy', async () => {
    const tokenSymbol = 'PINK';
    nock('https://api.bittrex.com')
      .post('/v3/orders')
      .reply(201, {
          id: 'b93f6ac5-77c2-4414-8ecd-101a4274b556',
          marketSymbol: 'PINK-BTC',
          direction: 'BUY',
          type: 'MARKET',
          quantity: '13635.4925',
          timeInForce: 'IMMEDIATE_OR_CANCEL',
          fillQuantity: '13635.49250000',
          commission: '0.00000715',
          proceeds: '0.00286345',
          status: 'CLOSED',
          createdAt: '2019-07-20T01:55:24.77Z',
          updatedAt: '2019-07-20T01:55:24.77Z',
          closedAt: '2019-07-20T01:55:24.77Z' 
      });

    const response = await bittrexExchange.marketBuy(13635.4925, tokenSymbol);
    expect(response['type']).toEqual('MARKET');
  });

  it('Performs a limit buy', async () => {
    const tokenSymbol = 'PINK';
    nock('https://api.bittrex.com')
      .post('/v3/orders')
      .reply(201, {
          id: '30591537-0fc2-4f10-bf26-0130252338aa',
          marketSymbol: 'PINK-BTC',
          direction: 'BUY',
          type: 'LIMIT',
          quantity: '12921.4725',
          limit: '0.00000021',
          timeInForce: 'IMMEDIATE_OR_CANCEL',
          fillQuantity: '12921.47250000',
          commission: '0.00000678',
          proceeds: '0.00271350',
          status: 'CLOSED',
          createdAt: '2019-07-20T20:04:39.55Z',
          updatedAt: '2019-07-20T20:04:39.55Z',
          closedAt: '2019-07-20T20:04:39.55Z'
      });

    const response = await bittrexExchange.limitBuy(12921.4725, 0.00000678, tokenSymbol);
    expect(response['type']).toEqual('LIMIT');
  });

  it('Performs a limit sell', async () => {
    const tokenSymbol = 'PINK';
    nock('https://api.bittrex.com')
      .post('/v3/orders')
      .reply(201, {
          id: 'c7a3c394-5246-4f18-b055-1d4859f4882d',
          marketSymbol: 'PINK-BTC',
          direction: 'SELL',
          type: 'LIMIT',
          quantity: '12921.4725',
          limit: '0.0000002',
          timeInForce: 'IMMEDIATE_OR_CANCEL',
          fillQuantity: '12921.47250000',
          commission: '0.00000646',
          proceeds: '0.00258429',
          status: 'CLOSED',
          createdAt: '2019-07-20T21:21:10.47Z',
          updatedAt: '2019-07-20T21:21:10.47Z',
          closedAt: '2019-07-20T21:21:10.47Z' 
      });
    const response = await bittrexExchange.limitSell(12921.4725, 0.0000002, tokenSymbol);
    expect(response['type']).toEqual('LIMIT');
  })

});
