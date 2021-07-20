/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";
import { DecCoin } from "../cosmos/base/v1beta1/coin";

export const protobufPackage = "likechain.iscn";

export interface Params {
  registryName: string;
  feePerByte?: DecCoin;
}

const baseParams: object = { registryName: "" };

export const Params = {
  encode(
    message: Params,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.registryName !== "") {
      writer.uint32(10).string(message.registryName);
    }
    if (message.feePerByte !== undefined) {
      DecCoin.encode(message.feePerByte, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Params {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseParams } as Params;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.registryName = reader.string();
          break;
        case 2:
          message.feePerByte = DecCoin.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Params {
    const message = { ...baseParams } as Params;
    if (object.registryName !== undefined && object.registryName !== null) {
      message.registryName = String(object.registryName);
    } else {
      message.registryName = "";
    }
    if (object.feePerByte !== undefined && object.feePerByte !== null) {
      message.feePerByte = DecCoin.fromJSON(object.feePerByte);
    } else {
      message.feePerByte = undefined;
    }
    return message;
  },

  toJSON(message: Params): unknown {
    const obj: any = {};
    message.registryName !== undefined &&
      (obj.registryName = message.registryName);
    message.feePerByte !== undefined &&
      (obj.feePerByte = message.feePerByte
        ? DecCoin.toJSON(message.feePerByte)
        : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<Params>): Params {
    const message = { ...baseParams } as Params;
    if (object.registryName !== undefined && object.registryName !== null) {
      message.registryName = object.registryName;
    } else {
      message.registryName = "";
    }
    if (object.feePerByte !== undefined && object.feePerByte !== null) {
      message.feePerByte = DecCoin.fromPartial(object.feePerByte);
    } else {
      message.feePerByte = undefined;
    }
    return message;
  },
};

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
