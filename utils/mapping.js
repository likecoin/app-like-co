import axios from 'axios'
import stringify from 'fast-json-stable-stringify';
import network from '@/constant/network';
import { API_LIKER_NFT_MAPPING } from '../constant/api'

async function signISCNMapping(inputWallet, signer, iscnId, url, likerId) {
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

async function payloadSigner(signPayload, signer, address) {
  const message = {
    chain_id: network.id,
    memo: signPayload,
    msgs: [],
    fee: { gas: '1', amount: [{ denom: 'nanolike', amount: '0' }] },
    sequence: '0',
    account_number: '0',
  };
  const payload = await signer.signAmino(
    address,
    message,
  );
  return { message, ...payload };
}

async function signByCosmosWallet(iscnId, url, likerId, signer, address) {
 const payload = await signISCNMapping(
   address,
   s => payloadSigner(s, signer, address),
   iscnId,
   url,
   likerId,
 );
 return { address, payload };
}

export default async function postWithCosmosWallet(iscnId, url, likerId, signer, address) {
 try {
   const { payload } = await signByCosmosWallet(iscnId, url, likerId, signer, address);
   await axios.post(API_LIKER_NFT_MAPPING, { payload })
 } catch (err) {
   console.error(err);
 }
}