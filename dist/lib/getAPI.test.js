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
const __1 = require("..");
(() => __awaiter(void 0, void 0, void 0, function* () {
    const privateAPI = yield (0, __1.getBitBankPrivateAPI)();
    const publicAPI = yield (0, __1.getBitBankPublicAPI)();
    const tk = yield publicAPI.getTicker({ pair: "xrp_jpy" });
    const asset = yield privateAPI.getAssets();
    console.log(tk);
    console.log(asset);
}))();
