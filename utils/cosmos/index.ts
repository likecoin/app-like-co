// eslint-disable-next-line import/no-extraneous-dependencies
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { QueryClient, BankExtension, Coin } from "@cosmjs/stargate";
import BigNumber from 'bignumber.js';

import config from '~/constant/network';
import { COSMOS_DENOM } from '~/constant';

let cosmRpcLib: any = null
let cosmLib: any = null;

async function getCosmRpcLib() {
  if (!cosmRpcLib) {
    // eslint-disable-next-line import/no-extraneous-dependencies
    cosmRpcLib = await import(/* webpackChunkName: "cosmjs" */ '@cosmjs/tendermint-rpc');
  }
  return cosmRpcLib;
}
async function getCosmLib() {
  if (!cosmLib) {
    cosmLib = await import(/* webpackChunkName: "cosmjs" */ '@cosmjs/stargate');
  }
  return cosmLib;
}

let queryClient: QueryClient & BankExtension;

async function initQueryClient() {
  const [
    cosmRpc,
    cosm,
  ] = await Promise.all([
    getCosmRpcLib(),
    getCosmLib(),
  ]);
  const tendermintClient = await cosmRpc.Tendermint34Client.connect(config.rpcURL) as Tendermint34Client;
  queryClient = cosm.QueryClient.withExtensions(
    tendermintClient,
    cosm.setupBankExtension,
  );
  return queryClient;
}

export async function getQueryClient() {
  if (!queryClient) await initQueryClient();
  return queryClient;
}

function LIKEToNanolike(value: string|number): string {
  return (new BigNumber(value)).multipliedBy(1e9).toFixed();
}

export function LIKEToAmount(value: string|number): Coin {
  return { denom: COSMOS_DENOM, amount: LIKEToNanolike(value) };
}

export function amountToLIKE(likecoin: Coin) {
  if (!likecoin) return -1;
  if (likecoin.denom === COSMOS_DENOM) {
    return (new BigNumber(likecoin.amount)).dividedBy(1e9).toFixed();
  }
  // eslint-disable-next-line no-console
  console.error(`${likecoin.denom} is not supported denom`);
  return -1;
}

export function configToKeplrCoin(denom: string) {
  const c = config.coinLookup.find(coin => coin.viewDenom === denom);
  if (!c) throw new Error('CANNOT_FIND_COIN_WIH_DENOM')
  return {
    coinDenom: c.viewDenom,
    coinMinimalDenom: c.chainDenom,
    coinDecimals: c.chainToViewConversionFactor
      .toString()
      .split('.')[1].length,
    coinGeckoId: c.coinGeckoId,
  };
}

export async function getAccountBalance(address: string) {
  const client = await getQueryClient();
  return amountToLIKE(await client.bank.balance(address, COSMOS_DENOM));
}

export function isCosmosTransactionHash(input: string) {
  return /^[0-9a-f]{64}$/i.test(input);
}
