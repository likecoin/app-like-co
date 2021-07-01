import network from '~/constant/network';

export function configToKeplrCoin(denom: string) {
  const c = network.coinLookup.find(coin => coin.viewDenom === denom);
  if (!c) return {};
  return {
    coinDenom: c.viewDenom,
    coinMinimalDenom: c.chainDenom,
    coinDecimals: c.chainToViewConversionFactor
      .toString()
      .split('.')[1].length,
    coinGeckoId: c.coinGeckoId,
  };
}

export default configToKeplrCoin
