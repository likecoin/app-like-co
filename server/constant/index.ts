const { COSMOS_RPC_ENDPOINT: configRpc} = require('../config/config')

export const { IS_TESTNET } = process.env;

export const COINGECKO_PRICE_API = 'https://api.coingecko.com/api/v3/simple/price?ids=arweave,likecoin&vs_currencies=usd';

export const COSMOS_RPC_ENDPOINT = configRpc || (IS_TESTNET ? 'https://node.iscn-dev-2.like.co/rpc/' : 'https://mainnet-node.like.co/rpc/')

export const UPLOAD_FILESIZE_MAX = 100 * 1024 * 1024; // 100MB
