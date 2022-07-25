import axios from 'axios'
import Keplr from './Keplr';
import User from './User';
import { API_LIKER_NFT_MAPPING } from '../constant/api'

async function signByCosmosWallet(source, iscnId, url, likerId) {
 await Keplr.initKeplr();
 const wallet = await Keplr.getWalletAddress();
 const platform = wallet.startsWith('like') ? 'likeWallet' : 'cosmosWallet';
 const payload = await User.signCosmosMapping(
   wallet,
   s => Keplr.signLogin(s),
   platform,
   iscnId, 
   url, 
   likerId,
 );
 return { platform, wallet, payload: { cosmosWalletSource: source, ...payload } };
}

export default async function postWithCosmosWallet(iscnId, url, likerId) {
 try {
   const { payload } = await signByCosmosWallet('keplr', iscnId, url, likerId);
   await axios.post(API_LIKER_NFT_MAPPING, { payload })
 } catch (err) {
   console.error(err);
 }
}