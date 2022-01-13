export const { IS_TESTNET } = process.env;

export const TEST_MODE = process.env.NODE_ENV !== 'production' || process.env.CI;

export const COSMOS_DENOM = 'nanolike';

export const DEFAULT_GAS_PRICE = [{ amount: 1000, denom: COSMOS_DENOM }];
export const DEFAULT_GAS_PRICE_NUMBER = DEFAULT_GAS_PRICE[0].amount;
export const TRANSFER_GAS = 100000;

export const GAS_ESTIMATOR_BUFFER = 50000;
export const GAS_ESTIMATOR_SLOP = 3.58;
export const GAS_ESTIMATOR_INTERCEPT = 99443.87;

export const IPFS_ENDPOINT = 'https://ipfs.infura.io:5001/api/v0';

export const IPFS_VIEW_GATEWAY_URL = 'https://cloudflare-ipfs.com/ipfs';

export const ISCN_MIN_BALANCE = 0.01;

export const ISCN_GAS_FEE = 200000;

export const ISCN_REGISTRY_NAME = 'likecoin-chain';

export const ISCN_PREFIX = `iscn://${ISCN_REGISTRY_NAME}`;

export const LIKER_LAND_URL = 'https://liker.land/';

export const RAWDATA_URL = {
  testnet: 'https://node.iscn-dev-2.like.co/iscn/records/id?iscn_id=',
  production: 'https://mainnet-node.like.co/iscn/records/id?iscn_id=',
}

export const RAWDATA_TX_URL = {
  testnet: 'https://node.iscn-dev-2.like.co/txs?iscn_record.iscn_id=',
  production: 'https://mainnet-node.like.co/txs?iscn_record.iscn_id=',
}

export const ISCN_RAW_DATA_ENDPOINT = IS_TESTNET
  ? RAWDATA_URL.testnet
  : RAWDATA_URL.production

export const ISCN_TX_RAW_DATA_ENDPOINT = IS_TESTNET
  ? RAWDATA_TX_URL.testnet
  : RAWDATA_TX_URL.production

export const BIG_DIPPER_TX_BASE_URL = 'https://likecoin.bigdipper.live/transactions/';

export const WALLET_TYPE_REPLACER: any = { cosmos: 'Cosmos Wallet', eth: 'Ethereum Wallet' }

export const WALLET_TYPES = [
  'cosmos',
  'btc',
  'eth',
]

export const SITE_URL = IS_TESTNET ? 'https://app.rinkeby.like.co' : 'https://app.like.co';

export const CONNECT_WALLET_TYPES = [
  'keplr',
  'likerland_app',
];

export const EMAIL_REGEX = /(\S)+[@]{1}(\S)+[.]{1}(\w)+/

export const COSMOS_ADDRESS_REGEX = /cosmos1[ac-hj-np-z02-9]{38}$/

export const OSMOSIS_ADDRESS_REGEX = /osmo1[ac-hj-np-z02-9]{38}$/

export const AIRDROP_CLAIM_URL = {
  testnet: 'https://airdrop.rinkeby.like.co/api/claims?address=',
  production: 'https://airdrop.like.co/api/claims?address=',
}

export const AIRDROP_OVERVIEW_URL = {
  testnet: 'https://airdrop.rinkeby.like.co/api/overview?address=',
  production: 'https://airdrop.like.co/api/overview?address=',
}

export const AIRDROP_SUBSCRIBE_URL = {
  testnet: 'https://airdrop.rinkeby.like.co/api/subscribe',
  production: 'https://airdrop.like.co/api/subscribe',
}

export const AIRDROP_CLAIM = IS_TESTNET
  ? AIRDROP_CLAIM_URL.testnet
  : AIRDROP_CLAIM_URL.production

export const AIRDROP_OVERVIEW = IS_TESTNET
  ? AIRDROP_OVERVIEW_URL.testnet
  : AIRDROP_OVERVIEW_URL.production

export const AIRDROP_SUBSCRIBE = IS_TESTNET
  ? AIRDROP_SUBSCRIBE_URL.testnet
  : AIRDROP_SUBSCRIBE_URL.production
