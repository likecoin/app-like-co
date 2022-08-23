const { IS_TESTNET } = process.env;

const config = {};

config.IPFS_ENDPOINT = 'https://ipfs.io:5001/api/v0';
config.REPLICA_IPFS_ENDPOINTS = [];
config.COSMOS_RPC_ENDPOINT = 'https://node.testnet.like.co/rpc/';
config.COSMOS_DENOM = IS_TESTNET ? 'nanoekil' : 'nanolike';
config.LIKE_TARGET_ADDRESS = 'like1rclg677y2jqt8x4ylj0kjlqjjmnn6w63uflpgr';

config.NUMBERS_PROTOCOL_BASE_URL = '';
config.NUMBERS_PROTOCOL_API_KEY = '';
config.NUMBERS_PROTOCOL_TOKEN = '';

config.NFT_WHITELIST_ADDRESSES = [];

config.ARWEAVE_UPLOAD_TRY_LIMIT = 5;

module.exports = config;
