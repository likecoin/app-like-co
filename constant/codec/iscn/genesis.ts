/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";
import { Params } from "../iscn/params";

export const protobufPackage = "likechain.iscn";

export interface GenesisState {
  params?: Params;
  contentIdRecords: GenesisState_ContentIdRecord[];
  iscnRecords: Uint8Array[];
}

export interface GenesisState_ContentIdRecord {
  iscnId: string;
  owner: string;
  latestVersion: Long;
}

const baseGenesisState: object = {};

export const GenesisState = {
  encode(
    message: GenesisState,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.params !== undefined) {
      Params.encode(message.params, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.contentIdRecords) {
      GenesisState_ContentIdRecord.encode(
        v!,
        writer.uint32(18).fork()
      ).ldelim();
    }
    for (const v of message.iscnRecords) {
      writer.uint32(26).bytes(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GenesisState {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseGenesisState } as GenesisState;
    message.contentIdRecords = [];
    message.iscnRecords = [];
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.params = Params.decode(reader, reader.uint32());
          break;
        case 2:
          message.contentIdRecords.push(
            GenesisState_ContentIdRecord.decode(reader, reader.uint32())
          );
          break;
        case 3:
          message.iscnRecords.push(reader.bytes());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): GenesisState {
    const message = { ...baseGenesisState } as GenesisState;
    message.contentIdRecords = [];
    message.iscnRecords = [];
    if (object.params !== undefined && object.params !== null) {
      message.params = Params.fromJSON(object.params);
    } else {
      message.params = undefined;
    }
    if (
      object.contentIdRecords !== undefined &&
      object.contentIdRecords !== null
    ) {
      for (const e of object.contentIdRecords) {
        message.contentIdRecords.push(GenesisState_ContentIdRecord.fromJSON(e));
      }
    }
    if (object.iscnRecords !== undefined && object.iscnRecords !== null) {
      for (const e of object.iscnRecords) {
        message.iscnRecords.push(bytesFromBase64(e));
      }
    }
    return message;
  },

  toJSON(message: GenesisState): unknown {
    const obj: any = {};
    message.params !== undefined &&
      (obj.params = message.params ? Params.toJSON(message.params) : undefined);
    if (message.contentIdRecords) {
      obj.contentIdRecords = message.contentIdRecords.map((e) =>
        e ? GenesisState_ContentIdRecord.toJSON(e) : undefined
      );
    } else {
      obj.contentIdRecords = [];
    }
    if (message.iscnRecords) {
      obj.iscnRecords = message.iscnRecords.map((e) =>
        base64FromBytes(e !== undefined ? e : new Uint8Array())
      );
    } else {
      obj.iscnRecords = [];
    }
    return obj;
  },

  fromPartial(object: DeepPartial<GenesisState>): GenesisState {
    const message = { ...baseGenesisState } as GenesisState;
    message.contentIdRecords = [];
    message.iscnRecords = [];
    if (object.params !== undefined && object.params !== null) {
      message.params = Params.fromPartial(object.params);
    } else {
      message.params = undefined;
    }
    if (
      object.contentIdRecords !== undefined &&
      object.contentIdRecords !== null
    ) {
      for (const e of object.contentIdRecords) {
        message.contentIdRecords.push(
          GenesisState_ContentIdRecord.fromPartial(e)
        );
      }
    }
    if (object.iscnRecords !== undefined && object.iscnRecords !== null) {
      for (const e of object.iscnRecords) {
        message.iscnRecords.push(e);
      }
    }
    return message;
  },
};

const baseGenesisState_ContentIdRecord: object = {
  iscnId: "",
  owner: "",
  latestVersion: Long.UZERO,
};

export const GenesisState_ContentIdRecord = {
  encode(
    message: GenesisState_ContentIdRecord,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.iscnId !== "") {
      writer.uint32(10).string(message.iscnId);
    }
    if (message.owner !== "") {
      writer.uint32(18).string(message.owner);
    }
    if (!message.latestVersion.isZero()) {
      writer.uint32(24).uint64(message.latestVersion);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): GenesisState_ContentIdRecord {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseGenesisState_ContentIdRecord,
    } as GenesisState_ContentIdRecord;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.iscnId = reader.string();
          break;
        case 2:
          message.owner = reader.string();
          break;
        case 3:
          message.latestVersion = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): GenesisState_ContentIdRecord {
    const message = {
      ...baseGenesisState_ContentIdRecord,
    } as GenesisState_ContentIdRecord;
    if (object.iscnId !== undefined && object.iscnId !== null) {
      message.iscnId = String(object.iscnId);
    } else {
      message.iscnId = "";
    }
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
    return message;
  },

  toJSON(message: GenesisState_ContentIdRecord): unknown {
    const obj: any = {};
    message.iscnId !== undefined && (obj.iscnId = message.iscnId);
    message.owner !== undefined && (obj.owner = message.owner);
    message.latestVersion !== undefined &&
      (obj.latestVersion = (message.latestVersion || Long.UZERO).toString());
    return obj;
  },

  fromPartial(
    object: DeepPartial<GenesisState_ContentIdRecord>
  ): GenesisState_ContentIdRecord {
    const message = {
      ...baseGenesisState_ContentIdRecord,
    } as GenesisState_ContentIdRecord;
    if (object.iscnId !== undefined && object.iscnId !== null) {
      message.iscnId = object.iscnId;
    } else {
      message.iscnId = "";
    }
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
