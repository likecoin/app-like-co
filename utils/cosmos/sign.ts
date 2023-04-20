import network from '@/constant/network';
// eslint-disable-next-line import/no-extraneous-dependencies
import { OfflineSigner } from '@cosmjs/proto-signing';
import BigNumber from 'bignumber.js';
import stringify from 'fast-json-stable-stringify';
// eslint-disable-next-line import/no-extraneous-dependencies
import { OfflineAminoSigner } from '@cosmjs/amino';
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

async function signTextMessage(inputWallet: string, signer: any, action: string) {
  if (!inputWallet) return null;
  const ts = Date.now();
  const payload = JSON.stringify({
    action,
    likeWallet: inputWallet,
    ts,
  });
  const {
    signed: signedMessage,
    signature: { signature, pub_key: publicKey },
  } = await signer(payload);
  const data = {
    signature,
    publicKey: publicKey.value,
    message: stringify(signedMessage),
    from: inputWallet,
  };
  return data;
}

async function payloadSigner(
  signPayload: any,
  signer: OfflineSigner,
  address: string,
) {
  const message = {
    chain_id: network.id,
    memo: signPayload,
    msgs: [],
    fee: { gas: '1', amount: [{ denom: network.coinLookup[0].chainDenom, amount: '0' }] },
    sequence: '0',
    account_number: '0',
  };
  const payload = await (signer as OfflineAminoSigner).signAmino(
    address,
    message,
  );
  return { message, ...payload };
}

export function signTextAction(
  signer: OfflineSigner,
  address: string,
  action: string,
) {
  return signTextMessage(
      address,
      (s: any) => payloadSigner(s, signer, address),
      action,
  );
}
