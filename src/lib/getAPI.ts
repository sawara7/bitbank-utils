import { getRealTimeDatabase } from "my-utils";
import { PrivateApi, PublicApi } from "node-bitbankcc";

const PRIVATE_ENDPOINT = 'https://api.bitbank.cc/v1'
const PUBLIC_ENDPOINT = 'https://public.bitbank.cc'
const PATH = 'settings/bitbank/'

export async function getBitBankPrivateAPI(): Promise<PrivateApi> {
    const rdb = await getRealTimeDatabase()
    const apiKey = await rdb.get(await rdb.getReference(PATH + 'apiKey')) as string
    const secret = await rdb.get(await rdb.getReference(PATH + 'apiSecret')) as string
    return new PrivateApi({
        endPoint: PRIVATE_ENDPOINT,
        // keepAlive?: boolean,
        // timeout?: number,
        apiKey: apiKey,
        apiSecret: secret
    })
}

export async function getBitBankPublicAPI(): Promise<PublicApi> {
    return new PublicApi({
        endPoint: PUBLIC_ENDPOINT
        // keepAlive?: boolean;
        // timeout?: number;
    })
}