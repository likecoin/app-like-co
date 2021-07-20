/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";

export const protobufPackage = "likechain.iscn";

export interface IscnRecord {
  /** Using camelCases to make the record JSON in tx more like general JSON documents */
  recordNotes: string;
  contentFingerprints: string[];
  stakeholders: Uint8Array[];
  contentMetadata: Uint8Array;
}

export interface MsgCreateIscnRecord {
  from: string;
  record?: IscnRecord;
}

export interface MsgCreateIscnRecordResponse {
  iscnId: string;
  recordIpld: string;
}

export interface MsgUpdateIscnRecord {
  from: string;
  iscnId: string;
  record?: IscnRecord;
}

export interface MsgUpdateIscnRecordResponse {
  iscnId: string;
  recordIpld: string;
}

export interface MsgChangeIscnRecordOwnership {
  from: string;
  iscnId: string;
  newOwner: string;
}

export interface MsgChangeIscnRecordOwnershipResponse {}

const baseIscnRecord: object = { recordNotes: "", contentFingerprints: "" };

export const IscnRecord = {
  encode(
    message: IscnRecord,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.recordNotes !== "") {
      writer.uint32(10).string(message.recordNotes);
    }
    for (const v of message.contentFingerprints) {
      writer.uint32(18).string(v!);
    }
    for (const v of message.stakeholders) {
      writer.uint32(26).bytes(v!);
    }
    if (message.contentMetadata.length !== 0) {
      writer.uint32(34).bytes(message.contentMetadata);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): IscnRecord {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseIscnRecord } as IscnRecord;
    message.contentFingerprints = [];
    message.stakeholders = [];
    message.contentMetadata = new Uint8Array();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.recordNotes = reader.string();
          break;
        case 2:
          message.contentFingerprints.push(reader.string());
          break;
        case 3:
          message.stakeholders.push(reader.bytes());
          break;
        case 4:
          message.contentMetadata = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): IscnRecord {
    const message = { ...baseIscnRecord } as IscnRecord;
    message.contentFingerprints = [];
    message.stakeholders = [];
    message.contentMetadata = new Uint8Array();
    if (object.recordNotes !== undefined && object.recordNotes !== null) {
      message.recordNotes = String(object.recordNotes);
    } else {
      message.recordNotes = "";
    }
    if (
      object.contentFingerprints !== undefined &&
      object.contentFingerprints !== null
    ) {
      for (const e of object.contentFingerprints) {
        message.contentFingerprints.push(String(e));
      }
    }
    if (object.stakeholders !== undefined && object.stakeholders !== null) {
      for (const e of object.stakeholders) {
        message.stakeholders.push(bytesFromBase64(e));
      }
    }
    if (
      object.contentMetadata !== undefined &&
      object.contentMetadata !== null
    ) {
      message.contentMetadata = bytesFromBase64(object.contentMetadata);
    }
    return message;
  },

  toJSON(message: IscnRecord): unknown {
    const obj: any = {};
    message.recordNotes !== undefined &&
      (obj.recordNotes = message.recordNotes);
    if (message.contentFingerprints) {
      obj.contentFingerprints = message.contentFingerprints.map((e) => e);
    } else {
      obj.contentFingerprints = [];
    }
    if (message.stakeholders) {
      obj.stakeholders = message.stakeholders.map((e) =>
        base64FromBytes(e !== undefined ? e : new Uint8Array())
      );
    } else {
      obj.stakeholders = [];
    }
    message.contentMetadata !== undefined &&
      (obj.contentMetadata = base64FromBytes(
        message.contentMetadata !== undefined
          ? message.contentMetadata
          : new Uint8Array()
      ));
    return obj;
  },

  fromPartial(object: DeepPartial<IscnRecord>): IscnRecord {
    const message = { ...baseIscnRecord } as IscnRecord;
    message.contentFingerprints = [];
    message.stakeholders = [];
    if (object.recordNotes !== undefined && object.recordNotes !== null) {
      message.recordNotes = object.recordNotes;
    } else {
      message.recordNotes = "";
    }
    if (
      object.contentFingerprints !== undefined &&
      object.contentFingerprints !== null
    ) {
      for (const e of object.contentFingerprints) {
        message.contentFingerprints.push(e);
      }
    }
    if (object.stakeholders !== undefined && object.stakeholders !== null) {
      for (const e of object.stakeholders) {
        message.stakeholders.push(e);
      }
    }
    if (
      object.contentMetadata !== undefined &&
      object.contentMetadata !== null
    ) {
      message.contentMetadata = object.contentMetadata;
    } else {
      message.contentMetadata = new Uint8Array();
    }
    return message;
  },
};

const baseMsgCreateIscnRecord: object = { from: "" };

export const MsgCreateIscnRecord = {
  encode(
    message: MsgCreateIscnRecord,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.from !== "") {
      writer.uint32(10).string(message.from);
    }
    if (message.record !== undefined) {
      IscnRecord.encode(message.record, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgCreateIscnRecord {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseMsgCreateIscnRecord } as MsgCreateIscnRecord;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.from = reader.string();
          break;
        case 2:
          message.record = IscnRecord.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgCreateIscnRecord {
    const message = { ...baseMsgCreateIscnRecord } as MsgCreateIscnRecord;
    if (object.from !== undefined && object.from !== null) {
      message.from = String(object.from);
    } else {
      message.from = "";
    }
    if (object.record !== undefined && object.record !== null) {
      message.record = IscnRecord.fromJSON(object.record);
    } else {
      message.record = undefined;
    }
    return message;
  },

  toJSON(message: MsgCreateIscnRecord): unknown {
    const obj: any = {};
    message.from !== undefined && (obj.from = message.from);
    message.record !== undefined &&
      (obj.record = message.record
        ? IscnRecord.toJSON(message.record)
        : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<MsgCreateIscnRecord>): MsgCreateIscnRecord {
    const message = { ...baseMsgCreateIscnRecord } as MsgCreateIscnRecord;
    if (object.from !== undefined && object.from !== null) {
      message.from = object.from;
    } else {
      message.from = "";
    }
    if (object.record !== undefined && object.record !== null) {
      message.record = IscnRecord.fromPartial(object.record);
    } else {
      message.record = undefined;
    }
    return message;
  },
};

const baseMsgCreateIscnRecordResponse: object = { iscnId: "", recordIpld: "" };

export const MsgCreateIscnRecordResponse = {
  encode(
    message: MsgCreateIscnRecordResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.iscnId !== "") {
      writer.uint32(10).string(message.iscnId);
    }
    if (message.recordIpld !== "") {
      writer.uint32(18).string(message.recordIpld);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgCreateIscnRecordResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseMsgCreateIscnRecordResponse,
    } as MsgCreateIscnRecordResponse;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.iscnId = reader.string();
          break;
        case 2:
          message.recordIpld = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgCreateIscnRecordResponse {
    const message = {
      ...baseMsgCreateIscnRecordResponse,
    } as MsgCreateIscnRecordResponse;
    if (object.iscnId !== undefined && object.iscnId !== null) {
      message.iscnId = String(object.iscnId);
    } else {
      message.iscnId = "";
    }
    if (object.recordIpld !== undefined && object.recordIpld !== null) {
      message.recordIpld = String(object.recordIpld);
    } else {
      message.recordIpld = "";
    }
    return message;
  },

  toJSON(message: MsgCreateIscnRecordResponse): unknown {
    const obj: any = {};
    message.iscnId !== undefined && (obj.iscnId = message.iscnId);
    message.recordIpld !== undefined && (obj.recordIpld = message.recordIpld);
    return obj;
  },

  fromPartial(
    object: DeepPartial<MsgCreateIscnRecordResponse>
  ): MsgCreateIscnRecordResponse {
    const message = {
      ...baseMsgCreateIscnRecordResponse,
    } as MsgCreateIscnRecordResponse;
    if (object.iscnId !== undefined && object.iscnId !== null) {
      message.iscnId = object.iscnId;
    } else {
      message.iscnId = "";
    }
    if (object.recordIpld !== undefined && object.recordIpld !== null) {
      message.recordIpld = object.recordIpld;
    } else {
      message.recordIpld = "";
    }
    return message;
  },
};

const baseMsgUpdateIscnRecord: object = { from: "", iscnId: "" };

export const MsgUpdateIscnRecord = {
  encode(
    message: MsgUpdateIscnRecord,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.from !== "") {
      writer.uint32(10).string(message.from);
    }
    if (message.iscnId !== "") {
      writer.uint32(18).string(message.iscnId);
    }
    if (message.record !== undefined) {
      IscnRecord.encode(message.record, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpdateIscnRecord {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseMsgUpdateIscnRecord } as MsgUpdateIscnRecord;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.from = reader.string();
          break;
        case 2:
          message.iscnId = reader.string();
          break;
        case 3:
          message.record = IscnRecord.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgUpdateIscnRecord {
    const message = { ...baseMsgUpdateIscnRecord } as MsgUpdateIscnRecord;
    if (object.from !== undefined && object.from !== null) {
      message.from = String(object.from);
    } else {
      message.from = "";
    }
    if (object.iscnId !== undefined && object.iscnId !== null) {
      message.iscnId = String(object.iscnId);
    } else {
      message.iscnId = "";
    }
    if (object.record !== undefined && object.record !== null) {
      message.record = IscnRecord.fromJSON(object.record);
    } else {
      message.record = undefined;
    }
    return message;
  },

  toJSON(message: MsgUpdateIscnRecord): unknown {
    const obj: any = {};
    message.from !== undefined && (obj.from = message.from);
    message.iscnId !== undefined && (obj.iscnId = message.iscnId);
    message.record !== undefined &&
      (obj.record = message.record
        ? IscnRecord.toJSON(message.record)
        : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<MsgUpdateIscnRecord>): MsgUpdateIscnRecord {
    const message = { ...baseMsgUpdateIscnRecord } as MsgUpdateIscnRecord;
    if (object.from !== undefined && object.from !== null) {
      message.from = object.from;
    } else {
      message.from = "";
    }
    if (object.iscnId !== undefined && object.iscnId !== null) {
      message.iscnId = object.iscnId;
    } else {
      message.iscnId = "";
    }
    if (object.record !== undefined && object.record !== null) {
      message.record = IscnRecord.fromPartial(object.record);
    } else {
      message.record = undefined;
    }
    return message;
  },
};

const baseMsgUpdateIscnRecordResponse: object = { iscnId: "", recordIpld: "" };

export const MsgUpdateIscnRecordResponse = {
  encode(
    message: MsgUpdateIscnRecordResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.iscnId !== "") {
      writer.uint32(10).string(message.iscnId);
    }
    if (message.recordIpld !== "") {
      writer.uint32(18).string(message.recordIpld);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgUpdateIscnRecordResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseMsgUpdateIscnRecordResponse,
    } as MsgUpdateIscnRecordResponse;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.iscnId = reader.string();
          break;
        case 2:
          message.recordIpld = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgUpdateIscnRecordResponse {
    const message = {
      ...baseMsgUpdateIscnRecordResponse,
    } as MsgUpdateIscnRecordResponse;
    if (object.iscnId !== undefined && object.iscnId !== null) {
      message.iscnId = String(object.iscnId);
    } else {
      message.iscnId = "";
    }
    if (object.recordIpld !== undefined && object.recordIpld !== null) {
      message.recordIpld = String(object.recordIpld);
    } else {
      message.recordIpld = "";
    }
    return message;
  },

  toJSON(message: MsgUpdateIscnRecordResponse): unknown {
    const obj: any = {};
    message.iscnId !== undefined && (obj.iscnId = message.iscnId);
    message.recordIpld !== undefined && (obj.recordIpld = message.recordIpld);
    return obj;
  },

  fromPartial(
    object: DeepPartial<MsgUpdateIscnRecordResponse>
  ): MsgUpdateIscnRecordResponse {
    const message = {
      ...baseMsgUpdateIscnRecordResponse,
    } as MsgUpdateIscnRecordResponse;
    if (object.iscnId !== undefined && object.iscnId !== null) {
      message.iscnId = object.iscnId;
    } else {
      message.iscnId = "";
    }
    if (object.recordIpld !== undefined && object.recordIpld !== null) {
      message.recordIpld = object.recordIpld;
    } else {
      message.recordIpld = "";
    }
    return message;
  },
};

const baseMsgChangeIscnRecordOwnership: object = {
  from: "",
  iscnId: "",
  newOwner: "",
};

export const MsgChangeIscnRecordOwnership = {
  encode(
    message: MsgChangeIscnRecordOwnership,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.from !== "") {
      writer.uint32(10).string(message.from);
    }
    if (message.iscnId !== "") {
      writer.uint32(18).string(message.iscnId);
    }
    if (message.newOwner !== "") {
      writer.uint32(26).string(message.newOwner);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgChangeIscnRecordOwnership {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseMsgChangeIscnRecordOwnership,
    } as MsgChangeIscnRecordOwnership;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.from = reader.string();
          break;
        case 2:
          message.iscnId = reader.string();
          break;
        case 3:
          message.newOwner = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgChangeIscnRecordOwnership {
    const message = {
      ...baseMsgChangeIscnRecordOwnership,
    } as MsgChangeIscnRecordOwnership;
    if (object.from !== undefined && object.from !== null) {
      message.from = String(object.from);
    } else {
      message.from = "";
    }
    if (object.iscnId !== undefined && object.iscnId !== null) {
      message.iscnId = String(object.iscnId);
    } else {
      message.iscnId = "";
    }
    if (object.newOwner !== undefined && object.newOwner !== null) {
      message.newOwner = String(object.newOwner);
    } else {
      message.newOwner = "";
    }
    return message;
  },

  toJSON(message: MsgChangeIscnRecordOwnership): unknown {
    const obj: any = {};
    message.from !== undefined && (obj.from = message.from);
    message.iscnId !== undefined && (obj.iscnId = message.iscnId);
    message.newOwner !== undefined && (obj.newOwner = message.newOwner);
    return obj;
  },

  fromPartial(
    object: DeepPartial<MsgChangeIscnRecordOwnership>
  ): MsgChangeIscnRecordOwnership {
    const message = {
      ...baseMsgChangeIscnRecordOwnership,
    } as MsgChangeIscnRecordOwnership;
    if (object.from !== undefined && object.from !== null) {
      message.from = object.from;
    } else {
      message.from = "";
    }
    if (object.iscnId !== undefined && object.iscnId !== null) {
      message.iscnId = object.iscnId;
    } else {
      message.iscnId = "";
    }
    if (object.newOwner !== undefined && object.newOwner !== null) {
      message.newOwner = object.newOwner;
    } else {
      message.newOwner = "";
    }
    return message;
  },
};

const baseMsgChangeIscnRecordOwnershipResponse: object = {};

export const MsgChangeIscnRecordOwnershipResponse = {
  encode(
    _: MsgChangeIscnRecordOwnershipResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgChangeIscnRecordOwnershipResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseMsgChangeIscnRecordOwnershipResponse,
    } as MsgChangeIscnRecordOwnershipResponse;
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

  fromJSON(_: any): MsgChangeIscnRecordOwnershipResponse {
    const message = {
      ...baseMsgChangeIscnRecordOwnershipResponse,
    } as MsgChangeIscnRecordOwnershipResponse;
    return message;
  },

  toJSON(_: MsgChangeIscnRecordOwnershipResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(
    _: DeepPartial<MsgChangeIscnRecordOwnershipResponse>
  ): MsgChangeIscnRecordOwnershipResponse {
    const message = {
      ...baseMsgChangeIscnRecordOwnershipResponse,
    } as MsgChangeIscnRecordOwnershipResponse;
    return message;
  },
};

/** Msg defines the bank Msg service. */
export interface Msg {
  /** CreateIscnRecord defines a method to create ISCN metadata */
  CreateIscnRecord(
    request: MsgCreateIscnRecord
  ): Promise<MsgCreateIscnRecordResponse>;
  /** UpdateIscnRecord defines a method to update existing ISCN metadata */
  UpdateIscnRecord(
    request: MsgUpdateIscnRecord
  ): Promise<MsgUpdateIscnRecordResponse>;
  /** ChangeIscnRecordOwnership defines a method to update the ownership of existing ISCN metadata */
  ChangeIscnRecordOwnership(
    request: MsgChangeIscnRecordOwnership
  ): Promise<MsgChangeIscnRecordOwnershipResponse>;
}

export class MsgClientImpl implements Msg {
  private readonly rpc: Rpc;
  constructor(rpc: Rpc) {
    this.rpc = rpc;
    this.CreateIscnRecord = this.CreateIscnRecord.bind(this);
    this.UpdateIscnRecord = this.UpdateIscnRecord.bind(this);
    this.ChangeIscnRecordOwnership = this.ChangeIscnRecordOwnership.bind(this);
  }
  CreateIscnRecord(
    request: MsgCreateIscnRecord
  ): Promise<MsgCreateIscnRecordResponse> {
    const data = MsgCreateIscnRecord.encode(request).finish();
    const promise = this.rpc.request(
      "likechain.iscn.Msg",
      "CreateIscnRecord",
      data
    );
    return promise.then((data) =>
      MsgCreateIscnRecordResponse.decode(new _m0.Reader(data))
    );
  }

  UpdateIscnRecord(
    request: MsgUpdateIscnRecord
  ): Promise<MsgUpdateIscnRecordResponse> {
    const data = MsgUpdateIscnRecord.encode(request).finish();
    const promise = this.rpc.request(
      "likechain.iscn.Msg",
      "UpdateIscnRecord",
      data
    );
    return promise.then((data) =>
      MsgUpdateIscnRecordResponse.decode(new _m0.Reader(data))
    );
  }

  ChangeIscnRecordOwnership(
    request: MsgChangeIscnRecordOwnership
  ): Promise<MsgChangeIscnRecordOwnershipResponse> {
    const data = MsgChangeIscnRecordOwnership.encode(request).finish();
    const promise = this.rpc.request(
      "likechain.iscn.Msg",
      "ChangeIscnRecordOwnership",
      data
    );
    return promise.then((data) =>
      MsgChangeIscnRecordOwnershipResponse.decode(new _m0.Reader(data))
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
