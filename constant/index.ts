export const { IS_TESTNET } = process.env;

export const TEST_MODE = process.env.NODE_ENV !== 'production' || process.env.CI;

export const DEFAULT_GAS_PRICE = [{ amount: 1000, denom: 'nanolike' }];

export const DEFAULT_GAS_PRICE_NUMBER = DEFAULT_GAS_PRICE[0].amount;

export const IPFS_ENDPOINT = 'https://ipfs.infura.io:5001/api/v0';

export const IPFS_VIEW_GATEWAY_URL = 'https://cloudflare-ipfs.com/ipfs';
