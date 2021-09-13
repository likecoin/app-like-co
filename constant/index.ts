export const { IS_TESTNET } = process.env;

export const TEST_MODE = process.env.NODE_ENV !== 'production' || process.env.CI;

export const COSMOS_DENOM = 'nanolike';

export const DEFAULT_GAS_PRICE = [{ amount: 1000, denom: COSMOS_DENOM }];

export const DEFAULT_GAS_PRICE_NUMBER = DEFAULT_GAS_PRICE[0].amount;

export const GAS_ESTIMATOR_BUFFER = 50000;
export const GAS_ESTIMATOR_SLOP = 3.58;
export const GAS_ESTIMATOR_INTERCEPT = 99443.87;

export const IPFS_ENDPOINT = 'https://ipfs.infura.io:5001/api/v0';

export const IPFS_VIEW_GATEWAY_URL = 'https://cloudflare-ipfs.com/ipfs';

export const ISCN_MIN_BALANCE = 0.01;

export const ISCN_GAS_FEE = 200000;

export const ISCN_REGISTRY_NAME = 'likecoin-chain';

export const ISCN_PREFIX = `iscn://${ISCN_REGISTRY_NAME}`;

export const LIKER_LAND_URL = 'https://liker.land/'

export const RAWDATA_URL_PRODUCTION = 'https://mainnet-node.like.co/txs?iscn_record.iscn_id='
export const RAWDATA_URL_STAGING = 'https://node.iscn-dev-2.like.co/txs?iscn_record.iscn_id='

export const BIG_DIPPER_TRANSACTIONS = 'https://likecoin.bigdipper.live/transactions/'
