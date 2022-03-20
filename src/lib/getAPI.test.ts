import { getBitBankPrivateAPI, getBitBankPublicAPI } from ".."

(async ()=> {
    const privateAPI = await getBitBankPrivateAPI()
    const publicAPI = await getBitBankPublicAPI()
    const tk = await publicAPI.getTicker({pair: "xrp_jpy"})
    const asset = await privateAPI.getAssets()
    console.log(tk)
    console.log(asset)
})()