"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBitBankPublicAPI = exports.getBitBankPrivateAPI = void 0;
const my_utils_1 = require("my-utils");
const node_bitbankcc_1 = require("node-bitbankcc");
const PRIVATE_ENDPOINT = 'https://api.bitbank.cc/v1';
const PUBLIC_ENDPOINT = 'https://public.bitbank.cc';
const PATH = 'settings/bitbank/';
function getBitBankPrivateAPI(debug = false) {
    return __awaiter(this, void 0, void 0, function* () {
        const rdb = yield (0, my_utils_1.getRealTimeDatabase)();
        const apiKey = yield rdb.get(yield rdb.getReference(PATH + 'apiKey'));
        const secret = yield rdb.get(yield rdb.getReference(PATH + 'apiSecret'));
        return new node_bitbankcc_1.PrivateApi({
            endPoint: PRIVATE_ENDPOINT,
            // keepAlive?: boolean,
            // timeout?: number,
            apiKey: apiKey,
            apiSecret: secret
        }, {
            optionsCallback: (options) => {
                if (debug && options) {
                    console.log(options['method'], options['baseURL'], options['url']);
                }
            },
            responseCallback: (response) => {
                if (debug && response) {
                    // console.log(response)
                }
            }
        });
    });
}
exports.getBitBankPrivateAPI = getBitBankPrivateAPI;
function getBitBankPublicAPI() {
    return __awaiter(this, void 0, void 0, function* () {
        return new node_bitbankcc_1.PublicApi({
            endPoint: PUBLIC_ENDPOINT
            // keepAlive?: boolean;
            // timeout?: number;
        });
    });
}
exports.getBitBankPublicAPI = getBitBankPublicAPI;
