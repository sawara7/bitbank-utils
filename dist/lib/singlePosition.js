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
exports.SinglePosition = void 0;
const my_utils_1 = require("my-utils");
class SinglePosition {
    constructor(params) {
        // Position State
        this._initialSize = 0;
        this._currentSize = 0;
        this._openID = 0;
        this._closeID = 0;
        this._openTime = 0;
        this._closeTime = 0;
        this._isLosscut = false;
        this._openSide = 'buy';
        this._currentOpenPrice = 0;
        this._currentClosePrice = 0;
        this._closeRate = 1;
        // Information
        this._closeCount = 0;
        this._losscutCount = 0;
        this._cumulativeFee = 0;
        this._cumulativeProfit = 0;
        if (!SinglePosition._lastOrderTime) {
            SinglePosition._lastOrderTime = {};
        }
        this._marketName = params.marketName;
        if (!SinglePosition._lastOrderTime[this._marketName]) {
            SinglePosition._lastOrderTime[this._marketName] = Date.now();
        }
        this._funds = params.funds;
        this._api = params.api;
        this._minOrderInterval = params.minOrderInterval || 200;
        this._openOrderSettings = params.openOrderSettings;
        this._closeOrderSettings = params.closeOrderSettings;
        this._sizeResolution = params.sizeResolution;
        this._priceResolution = params.priceResolution;
        this._closeRate = params.closeRate || 1;
    }
    roundSize(size) {
        return Math.round(size * (1 / this._sizeResolution)) / (1 / this._sizeResolution);
    }
    roundPrice(price) {
        return Math.round(price * (1 / this._priceResolution)) / (1 / this._priceResolution);
    }
    placeOrder(side, type, size, price, postOnly) {
        return __awaiter(this, void 0, void 0, function* () {
            const p = {
                pair: this._marketName,
                amount: this.roundSize(size).toString(),
                side: side,
                type: type
            };
            if (price) {
                p.price = this.roundPrice(price);
            }
            if (postOnly) {
                p.post_only = true;
            }
            if (SinglePosition._lastOrderTime && SinglePosition._lastOrderTime[this._marketName]) {
                const interval = Date.now() - SinglePosition._lastOrderTime[this._marketName];
                if (interval > 0) {
                    if (interval < this._minOrderInterval) {
                        SinglePosition._lastOrderTime[this._marketName] += this._minOrderInterval;
                        yield (0, my_utils_1.sleep)(this._minOrderInterval - interval);
                    }
                    else if (interval > this._minOrderInterval) {
                        SinglePosition._lastOrderTime[this._marketName] = Date.now();
                    }
                }
                else if (interval < 0) {
                    SinglePosition._lastOrderTime[this._marketName] += this._minOrderInterval;
                    yield (0, my_utils_1.sleep)(SinglePosition._lastOrderTime[this._marketName] - Date.now());
                }
            }
            const res = yield this._api.postOrder(p);
            if (res.success) {
                return res;
            }
            else {
                throw new Error('failed');
            }
        });
    }
    setOpen(res) {
        this._openSide = res.side === 'buy' ? 'buy' : 'sell';
        this._openID = res.order_id;
        this._openTime = Date.now();
    }
    setClose(res) {
        this._closeID = res.order_id;
        this._closeTime = Date.now();
    }
    resetOpen() {
        this._openID = 0;
    }
    resetClose() {
        this._closeID = 0;
    }
    open() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._openOrderSettings) {
                return { success: false, message: 'No open order settings.' };
            }
            if (this._openOrderSettings.type === 'limit') {
                return yield this.openLimit(this._openOrderSettings.side, this._openOrderSettings.price, this._openOrderSettings.postOnly, this._openOrderSettings.cancelSec || 0);
            }
            else if (this._openOrderSettings.type === 'market') {
                return yield this.openMarket(this._openOrderSettings.side, this._openOrderSettings.price);
            }
            return { success: false, message: 'Open Failed.' };
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._closeOrderSettings) {
                return { success: false, message: 'No close order settings.' };
            }
            this._currentSize = this.roundSize(this._currentSize * this._closeRate);
            if (this._closeOrderSettings.type === 'limit') {
                return yield this.closeLimit(this._closeOrderSettings.price, this._closeOrderSettings.postOnly, this._closeOrderSettings.cancelSec || 0);
            }
            else if (this._closeOrderSettings.type === 'market') {
                return yield this.closeMarket();
            }
            return { success: false, message: 'Close Failed.' };
        });
    }
    openMarket(side, price) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._openID > 0) {
                return { success: false, message: 'Position is already opened.' };
            }
            const result = {
                success: false
            };
            this._openID = 1; // lock
            try {
                const res = yield this.placeOrder(side, 'market', this._funds / price);
                this.setOpen(res.data);
                result.success = true;
            }
            catch (e) {
                result.message = e;
                this._openID = 0;
            }
            return result;
        });
    }
    openLimit(side, price, postOnly = true, cancelSec = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._openID > 0) {
                return { success: false, message: 'Position is already opened.' };
            }
            const result = {
                success: false
            };
            this._openID = 1; // lock
            try {
                const res = yield this.placeOrder(side, 'limit', this._funds / price, price, postOnly);
                this.setOpen(res.data);
                result.success = true;
                if (cancelSec > 0) {
                    setTimeout(() => {
                        if (this._openID !== 0) {
                            this._api.cancelOrder({
                                order_id: this._openID,
                                pair: this._marketName
                            });
                        }
                    }, cancelSec * 1000);
                }
            }
            catch (e) {
                result.message = e;
                this._openID = 0;
            }
            return result;
        });
    }
    closeMarket() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._closeID > 0) {
                return { success: false, message: 'Position is already closed.' };
            }
            const result = {
                success: false
            };
            this._closeID = 1; // lock
            try {
                const res = yield this.placeOrder(this._openSide === 'buy' ? 'sell' : 'buy', 'market', this._currentSize);
                this.setClose(res.data);
                result.success = true;
            }
            catch (e) {
                result.message = e;
                this._closeID = 0;
            }
            return result;
        });
    }
    closeLimit(price, postOnly = true, cancelSec = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._closeID > 0) {
                return { success: false, message: 'Position is already closed.' };
            }
            const result = {
                success: false
            };
            this._closeID = 1;
            try {
                const res = yield this.placeOrder(this._openSide === 'buy' ? 'sell' : 'buy', 'limit', this._currentSize, price, postOnly);
                this.setClose(res.data);
                result.success = true;
                if (cancelSec > 0) {
                    setTimeout(() => {
                        if (this._closeID !== 0) {
                            this._api.cancelOrder({
                                order_id: this._closeID,
                                pair: this._marketName
                            });
                        }
                    }, cancelSec * 1000);
                }
            }
            catch (e) {
                result.message = e;
                this._closeID = 0;
            }
            return result;
        });
    }
    // public updateTicker(ticker: wsTicker) {
    //     // ToDO: 含み損更新
    // }
    updateOrder(order) {
        if (['UNFILLED', 'PARTIALLY_FILLED'].includes(order.status)) {
            return;
        }
        const size = this.roundSize(parseFloat(order.start_amount));
        const filled = this.roundSize(parseFloat(order.executed_amount));
        if (order.order_id === this._openID) {
            this.resetOpen();
            if (filled > 0) {
                this._currentSize += filled;
                this._initialSize += filled;
                this._currentOpenPrice = parseFloat(order.average_price);
            }
            if (filled !== size) {
                if (this.onOpenOrderCanceled) {
                    this.onOpenOrderCanceled(this);
                }
            }
            if (filled === size) {
                if (this.onOpened) {
                    this.onOpened(this);
                }
            }
        }
        if (order.order_id === this._closeID) {
            this.resetClose();
            if (filled > 0) {
                this._currentSize -= filled;
                this._currentClosePrice = parseFloat(order.average_price);
            }
            if (filled !== size) {
                if (this.onCloseOrderCanceled) {
                    this.onCloseOrderCanceled(this);
                }
            }
            if (this._isLosscut && this._currentSize > 0) {
                this.closeMarket();
            }
            if (filled === size) {
                if (this._isLosscut) {
                    this._losscutCount++;
                    this._isLosscut = false;
                }
                this._cumulativeProfit += this._initialSize *
                    (this._openSide === 'buy' ?
                        (this._currentClosePrice - this._currentOpenPrice) :
                        (this._currentOpenPrice - this._currentClosePrice));
                this._initialSize = 0;
                this._currentSize = 0;
                this._closeCount++;
                if (this.onClosed) {
                    this.onClosed(this);
                }
            }
        }
    }
    // public updateFill(fill: wsFill) {
    //     if (fill.market === this._marketName) {
    //         this._cumulativeFee += fill.fee
    //     }
    // }
    losscut() {
        this._isLosscut = true;
        this.cancelCloseOrder();
    }
    // public cancelAll() {
    //     if (this._closeID > 0 || this._openID > 0){
    //         this._api.cancelAllOrder({
    //             market: this._marketName
    //         })
    //     }
    // }
    cancelOpenOrder() {
        if (this._openID > 0) {
            this._api.cancelOrder({
                order_id: this._openID,
                pair: this._marketName
            });
        }
    }
    cancelCloseOrder() {
        if (this._closeID > 0) {
            this._api.cancelOrder({
                order_id: this._closeID,
                pair: this._marketName
            });
        }
    }
    get profit() {
        return this._cumulativeProfit - this._cumulativeFee;
    }
    get enabledOpen() {
        return this._openID === 0 &&
            this._closeID === 0 &&
            this._currentSize === 0;
    }
    get enabledClose() {
        return this._openID === 0 &&
            this._closeID === 0 &&
            this._currentSize > 0;
    }
    get activeOrderID() {
        let res = -1;
        if (this._openID !== 0 && this._closeID === 0) {
            res = this._openID;
        }
        if (this._openID === 0 && this._closeID !== 0 && this._currentSize > 0) {
            res = this._closeID;
        }
        return res;
    }
    get openOrderSettings() {
        return this._openOrderSettings;
    }
    get closeOrderSettings() {
        return this._closeOrderSettings;
    }
    get currentSize() {
        return this._currentSize;
    }
    get isLosscut() {
        return this._isLosscut;
    }
    get openSide() {
        return this._openSide;
    }
    get currentOpenPrice() {
        return this._currentOpenPrice;
    }
    get currentClosePrice() {
        return this._currentClosePrice;
    }
    get closeCount() {
        return this._closeCount;
    }
    get losscutCount() {
        return this._losscutCount;
    }
}
exports.SinglePosition = SinglePosition;
