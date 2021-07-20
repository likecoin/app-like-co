// eslint-disable-next-line import/no-extraneous-dependencies
import { OfflineSigner } from '@cosmjs/proto-signing';

export {};
declare global {
    interface Window {
        keplr: any;
        getOfflineSigner(id: string): OfflineSigner;
    }
}

