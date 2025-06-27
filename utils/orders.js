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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.placeOrder = placeOrder;
exports.getAccountBalance = getAccountBalance;
exports.getTrendFilter = getTrendFilter;
var axios_1 = require("axios");
var crypto = require("crypto");
var MODE = "demo"; // "demo" or "prod"
var API_KEY = MODE === "demo" ? process.env.API_KEY_DEMO : process.env.API_KEY;
var API_SECRET = MODE === "demo" ? process.env.API_SECRET_DEMO : process.env.API_SECRET;
var PASSPHRASE = process.env.PASSPHRASE;
var baseURL = "https://www.okx.com";
function signRequest(timestamp, method, endpoint, body) {
    if (!API_SECRET)
        throw new Error("API_SECRET not defined");
    var prehash = timestamp + method + endpoint + (body || "");
    return crypto.createHmac("sha256", API_SECRET).update(prehash).digest("base64");
}
function placeOrder(order) {
    return __awaiter(this, void 0, void 0, function () {
        var endpoint, method, timestamp, body, sign, headers, response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    endpoint = "/api/v5/trade/order";
                    method = "POST";
                    timestamp = new Date().toISOString();
                    body = JSON.stringify(order);
                    sign = signRequest(timestamp, method, endpoint, body);
                    headers = {
                        "OK-ACCESS-KEY": API_KEY || "",
                        "OK-ACCESS-SIGN": sign,
                        "OK-ACCESS-TIMESTAMP": timestamp,
                        "OK-ACCESS-PASSPHRASE": PASSPHRASE || "",
                        "Content-Type": "application/json",
                        "x-simulated-trading": MODE === "demo" ? "1" : "0", // 0 - реальная торговля, 1 - симуляция
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1.default.post(baseURL + endpoint, order, { headers: headers })];
                case 2:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
                case 3:
                    error_1 = _a.sent();
                    console.error("Error placing order:", error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function getAccountBalance(ccy) {
    return __awaiter(this, void 0, void 0, function () {
        var endpoint, method, timestamp, queryParams, sign, headers, response, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    endpoint = "/api/v5/account/balance";
                    method = "GET";
                    timestamp = new Date().toISOString();
                    queryParams = ccy ? "?ccy=".concat(ccy) : "";
                    sign = signRequest(timestamp, method, endpoint + queryParams, undefined);
                    headers = {
                        "OK-ACCESS-KEY": API_KEY || "",
                        "OK-ACCESS-SIGN": sign,
                        "OK-ACCESS-TIMESTAMP": timestamp,
                        "OK-ACCESS-PASSPHRASE": PASSPHRASE || "",
                        "x-simulated-trading": MODE === "demo" ? "1" : "0",
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1.default.get(baseURL + endpoint + queryParams, { headers: headers })];
                case 2:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
                case 3:
                    error_2 = _a.sent();
                    console.error("Error getting account balance:", error_2);
                    throw error_2;
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Получаем данные свечей с биржи для расчета SMA
function getCandles() {
    return __awaiter(this, arguments, void 0, function (instId, bar, limit) {
        var endpoint, response, error_3;
        if (instId === void 0) { instId = "BTC-USDT"; }
        if (bar === void 0) { bar = "1H"; }
        if (limit === void 0) { limit = 200; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    endpoint = "/api/v5/market/candles?instId=".concat(instId, "&bar=").concat(bar, "&limit=").concat(limit);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1.default.get(baseURL + endpoint)];
                case 2:
                    response = _a.sent();
                    return [2 /*return*/, response.data.data.map(function (candle) { return parseFloat(candle[4]); })]; // закрытие свечи
                case 3:
                    error_3 = _a.sent();
                    console.error("Error getting candles:", error_3);
                    return [2 /*return*/, []];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Рассчитываем SMA
function calculateSMA(prices, period) {
    if (period === void 0) { period = 50; }
    if (prices.length < period)
        return null;
    var sum = prices.slice(-period).reduce(function (a, b) { return a + b; }, 0);
    return sum / period;
}
// Функция определения тренда
function getTrendFilter() {
    return __awaiter(this, void 0, void 0, function () {
        var candles, sma50, sma200, currentPrice;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getCandles()];
                case 1:
                    candles = _a.sent();
                    if (candles.length < 200)
                        return [2 /*return*/, "neutral"];
                    sma50 = calculateSMA(candles, 50);
                    sma200 = calculateSMA(candles, 200);
                    currentPrice = candles[candles.length - 1];
                    // console.log("SMA50:", sma50);
                    // console.log("SMA200:", sma200);
                    // console.log("Current Price:", currentPrice);
                    if (!sma50 || !sma200)
                        return [2 /*return*/, "neutral"];
                    if (currentPrice > sma50 && sma50 > sma200)
                        return [2 /*return*/, "uptrend"];
                    if (currentPrice < sma50 && sma50 < sma200)
                        return [2 /*return*/, "downtrend"];
                    return [2 /*return*/, "neutral"];
            }
        });
    });
}
