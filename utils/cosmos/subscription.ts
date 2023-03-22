import stringify from 'fast-json-stable-stringify';
import network from '@/constant/network';
// eslint-disable-next-line import/no-extraneous-dependencies
import { OfflineSigner } from '@cosmjs/proto-signing';
// eslint-disable-next-line import/no-extraneous-dependencies
import { OfflineAminoSigner } from '@cosmjs/amino';

async function signSubscriptionMessage(inputWallet: string, signer: any, action: string) {
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

export default function signSubscriptionAction(
  signer: OfflineSigner,
  address: string,
  action: string,
) {
  return signSubscriptionMessage(
      address,
      (s: any) => payloadSigner(s, signer, address),
      action,
  );
}