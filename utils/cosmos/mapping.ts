import axios from 'axios'
import stringify from 'fast-json-stable-stringify';
import network from '@/constant/network';
import { API_LIKER_NFT_MAPPING } from '@/constant/api'
// eslint-disable-next-line import/no-extraneous-dependencies
import { OfflineSigner } from '@cosmjs/proto-signing';
// eslint-disable-next-line import/no-extraneous-dependencies
import { OfflineAminoSigner } from '@cosmjs/amino';

async function signISCNMapping(
  inputWallet: string,
  signer: any,
  iscnId: string,
  url: string,
  likerId: string,
) {
  if (!inputWallet) return null;
  const ts = Date.now();
  const payload = JSON.stringify({
    ts,
    iscnId,
    url,
    likerId,
    address: inputWallet,
  });
  const {
    signed: message,
    signature: { signature, pub_key: publicKey },
  } = await signer(payload);
  const data = {
    signature,
    publicKey: publicKey.value,
    message: stringify(message),
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

export default async function postMappingWithCosmosWallet(
  iscnId: string,
  url: string,
  likerId: string,
  signer: OfflineSigner,
  address: string,
) {
 try {
   const payload = await signISCNMapping(
    address,
    (s: any) => payloadSigner(s, signer, address),
    iscnId,
    url,
    likerId,
  )
   await axios.post(API_LIKER_NFT_MAPPING, { address, payload })
 } catch (err) {
   // eslint-disable-next-line no-console
   console.error(err);
 }
}