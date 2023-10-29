export const { IS_TESTNET } = process.env;

export const TEST_MODE = process.env.NODE_ENV !== 'production' || process.env.CI;

export const COSMOS_DENOM = IS_TESTNET ? 'nanoekil' : 'nanolike';

export const DEFAULT_GAS_PRICE = [{ amount: 1000, denom: COSMOS_DENOM }];
export const DEFAULT_GAS_PRICE_NUMBER = DEFAULT_GAS_PRICE[0].amount;
export const TRANSFER_GAS = 100000;

export const GAS_ESTIMATOR_BUFFER = 50000;
export const GAS_ESTIMATOR_SLOP = 3.58;
export const GAS_ESTIMATOR_INTERCEPT = 99443.87;

export const IPFS_VIEW_GATEWAY_URL = 'https://ipfs.io/ipfs';

export const ISCN_MIN_BALANCE = 0.01;

export const ISCN_GAS_FEE = 200000;
export const ISCN_GAS_MULTIPLIER = 1.5;

export const ISCN_REGISTRY_NAME = 'likecoin-chain';

export const ISCN_PREFIX = `iscn://${ISCN_REGISTRY_NAME}`;

export const LIKER_LAND_URL = IS_TESTNET ? 'https://rinkeby.liker.land' : 'https://liker.land';

export const RAWDATA_URL = {
  testnet: 'https://node.testnet.like.co/iscn/records/id?iscn_id=',
  production: 'https://mainnet-node.like.co/iscn/records/id?iscn_id=',
}

export const RAWDATA_TX_URLS = {
  testnet: ['https://node.testnet.like.co/cosmos/tx/v1beta1/txs?events=message.action=\'/likechain.iscn.MsgCreateIscnRecord\'&events=iscn_record.iscn_id='],
  production: [
    'https://mainnet-node.like.co/cosmos/tx/v1beta1/txs?events=message.action=\'create_iscn_record\'&events=iscn_record.iscn_id=',
    'https://mainnet-node.like.co/cosmos/tx/v1beta1/txs?events=message.action=\'/likechain.iscn.MsgCreateIscnRecord\'&events=iscn_record.iscn_id=',
  ],
}

export const ISCN_RAW_DATA_ENDPOINT = IS_TESTNET
  ? RAWDATA_URL.testnet
  : RAWDATA_URL.production

export const ISCN_TX_RAW_DATA_ENDPOINTS = IS_TESTNET
  ? RAWDATA_TX_URLS.testnet
  : RAWDATA_TX_URLS.production

export const BIG_DIPPER_TX_BASE_URL = 'https://likecoin.bigdipper.live/transactions/';

export const LIKER_LAND_APP_URI = 'com.oice://';

export const WALLET_TYPE_REPLACER: any = { cosmos: 'Cosmos Wallet', like:'LikeCoin Wallet', eth: 'Ethereum Wallet' }

export const WALLET_TYPES = [
  'like',
  'cosmos',
  'btc',
  'eth',
]

export const SAME_AS_FILE_TYPES = [
  'epub',
  'pdf',
  'mp3',
  'jpg',
  'png',
]

export const SITE_URL = IS_TESTNET ? 'https://app.rinkeby.like.co' : 'https://app.like.co';

export const CONNECT_WALLET_TYPES = [
  'keplr',
  'likerland_app',
];

export const WHITELISTED_PLATFORM = [
  'wordpress',
  'illustbuy',
  'likersocial',
];

export const EMAIL_REGEX = /(\S)+[@]{1}(\S)+[.]{1}(\w)+/

export const COSMOS_ADDRESS_REGEX = /^cosmos1[ac-hj-np-z02-9]{38}$/

export const OSMOSIS_ADDRESS_REGEX = /^osmo1[ac-hj-np-z02-9]{38}$/

export const CRAWL_URL_REGEX = /^https?:\/\//i

export const ISCN_PREFIX_REGEX = /^iscn:\/\/likecoin-chain/i

// NOTE: Remember to update blog post URL with i18n key `ChainUpgrade` when changing this
export const IS_CHAIN_UPGRADING = false;

export const LIKER_NFT_API_WALLET = IS_TESTNET ? 'like1yney2cqn5qdrlc50yr5l53898ufdhxafqz9gxp' : 'like17m4vwrnhjmd20uu7tst7nv0kap6ee7js69jfrs';

export const LIKER_NFT_FEE_WALLET = IS_TESTNET ? 'like1yney2cqn5qdrlc50yr5l53898ufdhxafqz9gxp' : 'like10ywsmztkxjl55xarxnhlxwc83z9v2hkxtsajwl';

export const DEFAULT_AVATAR = 'https://static.like.co/likecoin_de-portrait.jpg';

export const LIKECOIN_CHAIN_ID = IS_TESTNET
  ? 'likecoin-public-testnet-5'
  : 'likecoin-mainnet-2';

export const LIKECOIN_CHAIN_NFT_RPC = IS_TESTNET
? 'https://node.testnet.like.co/rpc/'
: 'https://mainnet-node.like.co/rpc/';

export const LIKECOIN_CHAIN_API = IS_TESTNET
? 'https://node.testnet.like.co'
: 'https://mainnet-node.like.co';

export const LIKECOIN_CHAIN_DENOM = IS_TESTNET ? 'EKIL' : 'LIKE';

export const LIKECOIN_CHAIN_MIN_DENOM = IS_TESTNET ? 'nanoekil' : 'nanolike';

export const LIKECOIN_CHAIN_STAKING_ENDPOINT = IS_TESTNET
  ? 'https://likecoin-public-testnet-5.netlify.app/validators'
  : 'https://dao.like.co/validators';

export const UPLOAD_FILESIZE_MAX = 200 * 1024 * 1024; // 200MB
