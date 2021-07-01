/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";
import { Params } from "../iscn/params";

export const protobufPackage = "likechain.iscn";

export interface QueryResponseRecord {
  ipld: string;
  data: Uint8Array;
}

export interface QueryRecordsByIdRequest {
  iscnId: string;
  fromVersion: Long;
  toVersion: Long;
}

export interface QueryRecordsByIdResponse {
  owner: string;
  latestVersion: Long;
  records: QueryResponseRecord[];
}

export interface QueryRecordsByFingerprintRequest {
  fingerprint: string;
  fromSequence: Long;
}

export interface QueryRecordsByFingerprintResponse {
  records: QueryResponseRecord[];
  nextSequence: Long;
}

export interface QueryRecordsByOwnerRequest {
  owner: string;
  fromSequence: Long;
}

export interface QueryRecordsByOwnerResponse {
  records: QueryResponseRecord[];
  nextSequence: Long;
}

export interface QueryParamsRequest {}

export interface QueryParamsResponse {
  params?: Params;
}

export interface QueryGetCidRequest {
  cid: string;
}

export interface QueryGetCidResponse {
  data: Uint8Array;
}

export interface QueryGetCidSizeRequest {
  cid: string;
}

export interface QueryGetCidSizeResponse {
  size: Long;
}

export interface QueryHasCidRequest {
  cid: string;
}

export interface QueryHasCidResponse {
  exist: boolean;
}

const baseQueryResponseRecord: object = { ipld: "" };

export const QueryResponseRecord = {
  encode(
    message: QueryResponseRecord,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.ipld !== "") {
      writer.uint32(10).string(message.ipld);
    }
    if (message.data.length !== 0) {
      writer.uint32(18).bytes(message.data);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueryResponseRecord {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseQueryResponseRecord } as QueryResponseRecord;
    message.data = new Uint8Array();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.ipld = reader.string();
          break;
        case 2:
          message.data = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryResponseRecord {
    const message = { ...baseQueryResponseRecord } as QueryResponseRecord;
    message.data = new Uint8Array();
    if (object.ipld !== undefined && object.ipld !== null) {
      message.ipld = String(object.ipld);
    } else {
      message.ipld = "";
    }
    if (object.data !== undefined && object.data !== null) {
      message.data = bytesFromBase64(object.data);
    }
    return message;
  },

  toJSON(message: QueryResponseRecord): unknown {
    const obj: any = {};
    message.ipld !== undefined && (obj.ipld = message.ipld);
    message.data !== undefined &&
      (obj.data = base64FromBytes(
        message.data !== undefined ? message.data : new Uint8Array()
      ));
    return obj;
  },

  fromPartial(object: DeepPartial<QueryResponseRecord>): QueryResponseRecord {
    const message = { ...baseQueryResponseRecord } as QueryResponseRecord;
    if (object.ipld !== undefined && object.ipld !== null) {
      message.ipld = object.ipld;
    } else {
      message.ipld = "";
    }
    if (object.data !== undefined && object.data !== null) {
      message.data = object.data;
    } else {
      message.data = new Uint8Array();
    }
    return message;
  },
};

const baseQueryRecordsByIdRequest: object = {
  iscnId: "",
  fromVersion: Long.UZERO,
  toVersion: Long.UZERO,
};

export const QueryRecordsByIdRequest = {
  encode(
    message: QueryRecordsByIdRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.iscnId !== "") {
      writer.uint32(10).string(message.iscnId);
    }
    if (!message.fromVersion.isZero()) {
      writer.uint32(16).uint64(message.fromVersion);
    }
    if (!message.toVersion.isZero()) {
      writer.uint32(24).uint64(message.toVersion);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryRecordsByIdRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseQueryRecordsByIdRequest,
    } as QueryRecordsByIdRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.iscnId = reader.string();
          break;
        case 2:
          message.fromVersion = reader.uint64() as Long;
          break;
        case 3:
          message.toVersion = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryRecordsByIdRequest {
    const message = {
      ...baseQueryRecordsByIdRequest,
    } as QueryRecordsByIdRequest;
    if (object.iscnId !== undefined && object.iscnId !== null) {
      message.iscnId = String(object.iscnId);
    } else {
      message.iscnId = "";
    }
    if (object.fromVersion !== undefined && object.fromVersion !== null) {
      message.fromVersion = Long.fromString(object.fromVersion);
    } else {
      message.fromVersion = Long.UZERO;
    }
    if (object.toVersion !== undefined && object.toVersion !== null) {
      message.toVersion = Long.fromString(object.toVersion);
    } else {
      message.toVersion = Long.UZERO;
    }
    return message;
  },

  toJSON(message: QueryRecordsByIdRequest): unknown {
    const obj: any = {};
    message.iscnId !== undefined && (obj.iscnId = message.iscnId);
    message.fromVersion !== undefined &&
      (obj.fromVersion = (message.fromVersion || Long.UZERO).toString());
    message.toVersion !== undefined &&
      (obj.toVersion = (message.toVersion || Long.UZERO).toString());
    return obj;
  },

  fromPartial(
    object: DeepPartial<QueryRecordsByIdRequest>
  ): QueryRecordsByIdRequest {
    const message = {
      ...baseQueryRecordsByIdRequest,
    } as QueryRecordsByIdRequest;
    if (object.iscnId !== undefined && object.iscnId !== null) {
      message.iscnId = object.iscnId;
    } else {
      message.iscnId = "";
    }
    if (object.fromVersion !== undefined && object.fromVersion !== null) {
      message.fromVersion = object.fromVersion as Long;
    } else {
      message.fromVersion = Long.UZERO;
    }
    if (object.toVersion !== undefined && object.toVersion !== null) {
      message.toVersion = object.toVersion as Long;
    } else {
      message.toVersion = Long.UZERO;
    }
    return message;
  },
};

const baseQueryRecordsByIdResponse: object = {
  owner: "",
  latestVersion: Long.UZERO,
};

export const QueryRecordsByIdResponse = {
  encode(
    message: QueryRecordsByIdResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.owner !== "") {
      writer.uint32(10).string(message.owner);
    }
    if (!message.latestVersion.isZero()) {
      writer.uint32(16).uint64(message.latestVersion);
    }
    for (const v of message.records) {
      QueryResponseRecord.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryRecordsByIdResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseQueryRecordsByIdResponse,
    } as QueryRecordsByIdResponse;
    message.records = [];
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.owner = reader.string();
          break;
        case 2:
          message.latestVersion = reader.uint64() as Long;
          break;
        case 3:
          message.records.push(
            QueryResponseRecord.decode(reader, reader.uint32())
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryRecordsByIdResponse {
    const message = {
      ...baseQueryRecordsByIdResponse,
    } as QueryRecordsByIdResponse;
    message.records = [];
    if (object.owner !== undefined && object.owner !== null) {
      message.owner = String(object.owner);
    } else {
      message.owner = "";
    }
    if (object.latestVersion !== undefined && object.latestVersion !== null) {
      message.latestVersion = Long.fromString(object.latestVersion);
    } else {
      message.latestVersion = Long.UZERO;
    }
    if (object.records !== undefined && object.records !== null) {
      for (const e of object.records) {
        message.records.push(QueryResponseRecord.fromJSON(e));
      }
    }
    return message;
  },

  toJSON(message: QueryRecordsByIdResponse): unknown {
    const obj: any = {};
    message.owner !== undefined && (obj.owner = message.owner);
    message.latestVersion !== undefined &&
      (obj.latestVersion = (message.latestVersion || Long.UZERO).toString());
    if (message.records) {
      obj.records = message.records.map((e) =>
        e ? QueryResponseRecord.toJSON(e) : undefined
      );
    } else {
      obj.records = [];
    }
    return obj;
  },

  fromPartial(
    object: DeepPartial<QueryRecordsByIdResponse>
  ): QueryRecordsByIdResponse {
    const message = {
      ...baseQueryRecordsByIdResponse,
    } as QueryRecordsByIdResponse;
    message.records = [];
    if (object.owner !== undefined && object.owner !== null) {
      message.owner = object.owner;
    } else {
      message.owner = "";
    }
    if (object.latestVersion !== undefined && object.latestVersion !== null) {
      message.latestVersion = object.latestVersion as Long;
    } else {
      message.latestVersion = Long.UZERO;
    }
    if (object.records !== undefined && object.records !== null) {
      for (const e of object.records) {
        message.records.push(QueryResponseRecord.fromPartial(e));
      }
    }
    return message;
  },
};

const baseQueryRecordsByFingerprintRequest: object = {
  fingerprint: "",
  fromSequence: Long.UZERO,
};

export const QueryRecordsByFingerprintRequest = {
  encode(
    message: QueryRecordsByFingerprintRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.fingerprint !== "") {
      writer.uint32(10).string(message.fingerprint);
    }
    if (!message.fromSequence.isZero()) {
      writer.uint32(16).uint64(message.fromSequence);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryRecordsByFingerprintRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseQueryRecordsByFingerprintRequest,
    } as QueryRecordsByFingerprintRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.fingerprint = reader.string();
          break;
        case 2:
          message.fromSequence = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryRecordsByFingerprintRequest {
    const message = {
      ...baseQueryRecordsByFingerprintRequest,
    } as QueryRecordsByFingerprintRequest;
    if (object.fingerprint !== undefined && object.fingerprint !== null) {
      message.fingerprint = String(object.fingerprint);
    } else {
      message.fingerprint = "";
    }
    if (object.fromSequence !== undefined && object.fromSequence !== null) {
      message.fromSequence = Long.fromString(object.fromSequence);
    } else {
      message.fromSequence = Long.UZERO;
    }
    return message;
  },

  toJSON(message: QueryRecordsByFingerprintRequest): unknown {
    const obj: any = {};
    message.fingerprint !== undefined &&
      (obj.fingerprint = message.fingerprint);
    message.fromSequence !== undefined &&
      (obj.fromSequence = (message.fromSequence || Long.UZERO).toString());
    return obj;
  },

  fromPartial(
    object: DeepPartial<QueryRecordsByFingerprintRequest>
  ): QueryRecordsByFingerprintRequest {
    const message = {
      ...baseQueryRecordsByFingerprintRequest,
    } as QueryRecordsByFingerprintRequest;
    if (object.fingerprint !== undefined && object.fingerprint !== null) {
      message.fingerprint = object.fingerprint;
    } else {
      message.fingerprint = "";
    }
    if (object.fromSequence !== undefined && object.fromSequence !== null) {
      message.fromSequence = object.fromSequence as Long;
    } else {
      message.fromSequence = Long.UZERO;
    }
    return message;
  },
};

const baseQueryRecordsByFingerprintResponse: object = {
  nextSequence: Long.UZERO,
};

export const QueryRecordsByFingerprintResponse = {
  encode(
    message: QueryRecordsByFingerprintResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.records) {
      QueryResponseRecord.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (!message.nextSequence.isZero()) {
      writer.uint32(16).uint64(message.nextSequence);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryRecordsByFingerprintResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseQueryRecordsByFingerprintResponse,
    } as QueryRecordsByFingerprintResponse;
    message.records = [];
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.records.push(
            QueryResponseRecord.decode(reader, reader.uint32())
          );
          break;
        case 2:
          message.nextSequence = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryRecordsByFingerprintResponse {
    const message = {
      ...baseQueryRecordsByFingerprintResponse,
    } as QueryRecordsByFingerprintResponse;
    message.records = [];
    if (object.records !== undefined && object.records !== null) {
      for (const e of object.records) {
        message.records.push(QueryResponseRecord.fromJSON(e));
      }
    }
    if (object.nextSequence !== undefined && object.nextSequence !== null) {
      message.nextSequence = Long.fromString(object.nextSequence);
    } else {
      message.nextSequence = Long.UZERO;
    }
    return message;
  },

  toJSON(message: QueryRecordsByFingerprintResponse): unknown {
    const obj: any = {};
    if (message.records) {
      obj.records = message.records.map((e) =>
        e ? QueryResponseRecord.toJSON(e) : undefined
      );
    } else {
      obj.records = [];
    }
    message.nextSequence !== undefined &&
      (obj.nextSequence = (message.nextSequence || Long.UZERO).toString());
    return obj;
  },

  fromPartial(
    object: DeepPartial<QueryRecordsByFingerprintResponse>
  ): QueryRecordsByFingerprintResponse {
    const message = {
      ...baseQueryRecordsByFingerprintResponse,
    } as QueryRecordsByFingerprintResponse;
    message.records = [];
    if (object.records !== undefined && object.records !== null) {
      for (const e of object.records) {
        message.records.push(QueryResponseRecord.fromPartial(e));
      }
    }
    if (object.nextSequence !== undefined && object.nextSequence !== null) {
      message.nextSequence = object.nextSequence as Long;
    } else {
      message.nextSequence = Long.UZERO;
    }
    return message;
  },
};

const baseQueryRecordsByOwnerRequest: object = {
  owner: "",
  fromSequence: Long.UZERO,
};

export const QueryRecordsByOwnerRequest = {
  encode(
    message: QueryRecordsByOwnerRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.owner !== "") {
      writer.uint32(10).string(message.owner);
    }
    if (!message.fromSequence.isZero()) {
      writer.uint32(16).uint64(message.fromSequence);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryRecordsByOwnerRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseQueryRecordsByOwnerRequest,
    } as QueryRecordsByOwnerRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.owner = reader.string();
          break;
        case 2:
          message.fromSequence = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryRecordsByOwnerRequest {
    const message = {
      ...baseQueryRecordsByOwnerRequest,
    } as QueryRecordsByOwnerRequest;
    if (object.owner !== undefined && object.owner !== null) {
      message.owner = String(object.owner);
    } else {
      message.owner = "";
    }
    if (object.fromSequence !== undefined && object.fromSequence !== null) {
      message.fromSequence = Long.fromString(object.fromSequence);
    } else {
      message.fromSequence = Long.UZERO;
    }
    return message;
  },

  toJSON(message: QueryRecordsByOwnerRequest): unknown {
    const obj: any = {};
    message.owner !== undefined && (obj.owner = message.owner);
    message.fromSequence !== undefined &&
      (obj.fromSequence = (message.fromSequence || Long.UZERO).toString());
    return obj;
  },

  fromPartial(
    object: DeepPartial<QueryRecordsByOwnerRequest>
  ): QueryRecordsByOwnerRequest {
    const message = {
      ...baseQueryRecordsByOwnerRequest,
    } as QueryRecordsByOwnerRequest;
    if (object.owner !== undefined && object.owner !== null) {
      message.owner = object.owner;
    } else {
      message.owner = "";
    }
    if (object.fromSequence !== undefined && object.fromSequence !== null) {
      message.fromSequence = object.fromSequence as Long;
    } else {
      message.fromSequence = Long.UZERO;
    }
    return message;
  },
};

const baseQueryRecordsByOwnerResponse: object = { nextSequence: Long.UZERO };

export const QueryRecordsByOwnerResponse = {
  encode(
    message: QueryRecordsByOwnerResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.records) {
      QueryResponseRecord.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (!message.nextSequence.isZero()) {
      writer.uint32(16).uint64(message.nextSequence);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryRecordsByOwnerResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseQueryRecordsByOwnerResponse,
    } as QueryRecordsByOwnerResponse;
    message.records = [];
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.records.push(
            QueryResponseRecord.decode(reader, reader.uint32())
          );
          break;
        case 2:
          message.nextSequence = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryRecordsByOwnerResponse {
    const message = {
      ...baseQueryRecordsByOwnerResponse,
    } as QueryRecordsByOwnerResponse;
    message.records = [];
    if (object.records !== undefined && object.records !== null) {
      for (const e of object.records) {
        message.records.push(QueryResponseRecord.fromJSON(e));
      }
    }
    if (object.nextSequence !== undefined && object.nextSequence !== null) {
      message.nextSequence = Long.fromString(object.nextSequence);
    } else {
      message.nextSequence = Long.UZERO;
    }
    return message;
  },

  toJSON(message: QueryRecordsByOwnerResponse): unknown {
    const obj: any = {};
    if (message.records) {
      obj.records = message.records.map((e) =>
        e ? QueryResponseRecord.toJSON(e) : undefined
      );
    } else {
      obj.records = [];
    }
    message.nextSequence !== undefined &&
      (obj.nextSequence = (message.nextSequence || Long.UZERO).toString());
    return obj;
  },

  fromPartial(
    object: DeepPartial<QueryRecordsByOwnerResponse>
  ): QueryRecordsByOwnerResponse {
    const message = {
      ...baseQueryRecordsByOwnerResponse,
    } as QueryRecordsByOwnerResponse;
    message.records = [];
    if (object.records !== undefined && object.records !== null) {
      for (const e of object.records) {
        message.records.push(QueryResponseRecord.fromPartial(e));
      }
    }
    if (object.nextSequence !== undefined && object.nextSequence !== null) {
      message.nextSequence = object.nextSequence as Long;
    } else {
      message.nextSequence = Long.UZERO;
    }
    return message;
  },
};

const baseQueryParamsRequest: object = {};

export const QueryParamsRequest = {
  encode(
    _: QueryParamsRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueryParamsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseQueryParamsRequest } as QueryParamsRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): QueryParamsRequest {
    const message = { ...baseQueryParamsRequest } as QueryParamsRequest;
    return message;
  },

  toJSON(_: QueryParamsRequest): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(_: DeepPartial<QueryParamsRequest>): QueryParamsRequest {
    const message = { ...baseQueryParamsRequest } as QueryParamsRequest;
    return message;
  },
};

const baseQueryParamsResponse: object = {};

export const QueryParamsResponse = {
  encode(
    message: QueryParamsResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.params !== undefined) {
      Params.encode(message.params, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueryParamsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseQueryParamsResponse } as QueryParamsResponse;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.params = Params.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryParamsResponse {
    const message = { ...baseQueryParamsResponse } as QueryParamsResponse;
    if (object.params !== undefined && object.params !== null) {
      message.params = Params.fromJSON(object.params);
    } else {
      message.params = undefined;
    }
    return message;
  },

  toJSON(message: QueryParamsResponse): unknown {
    const obj: any = {};
    message.params !== undefined &&
      (obj.params = message.params ? Params.toJSON(message.params) : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<QueryParamsResponse>): QueryParamsResponse {
    const message = { ...baseQueryParamsResponse } as QueryParamsResponse;
    if (object.params !== undefined && object.params !== null) {
      message.params = Params.fromPartial(object.params);
    } else {
      message.params = undefined;
    }
    return message;
  },
};

const baseQueryGetCidRequest: object = { cid: "" };

export const QueryGetCidRequest = {
  encode(
    message: QueryGetCidRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.cid !== "") {
      writer.uint32(10).string(message.cid);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueryGetCidRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseQueryGetCidRequest } as QueryGetCidRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.cid = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryGetCidRequest {
    const message = { ...baseQueryGetCidRequest } as QueryGetCidRequest;
    if (object.cid !== undefined && object.cid !== null) {
      message.cid = String(object.cid);
    } else {
      message.cid = "";
    }
    return message;
  },

  toJSON(message: QueryGetCidRequest): unknown {
    const obj: any = {};
    message.cid !== undefined && (obj.cid = message.cid);
    return obj;
  },

  fromPartial(object: DeepPartial<QueryGetCidRequest>): QueryGetCidRequest {
    const message = { ...baseQueryGetCidRequest } as QueryGetCidRequest;
    if (object.cid !== undefined && object.cid !== null) {
      message.cid = object.cid;
    } else {
      message.cid = "";
    }
    return message;
  },
};

const baseQueryGetCidResponse: object = {};

export const QueryGetCidResponse = {
  encode(
    message: QueryGetCidResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.data.length !== 0) {
      writer.uint32(10).bytes(message.data);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueryGetCidResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseQueryGetCidResponse } as QueryGetCidResponse;
    message.data = new Uint8Array();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.data = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryGetCidResponse {
    const message = { ...baseQueryGetCidResponse } as QueryGetCidResponse;
    message.data = new Uint8Array();
    if (object.data !== undefined && object.data !== null) {
      message.data = bytesFromBase64(object.data);
    }
    return message;
  },

  toJSON(message: QueryGetCidResponse): unknown {
    const obj: any = {};
    message.data !== undefined &&
      (obj.data = base64FromBytes(
        message.data !== undefined ? message.data : new Uint8Array()
      ));
    return obj;
  },

  fromPartial(object: DeepPartial<QueryGetCidResponse>): QueryGetCidResponse {
    const message = { ...baseQueryGetCidResponse } as QueryGetCidResponse;
    if (object.data !== undefined && object.data !== null) {
      message.data = object.data;
    } else {
      message.data = new Uint8Array();
    }
    return message;
  },
};

const baseQueryGetCidSizeRequest: object = { cid: "" };

export const QueryGetCidSizeRequest = {
  encode(
    message: QueryGetCidSizeRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.cid !== "") {
      writer.uint32(10).string(message.cid);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryGetCidSizeRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseQueryGetCidSizeRequest } as QueryGetCidSizeRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.cid = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryGetCidSizeRequest {
    const message = { ...baseQueryGetCidSizeRequest } as QueryGetCidSizeRequest;
    if (object.cid !== undefined && object.cid !== null) {
      message.cid = String(object.cid);
    } else {
      message.cid = "";
    }
    return message;
  },

  toJSON(message: QueryGetCidSizeRequest): unknown {
    const obj: any = {};
    message.cid !== undefined && (obj.cid = message.cid);
    return obj;
  },

  fromPartial(
    object: DeepPartial<QueryGetCidSizeRequest>
  ): QueryGetCidSizeRequest {
    const message = { ...baseQueryGetCidSizeRequest } as QueryGetCidSizeRequest;
    if (object.cid !== undefined && object.cid !== null) {
      message.cid = object.cid;
    } else {
      message.cid = "";
    }
    return message;
  },
};

const baseQueryGetCidSizeResponse: object = { size: Long.UZERO };

export const QueryGetCidSizeResponse = {
  encode(
    message: QueryGetCidSizeResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.size.isZero()) {
      writer.uint32(8).uint64(message.size);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryGetCidSizeResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseQueryGetCidSizeResponse,
    } as QueryGetCidSizeResponse;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.size = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryGetCidSizeResponse {
    const message = {
      ...baseQueryGetCidSizeResponse,
    } as QueryGetCidSizeResponse;
    if (object.size !== undefined && object.size !== null) {
      message.size = Long.fromString(object.size);
    } else {
      message.size = Long.UZERO;
    }
    return message;
  },

  toJSON(message: QueryGetCidSizeResponse): unknown {
    const obj: any = {};
    message.size !== undefined &&
      (obj.size = (message.size || Long.UZERO).toString());
    return obj;
  },

  fromPartial(
    object: DeepPartial<QueryGetCidSizeResponse>
  ): QueryGetCidSizeResponse {
    const message = {
      ...baseQueryGetCidSizeResponse,
    } as QueryGetCidSizeResponse;
    if (object.size !== undefined && object.size !== null) {
      message.size = object.size as Long;
    } else {
      message.size = Long.UZERO;
    }
    return message;
  },
};

const baseQueryHasCidRequest: object = { cid: "" };

export const QueryHasCidRequest = {
  encode(
    message: QueryHasCidRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.cid !== "") {
      writer.uint32(10).string(message.cid);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueryHasCidRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseQueryHasCidRequest } as QueryHasCidRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.cid = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryHasCidRequest {
    const message = { ...baseQueryHasCidRequest } as QueryHasCidRequest;
    if (object.cid !== undefined && object.cid !== null) {
      message.cid = String(object.cid);
    } else {
      message.cid = "";
    }
    return message;
  },

  toJSON(message: QueryHasCidRequest): unknown {
    const obj: any = {};
    message.cid !== undefined && (obj.cid = message.cid);
    return obj;
  },

  fromPartial(object: DeepPartial<QueryHasCidRequest>): QueryHasCidRequest {
    const message = { ...baseQueryHasCidRequest } as QueryHasCidRequest;
    if (object.cid !== undefined && object.cid !== null) {
      message.cid = object.cid;
    } else {
      message.cid = "";
    }
    return message;
  },
};

const baseQueryHasCidResponse: object = { exist: false };

export const QueryHasCidResponse = {
  encode(
    message: QueryHasCidResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.exist === true) {
      writer.uint32(8).bool(message.exist);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueryHasCidResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseQueryHasCidResponse } as QueryHasCidResponse;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.exist = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryHasCidResponse {
    const message = { ...baseQueryHasCidResponse } as QueryHasCidResponse;
    if (object.exist !== undefined && object.exist !== null) {
      message.exist = Boolean(object.exist);
    } else {
      message.exist = false;
    }
    return message;
  },

  toJSON(message: QueryHasCidResponse): unknown {
    const obj: any = {};
    message.exist !== undefined && (obj.exist = message.exist);
    return obj;
  },

  fromPartial(object: DeepPartial<QueryHasCidResponse>): QueryHasCidResponse {
    const message = { ...baseQueryHasCidResponse } as QueryHasCidResponse;
    if (object.exist !== undefined && object.exist !== null) {
      message.exist = object.exist;
    } else {
      message.exist = false;
    }
    return message;
  },
};

export interface Query {
  RecordsById(
    request: QueryRecordsByIdRequest
  ): Promise<QueryRecordsByIdResponse>;
  RecordsByFingerprint(
    request: QueryRecordsByFingerprintRequest
  ): Promise<QueryRecordsByFingerprintResponse>;
  RecordsByOwner(
    request: QueryRecordsByOwnerRequest
  ): Promise<QueryRecordsByOwnerResponse>;
  Params(request: QueryParamsRequest): Promise<QueryParamsResponse>;
  GetCid(request: QueryGetCidRequest): Promise<QueryGetCidResponse>;
  HasCid(request: QueryHasCidRequest): Promise<QueryHasCidResponse>;
  GetCidSize(request: QueryGetCidSizeRequest): Promise<QueryGetCidSizeResponse>;
}

export class QueryClientImpl implements Query {
  private readonly rpc: Rpc;
  constructor(rpc: Rpc) {
    this.rpc = rpc;
    this.RecordsById = this.RecordsById.bind(this);
    this.RecordsByFingerprint = this.RecordsByFingerprint.bind(this);
    this.RecordsByOwner = this.RecordsByOwner.bind(this);
    this.Params = this.Params.bind(this);
    this.GetCid = this.GetCid.bind(this);
    this.HasCid = this.HasCid.bind(this);
    this.GetCidSize = this.GetCidSize.bind(this);
  }
  RecordsById(
    request: QueryRecordsByIdRequest
  ): Promise<QueryRecordsByIdResponse> {
    const data = QueryRecordsByIdRequest.encode(request).finish();
    const promise = this.rpc.request(
      "likechain.iscn.Query",
      "RecordsById",
      data
    );
    return promise.then((data) =>
      QueryRecordsByIdResponse.decode(new _m0.Reader(data))
    );
  }

  RecordsByFingerprint(
    request: QueryRecordsByFingerprintRequest
  ): Promise<QueryRecordsByFingerprintResponse> {
    const data = QueryRecordsByFingerprintRequest.encode(request).finish();
    const promise = this.rpc.request(
      "likechain.iscn.Query",
      "RecordsByFingerprint",
      data
    );
    return promise.then((data) =>
      QueryRecordsByFingerprintResponse.decode(new _m0.Reader(data))
    );
  }

  RecordsByOwner(
    request: QueryRecordsByOwnerRequest
  ): Promise<QueryRecordsByOwnerResponse> {
    const data = QueryRecordsByOwnerRequest.encode(request).finish();
    const promise = this.rpc.request(
      "likechain.iscn.Query",
      "RecordsByOwner",
      data
    );
    return promise.then((data) =>
      QueryRecordsByOwnerResponse.decode(new _m0.Reader(data))
    );
  }

  Params(request: QueryParamsRequest): Promise<QueryParamsResponse> {
    const data = QueryParamsRequest.encode(request).finish();
    const promise = this.rpc.request("likechain.iscn.Query", "Params", data);
    return promise.then((data) =>
      QueryParamsResponse.decode(new _m0.Reader(data))
    );
  }

  GetCid(request: QueryGetCidRequest): Promise<QueryGetCidResponse> {
    const data = QueryGetCidRequest.encode(request).finish();
    const promise = this.rpc.request("likechain.iscn.Query", "GetCid", data);
    return promise.then((data) =>
      QueryGetCidResponse.decode(new _m0.Reader(data))
    );
  }

  HasCid(request: QueryHasCidRequest): Promise<QueryHasCidResponse> {
    const data = QueryHasCidRequest.encode(request).finish();
    const promise = this.rpc.request("likechain.iscn.Query", "HasCid", data);
    return promise.then((data) =>
      QueryHasCidResponse.decode(new _m0.Reader(data))
    );
  }

  GetCidSize(
    request: QueryGetCidSizeRequest
  ): Promise<QueryGetCidSizeResponse> {
    const data = QueryGetCidSizeRequest.encode(request).finish();
    const promise = this.rpc.request(
      "likechain.iscn.Query",
      "GetCidSize",
      data
    );
    return promise.then((data) =>
      QueryGetCidSizeResponse.decode(new _m0.Reader(data))
    );
  }
}

interface Rpc {
  request(
    service: string,
    method: string,
    data: Uint8Array
  ): Promise<Uint8Array>;
}

declare var self: any | undefined;
declare var window: any | undefined;
var globalThis: any = (() => {
  if (typeof globalThis !== "undefined") return globalThis;
  if (typeof self !== "undefined") return self;
  if (typeof window !== "undefined") return window;
  if (typeof global !== "undefined") return global;
  throw "Unable to locate global object";
})();

const atob: (b64: string) => string =
  globalThis.atob ||
  ((b64) => globalThis.Buffer.from(b64, "base64").toString("binary"));
function bytesFromBase64(b64: string): Uint8Array {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; ++i) {
    arr[i] = bin.charCodeAt(i);
  }
  return arr;
}

const btoa: (bin: string) => string =
  globalThis.btoa ||
  ((bin) => globalThis.Buffer.from(bin, "binary").toString("base64"));
function base64FromBytes(arr: Uint8Array): string {
  const bin: string[] = [];
  for (const byte of arr) {
    bin.push(String.fromCharCode(byte));
  }
  return btoa(bin.join(""));
}

type Builtin =
  | Date
  | Function
  | Uint8Array
  | string
  | number
  | boolean
  | undefined
  | Long;
export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}
