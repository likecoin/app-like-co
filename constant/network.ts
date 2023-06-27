import {
  IS_TESTNET,
  LIKECOIN_CHAIN_ID,
  LIKECOIN_CHAIN_NFT_RPC,
  LIKECOIN_CHAIN_API,
  LIKECOIN_CHAIN_DENOM,
  LIKECOIN_CHAIN_MIN_DENOM,
  LIKECOIN_CHAIN_STAKING_ENDPOINT,
} from '.'

const mainConfig = {
  id: 'likecoin-mainnet-2',
  name: 'LikeCoin',
  logo: 'logo.svg',
  website: 'https://like.co',
  apiURL: 'https://mainnet-node.like.co',
  rpcURL: 'https://mainnet-node.like.co/rpc/',
  stakingWalletURL: 'https://stake.like.co',
  stakingDenom: 'LIKE',
  coinLookup: [{
      viewDenom: 'LIKE',
      chainDenom: 'nanolike',
      chainToViewConversionFactor: '0.000000001',
      icon: 'currencies/like.png',
      coinGeckoId: 'likecoin',
    }],
  addressPrefix: 'like',
  icon: 'https://like.co/logo.png',
};

const testnetConfig = {
  id: 'likecoin-public-testnet-5',
  name: 'LikeCoin public test chain',
  apiURL: 'https://node.testnet.like.co',
  rpcURL: 'https://node.testnet.like.co/rpc/',
  stakingWalletURL: 'https://likecoin-public-testnet-5.netlify.app/',
  stakingDenom: 'EKIL',
  coinLookup: [{
      viewDenom: 'EKIL',
      chainDenom: 'nanoekil',
      chainToViewConversionFactor: '0.000000001',
      icon: 'currencies/like.png',
      coinGeckoId: 'likecoin',
    }],
};

export const LIKECOIN_WALLET_CONNECTOR_CONFIG = {
  chainId: LIKECOIN_CHAIN_ID,
  chainName: IS_TESTNET ? 'LikeCoin public test chain' : 'LikeCoin',
  rpcURL: LIKECOIN_CHAIN_NFT_RPC,
  restURL: LIKECOIN_CHAIN_API,
  coinType: 118,
  coinDenom: LIKECOIN_CHAIN_DENOM,
  coinMinimalDenom: LIKECOIN_CHAIN_MIN_DENOM,
  coinDecimals: 9,
  coinGeckoId: IS_TESTNET ? '' : 'likecoin',
  walletURLForStaking: LIKECOIN_CHAIN_STAKING_ENDPOINT,
  bech32PrefixAccAddr: 'like',
  bech32PrefixAccPub: 'likepub',
  bech32PrefixValAddr: 'likevaloper',
  bech32PrefixValPub: 'likevaloperpub',
  bech32PrefixConsAddr: 'likevalcons',
  bech32PrefixConsPub: 'likevalconspub',
  availableMethods: [
    'keplr',
    'cosmostation',
    'cosmostation-mobile',
    'liker-id',
    'walletconnect-v2',
  ],
  keplrInstallCTAPreset: 'fancy-banner',
  likerLandAppWCBridge: 'https://wc-bridge-1.like.co',
  cosmostationDirectSignEnabled: true,
  walletConnectProjectId: 'e110ac49451fee41d5bcda1b0dfdb94e',
  walletConnectMetadata: {
    description: 'Register a Writing NFT for your content, publish your stories as collectibles.',
    url: 'https://app.like.co',
    icons: ['https://like.co/logo.png'],
    name: 'app.like.co',
  },
};

const combinedConfig = {
  ...mainConfig,
  ...(IS_TESTNET ? testnetConfig : {}),
};

export default combinedConfig;
