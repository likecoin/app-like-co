/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";
import { IscnId } from "../iscn/iscnid";

export const protobufPackage = "likechain.iscn";

export interface StoreRecord {
  iscnId?: IscnId;
  cidBytes: Uint8Array;
  data: Uint8Array;
}

export interface ContentIdRecord {
  ownerAddressBytes: Uint8Array;
  latestVersion: Long;
}

const baseStoreRecord: object = {};

export const StoreRecord = {
  encode(
    message: StoreRecord,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.iscnId !== undefined) {
      IscnId.encode(message.iscnId, writer.uint32(10).fork()).ldelim();
    }
    if (message.cidBytes.length !== 0) {
      writer.uint32(18).bytes(message.cidBytes);
    }
    if (message.data.length !== 0) {
      writer.uint32(26).bytes(message.data);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): StoreRecord {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseStoreRecord } as StoreRecord;
    message.cidBytes = new Uint8Array();
    message.data = new Uint8Array();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.iscnId = IscnId.decode(reader, reader.uint32());
          break;
        case 2:
          message.cidBytes = reader.bytes();
          break;
        case 3:
          message.data = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): StoreRecord {
    const message = { ...baseStoreRecord } as StoreRecord;
    message.cidBytes = new Uint8Array();
    message.data = new Uint8Array();
    if (object.iscnId !== undefined && object.iscnId !== null) {
      message.iscnId = IscnId.fromJSON(object.iscnId);
    } else {
      message.iscnId = undefined;
    }
    if (object.cidBytes !== undefined && object.cidBytes !== null) {
      message.cidBytes = bytesFromBase64(object.cidBytes);
    }
    if (object.data !== undefined && object.data !== null) {
      message.data = bytesFromBase64(object.data);
    }
    return message;
  },

  toJSON(message: StoreRecord): unknown {
    const obj: any = {};
    message.iscnId !== undefined &&
      (obj.iscnId = message.iscnId ? IscnId.toJSON(message.iscnId) : undefined);
    message.cidBytes !== undefined &&
      (obj.cidBytes = base64FromBytes(
        message.cidBytes !== undefined ? message.cidBytes : new Uint8Array()
      ));
    message.data !== undefined &&
      (obj.data = base64FromBytes(
        message.data !== undefined ? message.data : new Uint8Array()
      ));
    return obj;
  },

  fromPartial(object: DeepPartial<StoreRecord>): StoreRecord {
    const message = { ...baseStoreRecord } as StoreRecord;
    if (object.iscnId !== undefined && object.iscnId !== null) {
      message.iscnId = IscnId.fromPartial(object.iscnId);
    } else {
      message.iscnId = undefined;
    }
    if (object.cidBytes !== undefined && object.cidBytes !== null) {
      message.cidBytes = object.cidBytes;
    } else {
      message.cidBytes = new Uint8Array();
    }
    if (object.data !== undefined && object.data !== null) {
      message.data = object.data;
    } else {
      message.data = new Uint8Array();
    }
    return message;
  },
};

const baseContentIdRecord: object = { latestVersion: Long.UZERO };

export const ContentIdRecord = {
  encode(
    message: ContentIdRecord,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.ownerAddressBytes.length !== 0) {
      writer.uint32(10).bytes(message.ownerAddressBytes);
    }
    if (!message.latestVersion.isZero()) {
      writer.uint32(16).uint64(message.latestVersion);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ContentIdRecord {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseContentIdRecord } as ContentIdRecord;
    message.ownerAddressBytes = new Uint8Array();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.ownerAddressBytes = reader.bytes();
          break;
        case 2:
          message.latestVersion = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ContentIdRecord {
    const message = { ...baseContentIdRecord } as ContentIdRecord;
    message.ownerAddressBytes = new Uint8Array();
    if (
      object.ownerAddressBytes !== undefined &&
      object.ownerAddressBytes !== null
    ) {
      message.ownerAddressBytes = bytesFromBase64(object.ownerAddressBytes);
    }
    if (object.latestVersion !== undefined && object.latestVersion !== null) {
      message.latestVersion = Long.fromString(object.latestVersion);
    } else {
      message.latestVersion = Long.UZERO;
    }
    return message;
  },

  toJSON(message: ContentIdRecord): unknown {
    const obj: any = {};
    message.ownerAddressBytes !== undefined &&
      (obj.ownerAddressBytes = base64FromBytes(
        message.ownerAddressBytes !== undefined
          ? message.ownerAddressBytes
          : new Uint8Array()
      ));
    message.latestVersion !== undefined &&
      (obj.latestVersion = (message.latestVersion || Long.UZERO).toString());
    return obj;
  },

  fromPartial(object: DeepPartial<ContentIdRecord>): ContentIdRecord {
    const message = { ...baseContentIdRecord } as ContentIdRecord;
    if (
      object.ownerAddressBytes !== undefined &&
      object.ownerAddressBytes !== null
    ) {
      message.ownerAddressBytes = object.ownerAddressBytes;
    } else {
      message.ownerAddressBytes = new Uint8Array();
    }
    if (object.latestVersion !== undefined && object.latestVersion !== null) {
      message.latestVersion = object.latestVersion as Long;
    } else {
      message.latestVersion = Long.UZERO;
    }
    return message;
  },
};

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
