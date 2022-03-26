import { getRealTimeDatabase } from "my-utils";
import { PrivateApi, PublicApi } from "node-bitbankcc";

const PRIVATE_ENDPOINT = 'https://api.bitbank.cc/v1'
const PUBLIC_ENDPOINT = 'https://public.bitbank.cc'
const PATH = 'settings/bitbank/'

export async function getBitBankPrivateAPI(debug: boolean = false): Promise<PrivateApi> {
    const rdb = await getRealTimeDatabase()
    const apiKey = await rdb.get(await rdb.getReference(PATH + 'apiKey')) as string
    const secret = await rdb.get(await rdb.getReference(PATH + 'apiSecret')) as string
    return new PrivateApi({
        endPoint: PRIVATE_ENDPOINT,
        // keepAlive?: boolean,
        // timeout?: number,
        apiKey: apiKey,
        apiSecret: secret
    },{
        optionsCallback: (options: any) => {
            if (debug && options) {
                console.log(options['method'], options['baseURL'], options['url'])
            }
        },
        responseCallback: (response: any) => {
            if (debug && response) {
                // console.log(response)
            }
        }
    })
}

export async function getBitBankPublicAPI(): Promise<PublicApi> {
    return new PublicApi({
        endPoint: PUBLIC_ENDPOINT
        // keepAlive?: boolean;
        // timeout?: number;
    })
}