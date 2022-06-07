import { IS_TESTNET, COSMOS_DENOM } from '.';

const mainConfig = {
  id: 'likecoin-mainnet-2',
  name: 'LikeCoin chain',
  logo: 'logo.svg',
  website: 'https://like.co',
  apiURL: 'https://mainnet-node.like.co',
  rpcURL: 'https://mainnet-node.like.co/rpc/',
  stakingWalletURL: 'https://stake.like.co',
  stakingDenom: 'LIKE',
  coinLookup: [{
      viewDenom: 'LIKE',
      chainDenom: COSMOS_DENOM,
      chainToViewConversionFactor: '0.000000001',
      icon: 'currencies/like.png',
      coinGeckoId: 'likecoin',
    }],
  addressPrefix: 'like',
  icon: 'https://like.co/logo.png',
};

const testnetConfig = {
  id: 'nft-dev',
  name: 'LikeCoin nft test chain',
  apiURL: 'https://node.nft-dev.like.co',
  rpcURL: 'https://node.nft-dev.like.co/rpc/',
  stakingWalletURL: 'https://likecoin-chain-nft-dev.netlify.app/',
};

const combinedConfig = {
  ...mainConfig,
  ...(IS_TESTNET ? testnetConfig : {}),
};

export default combinedConfig;
