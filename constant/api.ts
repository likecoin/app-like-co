import querystring from 'querystring';
import { IS_TESTNET } from ".";

export const API_POST_NUMBERS_PROTOCOL_ASSETS = '/numbers-protocol/assets';

const LIKE_CO_API_ROOT = IS_TESTNET ? 'https://api.rinkeby.like.co' : 'https://api.like.co'
const LIKECOIN_CHAIN_API = IS_TESTNET ? 'https://node.testnet.like.co' : 'https://mainnet-node.like.co';
export const LIKER_NFT_TARGET_ADDRESS = IS_TESTNET ? 'like1yney2cqn5qdrlc50yr5l53898ufdhxafqz9gxp' : 'like17m4vwrnhjmd20uu7tst7nv0kap6ee7js69jfrs';
export const API_POST_ARWEAVE_ESTIMATE = `${LIKE_CO_API_ROOT}/arweave/estimate`;
export const API_POST_ARWEAVE_UPLOAD = `${LIKE_CO_API_ROOT}/arweave/upload`;
export const API_GET_ARWEAVE_V2_PUBLIC_KEY = `${LIKE_CO_API_ROOT}/arweave/v2/public_key`;
export const API_POST_ARWEAVE_V2_ESTIMATE = `${LIKE_CO_API_ROOT}/arweave/v2/estimate`;
export const API_POST_ARWEAVE_V2_SIGN = `${LIKE_CO_API_ROOT}/arweave/v2/sign_payment_data`;
export const API_POST_ARWEAVE_V2_REGISTER = `${LIKE_CO_API_ROOT}/arweave/v2/register`;
export const API_POST_AUTHORIZE = `${LIKE_CO_API_ROOT}/wallet/authorize`
export const API_LIKER_NFT_MINT = `${LIKE_CO_API_ROOT}/likernft/mint`;
export const API_LIKER_NFT_PURCHASE = `${LIKE_CO_API_ROOT}/likernft/purchase`;
export const API_LIKER_NFT_HISTORY = `${LIKE_CO_API_ROOT}/likernft/history`;
export const API_LIKER_NFT_METADATA = `${LIKE_CO_API_ROOT}/likernft/metadata`;
export const API_LIKER_NFT_MAPPING = `${LIKE_CO_API_ROOT}/like/iscn/mapping`;

export const getNftClassUriViaIscnId = (iscnId: string): string => `${LIKE_CO_API_ROOT}/likernft/metadata?iscn_id=${encodeURIComponent(iscnId)}`;
export const getNftUriViaNftId = (classId: string, nftId: string): string => `${LIKE_CO_API_ROOT}/likernft/metadata?class_id=${encodeURIComponent(classId)}&nft_id=${encodeURIComponent(nftId)}`;
export const getNftClassImage = (classId: string): string => `${LIKE_CO_API_ROOT}/likernft/metadata/image/class_${encodeURIComponent(classId)}.png`;
export const getLikerIdMinApi = (likerId: string): string => `${LIKE_CO_API_ROOT}/users/id/${likerId}/min`;
export const getAddressLikerIdMinApi = (wallet: string): string => `${LIKE_CO_API_ROOT}/users/addr/${wallet}/min`;
export const getNftModelApi = (classId: string): string => `${LIKE_CO_API_ROOT}/likernft/metadata/model/class_${encodeURIComponent(classId)}.gltf`;
export const getLIKEPrice = () => `https://api.coingecko.com/api/v3/simple/price?ids=likecoin&vs_currencies=usd`;
export const getNFTMetadata = (iscnId: string) => {
  const qsPayload = {
    iscn_id: iscnId,
  };
  return `${LIKE_CO_API_ROOT}/likernft/metadata?${querystring.stringify(
    qsPayload,
  )}`;
};
export const getChainNFTIdList = (classId: string): string => `${LIKECOIN_CHAIN_API}/likechain/likenft/v1/owner?class_id=${classId}`
export const getUserInfoMinByAddress = (addr: string) =>
  `${LIKE_CO_API_ROOT}/users/addr/${addr}/min`;
export const getUserIsSubscribedMinterApi = (wallet: string) => `${LIKE_CO_API_ROOT}/likernft/subscription/status?wallet=${wallet}`;
export const getNewSubscriptionApi = (wallet: string) => `${LIKE_CO_API_ROOT}/likernft/subscription/stripe/new?wallet=${wallet}`;
export const getSubscriptionPortalApi = (wallet: string) => `${LIKE_CO_API_ROOT}/likernft/subscription/stripe/portal?wallet=${wallet}`;
export const getNewSubscriberMintInstanceApi = (wallet: string) => `${LIKE_CO_API_ROOT}/likernft/subscription/mint/new?wallet=${wallet}`;
export const getSubscriberMintArweaveApi = (wallet: string, statusId: string) => `${LIKE_CO_API_ROOT}/likernft/subscription/mint/${encodeURIComponent(statusId)}/arweave?wallet=${wallet}`;
export const getSubscriberMintIscnApi = (wallet: string, statusId: string) => `${LIKE_CO_API_ROOT}/likernft/subscription/mint/${encodeURIComponent(statusId)}/iscn?wallet=${wallet}`;
export const getSubscriberMintNftCoverApi = (wallet: string, statusId: string) => `${LIKE_CO_API_ROOT}/likernft/subscription/mint/${encodeURIComponent(statusId)}/nft/cover?wallet=${wallet}`;
export const getSubscriberMintNftClassApi = (wallet: string, statusId: string) => `${LIKE_CO_API_ROOT}/likernft/subscription/mint/${encodeURIComponent(statusId)}/nft/class?wallet=${wallet}`;
export const getSubscriberMintNftMintApi = (wallet: string, statusId: string) => `${LIKE_CO_API_ROOT}/likernft/subscription/mint/${encodeURIComponent(statusId)}/nft/mint?wallet=${wallet}`;
export const getSubscriberMintDoneApi = (wallet: string, statusId: string) => `${LIKE_CO_API_ROOT}/likernft/subscription/mint/${encodeURIComponent(statusId)}/done?wallet=${wallet}`;

