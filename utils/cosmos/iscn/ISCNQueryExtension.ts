// eslint-disable-next-line import/no-extraneous-dependencies
import Long from "long";
import { createProtobufRpcClient, QueryClient } from "@cosmjs/stargate";
import {
  QueryClientImpl,
  QueryRecordsByIdResponse,
  QueryRecordsByFingerprintResponse,
  QueryRecordsByOwnerResponse,
  QueryParamsResponse,
  QueryGetCidResponse,
  QueryHasCidResponse,
  QueryGetCidSizeResponse,
} from "~/constant/codec/iscn/query";

export interface ISCNExtension {
  readonly iscn: {
    readonly recordsById: (iscnId: string, fromVersion?: number, toVersion?: number) => Promise<QueryRecordsByIdResponse>;
    readonly recordsByFingerprint: (fingerprint: string, fromSequence?: number) => Promise<QueryRecordsByFingerprintResponse>;
    readonly recordsByOwner: (owner: string, fromSequence?: number) => Promise<QueryRecordsByOwnerResponse>;
    readonly params: () => Promise<QueryParamsResponse>;
    readonly getCid: (cid: string) => Promise<QueryGetCidResponse>;
    readonly hasCid: (cid: string) => Promise<QueryHasCidResponse>;
    readonly getCidSize: (cid: string) => Promise<QueryGetCidSizeResponse>;
    // readonly verified: {
    //   readonly iscn: (cid: string) => Promise<Coin | null>;
    // };
  };
}

export function setupISCNExtension(base: QueryClient): ISCNExtension {
  const rpc = createProtobufRpcClient(base);
  // Use this service to get easy typed access to query methods
  // This cannot be used for proof verification
  const queryService = new QueryClientImpl(rpc);
  return {
    iscn: {
      recordsById: (iscnId, fromVersion = 0, toVersion = 0) => queryService.RecordsById({
          iscnId,
          fromVersion: Long.fromNumber(fromVersion, true),
          toVersion: Long.fromNumber(toVersion, true),
        }),
      recordsByFingerprint: (fingerprint, fromSequence = 0) =>  queryService.RecordsByFingerprint({
        fingerprint,
        fromSequence: Long.fromNumber(fromSequence, true),
      }),
      recordsByOwner: (owner, fromSequence = 0) => queryService.RecordsByOwner({
        owner, fromSequence: Long.fromNumber(fromSequence, true),
      }),
      params: () => queryService.Params({}),
      getCid: (cid) => queryService.GetCid({ cid }),
      hasCid: (cid) => queryService.HasCid({ cid }),
      getCidSize: (cid) => queryService.GetCidSize({ cid }),
      // verified: {
      //   iscn: async (address: string, denom: string) => {
      //     // balance key is a bit tricker, using some prefix stores
      //     // https://github.com/cosmwasm/cosmos-sdk/blob/80f7ff62f79777a487d0c7a53c64b0f7e43c47b9/x/bank/keeper/view.go#L74-L77
      //     // ("balances", binAddress, denom)
      //     // it seem like prefix stores just do a dumb concat with the keys (no tricks to avoid overlap)
      //     // https://github.com/cosmos/cosmos-sdk/blob/2879c0702c87dc9dd828a8c42b9224dc054e28ad/store/prefix/store.go#L61-L64
      //     // https://github.com/cosmos/cosmos-sdk/blob/2879c0702c87dc9dd828a8c42b9224dc054e28ad/store/prefix/store.go#L37-L43
      //     const key = Uint8Array.from([...toAscii("balances"), ...toAccAddress(address), ...toAscii(denom)]);
      //     const responseData = await base.queryVerified("bank", key);
      //     return responseData.length ? Coin.decode(responseData) : null;
      //   },
      // },
    },
  };
}