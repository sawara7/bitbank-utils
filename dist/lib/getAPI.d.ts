import { PrivateApi, PublicApi } from "node-bitbankcc";
export declare function getBitBankPrivateAPI(debug?: boolean): Promise<PrivateApi>;
export declare function getBitBankPublicAPI(): Promise<PublicApi>;
