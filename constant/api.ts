import querystring from 'querystring';
import { IS_TESTNET } from ".";

export const API_POST_ARWEAVE_ESTIMATE = '/arweave/estimate';
export const API_POST_ARWEAVE_UPLOAD = '/arweave/upload';
export const API_POST_NUMBERS_PROTOCOL_ASSETS = '/numbers-protocol/assets';

const LIKE_CO_API_ROOT = IS_TESTNET ? 'https://api.rinkeby.like.co' : 'https://api.like.co'
export const API_LIKER_NFT_MINT = `${LIKE_CO_API_ROOT}/likernft/mint`;
export const API_LIKER_NFT_PURCHASE = `${LIKE_CO_API_ROOT}/likernft/purchase`;
export const API_LIKER_NFT_HISTORY = `${LIKE_CO_API_ROOT}/likernft/history`;
export const API_LIKER_NFT_METADATA = `${LIKE_CO_API_ROOT}/likernft/metadata`;
export const API_LIKER_NFT_MAPPING = `${LIKE_CO_API_ROOT}/like/iscn/mapping`;

export const getNftClassUriViaIscnId = (iscnId: string): string => `${LIKE_CO_API_ROOT}/likernft/metadata?iscn_id=${encodeURIComponent(iscnId)}`;
export const getNftUriViaNftId = (classId: string, nftId: string): string => `${LIKE_CO_API_ROOT}/likernft/metadata?class_id=${encodeURIComponent(classId)}&nft_id=${encodeURIComponent(nftId)}`;
export const getNftClassImage = (classId: string): string => `${LIKE_CO_API_ROOT}/likernft//image/class_${classId}.png`;
export const getLikerIdMinApi = (likerId: string): string => `${LIKE_CO_API_ROOT}/users/id/${likerId}/min`;
export const getAddressLikerIdMinApi = (wallet: string): string => `${LIKE_CO_API_ROOT}/users/addr/${wallet}/min`;
export const getLIKEPrice = () => `https://api.coingecko.com/api/v3/simple/price?ids=likecoin&vs_currencies=usd`;
export const getNFTMetadata = (iscnId: string) => {
  const qsPayload = {
    iscn_id: iscnId,
  };
  return `${LIKE_CO_API_ROOT}/likernft/metadata?${querystring.stringify(
    qsPayload,
  )}`;
};
