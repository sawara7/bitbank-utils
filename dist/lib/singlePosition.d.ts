import { OrderSide, OrderType } from "my-utils";
import { PrivateApi, OrderResponse } from "node-bitbankcc";
export interface SinglePositionParameters {
    marketName: string;
    funds: number;
    api: PrivateApi;
    sizeResolution: number;
    priceResolution: number;
    minOrderInterval?: number;
    openOrderSettings?: OrderSettings;
    closeOrderSettings?: OrderSettings;
}
export interface SinglePositionResponse {
    success: boolean;
    message?: any;
}
export interface OrderSettings {
    side: OrderSide;
    type: OrderType;
    price: number;
    size?: number;
    postOnly?: boolean;
    cancelSec?: number;
}
export declare class SinglePosition {
    private static _lastOrderTime?;
    private _api;
    private _marketName;
    private _funds;
    private _minOrderInterval;
    private _openOrderSettings?;
    private _closeOrderSettings?;
    private _initialSize;
    private _currentSize;
    private _openID;
    private _closeID;
    private _openTime;
    private _closeTime;
    private _isLosscut;
    private _openSide;
    private _currentOpenPrice;
    private _currentClosePrice;
    private _sizeResolution;
    private _priceResolution;
    private _closeCount;
    private _losscutCount;
    private _cumulativeFee;
    private _cumulativeProfit;
    onOpened?: (pos: SinglePosition) => void;
    onClosed?: (pos: SinglePosition) => void;
    onOpenOrderCanceled?: (pos: SinglePosition) => void;
    onCloseOrderCanceled?: (pos: SinglePosition) => void;
    constructor(params: SinglePositionParameters);
    private roundSize;
    private roundPrice;
    private placeOrder;
    private setOpen;
    private setClose;
    private resetOpen;
    private resetClose;
    open(): Promise<SinglePositionResponse>;
    close(): Promise<SinglePositionResponse>;
    openMarket(side: OrderSide, price: number): Promise<SinglePositionResponse>;
    openLimit(side: 'buy' | 'sell', price: number, postOnly?: boolean, cancelSec?: number): Promise<SinglePositionResponse>;
    closeMarket(): Promise<SinglePositionResponse>;
    closeLimit(price: number, postOnly?: boolean, cancelSec?: number): Promise<SinglePositionResponse>;
    updateOrder(order: OrderResponse): void;
    losscut(): void;
    cancelOpenOrder(): void;
    cancelCloseOrder(): void;
    get profit(): number;
    get enabledOpen(): Boolean;
    get enabledClose(): Boolean;
    get activeOrderID(): number;
    get openOrderSettings(): OrderSettings | undefined;
    get closeOrderSettings(): OrderSettings | undefined;
    get currentSize(): number;
    get isLosscut(): boolean;
    get openSide(): OrderSide;
    get currentOpenPrice(): number;
    get currentClosePrice(): number;
    get closeCount(): number;
    get losscutCount(): number;
}
