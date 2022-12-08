import network from '@/constant/network';
// eslint-disable-next-line import/no-extraneous-dependencies
import { OfflineSigner } from '@cosmjs/proto-signing';
import BigNumber from 'bignumber.js';
import { COSMOS_DENOM, TRANSFER_GAS, DEFAULT_GAS_PRICE_NUMBER } from '~/constant';

let cosmLib: any = null;

async function getCosmLib() {
  if (!cosmLib) {
    cosmLib = await import(/* webpackChunkName: "cosmjs" */ '@cosmjs/stargate');
  }
  return cosmLib;
}

export const DEFAULT_TRANSFER_FEE = {
  gas: TRANSFER_GAS.toString(),
  amount: [{ amount: new BigNumber(TRANSFER_GAS).multipliedBy(DEFAULT_GAS_PRICE_NUMBER).toFixed(0, 0) , denom: COSMOS_DENOM }],
};

export async function sendLIKE(
  fromAddress: string,
  toAddress: string,
  amount: string,
  signer: OfflineSigner,
  memo: string,
) {
  const cosm = await getCosmLib();
  const client = await cosm.SigningStargateClient.connectWithSigner(network.rpcURL, signer);
  const coins = [{ amount: new BigNumber(amount).shiftedBy(9).toFixed(0, 0) , denom: COSMOS_DENOM }]
  const res = await client.sendTokens(fromAddress, toAddress, coins, DEFAULT_TRANSFER_FEE, memo);
  cosm.assertIsDeliverTxSuccess(res);
  return res;
}

export default sendLIKE;
