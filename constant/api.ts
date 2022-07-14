import { IS_TESTNET } from ".";

export const API_POST_ARWEAVE_ESTIMATE = '/arweave/estimate';
export const API_POST_ARWEAVE_UPLOAD = '/arweave/upload';
export const API_POST_NUMBERS_PROTOCOL_ASSETS = '/numbers-protocol/assets';

const LIKE_CO_API_ROOT = IS_TESTNET ? 'https://api.rinkeby.like.co' : 'https://api.like.co'
export const API_LIKER_NFT_MINT = `${LIKE_CO_API_ROOT}/likernft/mint`;
export const API_LIKER_NFT_PURCHASE = `${LIKE_CO_API_ROOT}/likernft/purchase`;
export const API_LIKER_NFT_HISTORY = `${LIKE_CO_API_ROOT}/likernft/history`;
export const API_LIKER_NFT_METADATA = `${LIKE_CO_API_ROOT}/likernft/metadata`;

export const getLikerIdMinApi = (likerId: string): string => `${LIKE_CO_API_ROOT}/users/id/${likerId}/min`;
export const getAddressLikerIdMinApi = (wallet: string): string => `${LIKE_CO_API_ROOT}/users/addr/${wallet}/min`;
