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
exports.getRSIfromBinance = getRSIfromBinance;
// Если используешь в Node.js, добавь это:
var node_fetch_1 = require("node-fetch"); // npm install node-fetch@2
// RSI расчет
function calculateRSI(closes, period) {
    if (period === void 0) { period = 14; }
    if (closes.length < period + 1) {
        throw new Error("Недостаточно данных для расчёта RSI");
    }
    var gains = 0;
    var losses = 0;
    for (var i = 1; i <= period; i++) {
        var delta = closes[i] - closes[i - 1];
        if (delta > 0) {
            gains += delta;
        }
        else {
            losses += -delta;
        }
    }
    var avgGain = gains / period;
    var avgLoss = losses / period;
    for (var i = period + 1; i < closes.length; i++) {
        var delta = closes[i] - closes[i - 1];
        var gain = delta > 0 ? delta : 0;
        var loss = delta < 0 ? -delta : 0;
        avgGain = (avgGain * (period - 1) + gain) / period;
        avgLoss = (avgLoss * (period - 1) + loss) / period;
    }
    var rs = avgGain / avgLoss;
    return 100 - 100 / (1 + rs);
}
// Получение свечей с Binance
function getRSIfromBinance() {
    return __awaiter(this, arguments, void 0, function (symbol, interval, limit, period) {
        var url, response, data, closes, rsi, err_1;
        if (symbol === void 0) { symbol = "BTCUSDT"; }
        if (interval === void 0) { interval = "30m"; }
        if (limit === void 0) { limit = 100; }
        if (period === void 0) { period = 14; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = "https://api.binance.com/api/v3/klines?symbol=".concat(symbol, "&interval=").concat(interval, "&limit=").concat(limit);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, (0, node_fetch_1.default)(url)];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    closes = data.map(function (candle) { return parseFloat(candle[4]); });
                    rsi = calculateRSI(closes, period);
                    return [2 /*return*/, rsi];
                case 4:
                    err_1 = _a.sent();
                    console.error("Ошибка при получении свечей или расчёте RSI:", err_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// Вызов
getRSIfromBinance();
