const { IS_TESTNET } = process.env;

const config = {};

config.IPFS_ENDPOINT = 'https://ipfs.infura.io:5001/api/v0';
config.REPLICA_IPFS_ENDPOINTS = [];
config.COSMOS_RPC_ENDPOINT = 'https://node.nft-dev.like.co/rpc/';
config.COSMOS_DENOM = IS_TESTNET ? 'nanolike' : 'nanolike';
config.LIKE_TARGET_ADDRESS = 'like1rclg677y2jqt8x4ylj0kjlqjjmnn6w63uflpgr';

config.NUMBERS_PROTOCOL_BASE_URL = '';
config.NUMBERS_PROTOCOL_API_KEY = '';
config.NUMBERS_PROTOCOL_TOKEN = '';

module.exports = config;
