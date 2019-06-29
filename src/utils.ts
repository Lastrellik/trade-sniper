import {BID_PRECISION, BITCOIN_ADJUSTMENT} from './config';

export const calculateAmountOfTokenToBuy = (bitcoinBalance: number, bidRate: number) => {
  return ((bitcoinBalance / bidRate) * BITCOIN_ADJUSTMENT).toFixed(BID_PRECISION);
}
