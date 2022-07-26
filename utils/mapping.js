import axios from 'axios'
import stringify from 'fast-json-stable-stringify';
import network from '@/constant/network';
import { API_LIKER_NFT_MAPPING } from '../constant/api'

async function signISCNMapping(inputWallet, signer, platform, iscnId, url, likerId) {
  if (!inputWallet) return null;
  if (![
'likeWallet',
'cosmosWallet',
].includes(platform)) {
    throw new Error('SIGN_COSMOS_LOGIN_INVALID_PLATFORM');
  }
  const ts = Date.now();
  const payload = JSON.stringify({
    ts,
    iscnId,
    url,
    likerId,
    [platform]: inputWallet,
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
    platform,
  };
  return data;
}

async function signLogin(signPayload,signer,address) {
  if (!window.keplr) throw new Error('CANNOT_FIND_KEPLR');
  window.keplr.defaultOptions = window.keplr.defaultOptions || {};
  const originalConfig = window.keplr.defaultOptions.sign || {};
  window.keplr.defaultOptions.sign = {
    ...originalConfig,
    preferNoSetFee: true,
    preferNoSetMemo: true,
  };
  const message = {
    chain_id: network.id,
    memo: signPayload,
    msgs: [],
    fee: { gas: '1', amount: [{ denom: 'nanolike', amount: '0' }] },
    sequence: '0',
    account_number: '0',
  };
  const payload = await signer.sign(
    address,
    message,
  );
  window.keplr.defaultOptions.sign = originalConfig;
  return { message, ...payload };
}

async function signByCosmosWallet(source, iscnId, url, likerId, signer, address) {
 const platform = address.startsWith('like') ? 'likeWallet' : 'cosmosWallet';
 const payload = await signISCNMapping(
   address,
   s => signLogin(s, signer, address),
   platform,
   iscnId,
   url,
   likerId,
 );
 return { platform, address, payload: { cosmosWalletSource: source, ...payload } };
}

export default async function postWithCosmosWallet(iscnId, url, likerId, signer, address) {
 try {
   const { payload } = await signByCosmosWallet('keplr', iscnId, url, likerId, signer, address);
   await axios.post(API_LIKER_NFT_MAPPING, { payload })
 } catch (err) {
   console.error(err);
 }
}