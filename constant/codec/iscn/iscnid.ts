/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";

export const protobufPackage = "likechain.iscn";

export interface IscnIdPrefix {
  registryName: string;
  contentId: string;
}

export interface IscnId {
  prefix?: IscnIdPrefix;
  version: Long;
}

const baseIscnIdPrefix: object = { registryName: "", contentId: "" };

export const IscnIdPrefix = {
  encode(
    message: IscnIdPrefix,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.registryName !== "") {
      writer.uint32(10).string(message.registryName);
    }
    if (message.contentId !== "") {
      writer.uint32(18).string(message.contentId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): IscnIdPrefix {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseIscnIdPrefix } as IscnIdPrefix;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.registryName = reader.string();
          break;
        case 2:
          message.contentId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): IscnIdPrefix {
    const message = { ...baseIscnIdPrefix } as IscnIdPrefix;
    if (object.registryName !== undefined && object.registryName !== null) {
      message.registryName = String(object.registryName);
    } else {
      message.registryName = "";
    }
    if (object.contentId !== undefined && object.contentId !== null) {
      message.contentId = String(object.contentId);
    } else {
      message.contentId = "";
    }
    return message;
  },

  toJSON(message: IscnIdPrefix): unknown {
    const obj: any = {};
    message.registryName !== undefined &&
      (obj.registryName = message.registryName);
    message.contentId !== undefined && (obj.contentId = message.contentId);
    return obj;
  },

  fromPartial(object: DeepPartial<IscnIdPrefix>): IscnIdPrefix {
    const message = { ...baseIscnIdPrefix } as IscnIdPrefix;
    if (object.registryName !== undefined && object.registryName !== null) {
      message.registryName = object.registryName;
    } else {
      message.registryName = "";
    }
    if (object.contentId !== undefined && object.contentId !== null) {
      message.contentId = object.contentId;
    } else {
      message.contentId = "";
    }
    return message;
  },
};

const baseIscnId: object = { version: Long.UZERO };

export const IscnId = {
  encode(
    message: IscnId,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.prefix !== undefined) {
      IscnIdPrefix.encode(message.prefix, writer.uint32(10).fork()).ldelim();
    }
    if (!message.version.isZero()) {
      writer.uint32(16).uint64(message.version);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): IscnId {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseIscnId } as IscnId;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.prefix = IscnIdPrefix.decode(reader, reader.uint32());
          break;
        case 2:
          message.version = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): IscnId {
    const message = { ...baseIscnId } as IscnId;
    if (object.prefix !== undefined && object.prefix !== null) {
      message.prefix = IscnIdPrefix.fromJSON(object.prefix);
    } else {
      message.prefix = undefined;
    }
    if (object.version !== undefined && object.version !== null) {
      message.version = Long.fromString(object.version);
    } else {
      message.version = Long.UZERO;
    }
    return message;
  },

  toJSON(message: IscnId): unknown {
    const obj: any = {};
    message.prefix !== undefined &&
      (obj.prefix = message.prefix
        ? IscnIdPrefix.toJSON(message.prefix)
        : undefined);
    message.version !== undefined &&
      (obj.version = (message.version || Long.UZERO).toString());
    return obj;
  },

  fromPartial(object: DeepPartial<IscnId>): IscnId {
    const message = { ...baseIscnId } as IscnId;
    if (object.prefix !== undefined && object.prefix !== null) {
      message.prefix = IscnIdPrefix.fromPartial(object.prefix);
    } else {
      message.prefix = undefined;
    }
    if (object.version !== undefined && object.version !== null) {
      message.version = object.version as Long;
    } else {
      message.version = Long.UZERO;
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
