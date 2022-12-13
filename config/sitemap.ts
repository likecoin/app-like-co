import axios from 'axios';

/* Copied from constant due to nuxt.config.js is not es6 import syntax */
const { IS_TESTNET } = process.env;
const LIKECOIN_CHAIN_API = IS_TESTNET
  ? 'https://node.testnet.like.co'
  : 'https://mainnet-node.like.co';;
const getLatestISCN = `${LIKECOIN_CHAIN_API}/iscn/records?reverse=true`;
const getEarlyISCN = `${LIKECOIN_CHAIN_API}/iscn/records`;

/* actual routes logic */
export async function getSitemapRoutes() {
  const [
    latestISCNRes,
    earlyISCNRes,
  ] = await Promise.all(
    [
      getLatestISCN,
      getEarlyISCN,
    ].map(url =>
      axios.get(url).catch(err => {
        // eslint-disable-next-line no-console
        console.error(err);
        return {};
      }),
    ),
  );
  const iscnRecords: any[] = ([] as any[]).concat(
    ...[
      latestISCNRes,
      earlyISCNRes,
    ].map((r: any) => (r.data || {}).records || []),
  );
  const iscnIds = iscnRecords.map(c => c.data['@id']);
  const iscnViewPageRoutes = [...new Set(iscnIds)].map(
    id => `/view/${encodeURIComponent(id)}`,
  );
  return iscnViewPageRoutes;
}

export default getSitemapRoutes;
