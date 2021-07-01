import {  Registry } from "@cosmjs/proto-signing";
import {
  defaultRegistryTypes,
  assertIsBroadcastTxSuccess,
  SigningStargateClient,
} from "@cosmjs/stargate";
import { DEFAULT_GAS_PRICE, DEFAULT_GAS_PRICE_NUMBER } from "~/constant";
import { MsgCreateIscnRecord } from "~/constant/codec/iscn/tx";
import config from "~/constant/network";

const registry = new Registry([
  ...defaultRegistryTypes,
  ["/likechain.iscn.MsgCreateIscnRecord", MsgCreateIscnRecord], // Replace with your own type URL and Msg class
]);

function formatISCNPayload(payload, version = 1) {
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
  const stakeholders = []; // TODO: parse this
  if (authorNames.length) {
    for (let i = 0; i < authorNames.length; i += 1) {
      const authorName = authorNames[i];
      const authorUrl = authorUrls[i];
      const isNonEmpty = authorUrl || authorName;
      if (isNonEmpty) {
        stakeholders.push({
          entity: {
            id: authorUrl || undefined,
            name: authorName,
          },
          rewardProportion: 1,
          contributionType: 'http://schema.org/author',
        })
      }
    }
  }
  const keywords = tagsString;
  const usageInfo = license;
  return {
    recordNotes: '',
    contentFingerprints,
    stakeholders,
    contentMetadata: {
      "@context": "http://schema.org/",
      "@type": "CreativeWorks",
      title,
      description,
      version,
      url,
      keywords,
      usageInfo
    }
  }
}

export async function signISCNTx(tx, signer, address) {
  const record = formatISCNPayload(tx);
  const client = await SigningStargateClient.connectWithSigner(
    config.apiURL,
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
  const fee = {
    amount: [ DEFAULT_GAS_PRICE ],
    gas: DEFAULT_GAS_PRICE_NUMBER,
  };
  const memo = "Use your power wisely";
  const response = await client.signAndBroadcast(address, [message], fee, memo);
  assertIsBroadcastTxSuccess(response);
  return response;
}

export default signISCNTx;
