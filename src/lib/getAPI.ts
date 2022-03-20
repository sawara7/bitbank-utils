import { getRealTimeDatabase } from "my-utils";
import { PrivateApi } from "node-bitbankcc";

const END_POINT = 'https://api.bitbank.cc/v1'
const PATH = 'settings/bitbank/'

export async function getBitBankPrivateAPI(): Promise<PrivateApi> {
    const rdb = await getRealTimeDatabase()
    const apiKey = await rdb.get(await rdb.getReference(PATH + 'apiKey')) as string
    const secret = await rdb.get(await rdb.getReference(PATH + 'apiSecret')) as string
    return new PrivateApi({
        endPoint: END_POINT,
        // keepAlive?: boolean,
        // timeout?: number,
        apiKey: apiKey,
        apiSecret: secret
    })
}