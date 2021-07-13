import { OfflineSigner, Registry } from "@cosmjs/proto-signing";
import {
  defaultRegistryTypes,
  assertIsBroadcastTxSuccess,
  SigningStargateClient,
} from "@cosmjs/stargate";
import { DEFAULT_GAS_PRICE_NUMBER } from "~/constant";
import { MsgCreateIscnRecord } from "~/constant/codec/iscn/tx";
import config from "~/constant/network";
import { ISCNSignPayload } from './iscn.type'

const registry = new Registry([
  ...defaultRegistryTypes,
  ["/likechain.iscn.MsgCreateIscnRecord", MsgCreateIscnRecord], // Replace with your own type URL and Msg class
]);

function estimateISCNTxGas() {
  const DEFAULT_GAS = 1000000; // TODO: estimate according to size
  return {
    amount: [{ amount: (DEFAULT_GAS_PRICE_NUMBER * DEFAULT_GAS).toFixed(), denom: 'nanolike' }],
    gas: DEFAULT_GAS.toFixed(),
  };
}

function formatISCNPayload(payload: ISCNSignPayload, version = 1) {
  const {
    title,
    description,
    tagsString,
    url,
    license,
    ipfsHash,
    fileSHA256,
    type,
    authorNames,
    authorUrls,
  } = payload;

  const contentFingerprints = [];
  if (fileSHA256) contentFingerprints.push(`hash://sha256/${fileSHA256}`);
  if (ipfsHash) contentFingerprints.push(`ipfs://${ipfsHash}`);
  const stakeholders = [];
  if (authorNames.length) {
    for (let i = 0; i < authorNames.length; i += 1) {
      const authorName = authorNames[i];
      const authorUrl = authorUrls[i];
      const isNonEmpty = authorUrl || authorName;
      if (isNonEmpty) {
        stakeholders.push(Buffer.from(JSON.stringify({
          entity: {
            id: authorUrl || undefined,
            name: authorName,
          },
          rewardProportion: 1,
          contributionType: 'http://schema.org/author',
        }), 'utf8'))
      }
    }
  }
  const contentMetadata = {
    "@context": "http://schema.org/",
    "@type": type,
    title,
    description,
    version,
    url,
    keywords: tagsString,
    usageInfo: license,
  };
  return {
    recordNotes: '',
    contentFingerprints,
    stakeholders,
    contentMetadata: Buffer.from(JSON.stringify(contentMetadata), 'utf8'),
  };
}

export async function signISCNTx(tx: ISCNSignPayload, signer: OfflineSigner, address: string) {
  const record = formatISCNPayload(tx);
  const client = await SigningStargateClient.connectWithSigner(
    config.rpcURL,
    signer,
    { registry }
  );

  const message = {
    typeUrl: "/likechain.iscn.MsgCreateIscnRecord",
    value: {
      from: address,
      record,
    },
  };
  const fee = await estimateISCNTxGas();
  const memo = 'app.like.co';
  const response = await client.signAndBroadcast(address, [message], fee, memo);
  assertIsBroadcastTxSuccess(response);
  return response;
}

export default signISCNTx;
