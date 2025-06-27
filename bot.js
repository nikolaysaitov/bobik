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
var WebSocket = require("ws");
var api_1 = require("./utils/api");
var utils_1 = require("./utils/utils");
var orders_1 = require("./utils/orders");
var WS_URL = "wss://ws.okx.com:8443/ws/v5/public";
var orderBuy = { price: 0 };
var orderSell = { price: 0 };
var DEPOSIT = 10000; //4 981,55 ₽
var tick = 0;
var RSI = 0;
var openPosition = "";
var TREND = "";
console.log("TREND", TREND);
var getBalance = function () { return __awaiter(void 0, void 0, void 0, function () {
    var usdtBalance, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, (0, orders_1.getAccountBalance)("USDT")];
            case 1:
                usdtBalance = _a.sent();
                console.log("USDT balance:", usdtBalance.data[0].details[0].cashBal);
                DEPOSIT = usdtBalance.data[0].details[0].cashBal;
                return [2 /*return*/, usdtBalance.data[0].details[0].cashBal];
            case 2:
                error_1 = _a.sent();
                console.error("Error getting account balance:", error_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
getBalance();
var PROFIT_TARGET = utils_1.TRADING_CONFIG.PROFIT_MULTIPLIER;
var STOP_LOSS = utils_1.TRADING_CONFIG.STOP_LOSS_MULTIPLIER;
var tradeHistory = []; // хранит 'profit' или 'stop'
var waitUntil = 0; // timestamp до которого ждать перед следующей сделкой
var getData = function () { return __awaiter(void 0, void 0, void 0, function () {
    var res, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, (0, api_1.getRSIfromBinance)()];
            case 1:
                res = _a.sent();
                RSI = res ? res : 0;
                return [2 /*return*/, res];
            case 2:
                error_2 = _a.sent();
                (0, utils_1.sendTelegramMessage)("\u274C Error placing order: ".concat(error_2, " | RSI: ").concat(RSI, " | DEPOSIT ").concat(DEPOSIT));
                console.error("Ошибка при получении данных RSI:", error_2);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
function start() {
    var _this = this;
    var ws = new WebSocket.WebSocket(WS_URL);
    ws.on("open", function () {
        console.log("Connected to OKX WebSocket");
        var subscribeMsg = {
            op: "subscribe",
            args: [
                {
                    channel: "tickers",
                    instId: "BTC-USDT",
                },
            ],
        };
        ws.send(JSON.stringify(subscribeMsg));
    });
    ws.on("message", function (data) { return __awaiter(_this, void 0, void 0, function () {
        var trend, msg, ticker, now, trend_1, stops, trend_2, stops;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getData()];
                case 1:
                    _b.sent(); // RSI обновляется при каждом тике
                    return [4 /*yield*/, (0, orders_1.getTrendFilter)()];
                case 2:
                    trend = _b.sent();
                    TREND = trend;
                    msg = JSON.parse(data.toString());
                    if (msg.event === "subscribe") {
                        console.log("Subscribed:", msg.arg);
                        return [2 /*return*/];
                    }
                    if (msg.event === "error") {
                        console.error("Error:", msg);
                        return [2 /*return*/];
                    }
                    if (!(((_a = msg.arg) === null || _a === void 0 ? void 0 : _a.channel) === "tickers" && msg.data && RSI !== 0)) return [3 /*break*/, 10];
                    ticker = msg.data[0];
                    tick = +ticker.last;
                    now = Date.now();
                    if (!(orderBuy.price === 0)) return [3 /*break*/, 5];
                    if (!(RSI > 60)) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, orders_1.getTrendFilter)()];
                case 3:
                    trend_1 = _b.sent();
                    if (trend_1 !== "uptrend")
                        return [2 /*return*/]; // Фильтр тренда
                    if (now < waitUntil)
                        return [2 /*return*/];
                    orderBuy.price = tick;
                    openPosition = "LONG \u043E\u0442 ".concat(tick);
                    (0, orders_1.placeOrder)(utils_1.openOrderLong)
                        .then(function (result) {
                        console.log("Order placed:", result);
                        if (result.code === "0") {
                            (0, utils_1.sendTelegramMessage)("\uD83D\uDCC8 \u041E\u0442\u043A\u0440\u044B\u0442 LONG \u043F\u043E \u0446\u0435\u043D\u0435: ".concat(tick, " | RSI: ").concat(RSI, " | DEPOSIT ").concat(DEPOSIT));
                        }
                    })
                        .catch(function (err) {
                        console.error("Error placing order:", err);
                        (0, utils_1.sendTelegramMessage)("\u274C Error placing order: ".concat(err, " | RSI: ").concat(RSI, " | DEPOSIT ").concat(DEPOSIT));
                    });
                    _b.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    if (tick >= orderBuy.price + PROFIT_TARGET) {
                        orderBuy.price = 0;
                        openPosition = "";
                        (0, orders_1.placeOrder)(utils_1.closeOrderLong)
                            .then(function (result) {
                            console.log("Order placed:", result);
                            if (result.code === "0") {
                                (0, utils_1.sendTelegramMessage)("\uD83D\uDFE2 TAKE PROFIT (LONG) ".concat(tick, " | RSI: ").concat(RSI, " | DEPOSIT ").concat(DEPOSIT));
                            }
                        })
                            .catch(function (err) {
                            console.error("Error placing order:", err);
                            (0, utils_1.sendTelegramMessage)("\u274C Error placing order: ".concat(err, " | RSI: ").concat(RSI, " | DEPOSIT ").concat(DEPOSIT));
                        });
                        tradeHistory.push("profit");
                        if (tradeHistory.length > utils_1.TRADING_CONFIG.TRADE_HISTORY_LENGTH)
                            tradeHistory.shift();
                    }
                    else if (tick <= orderBuy.price - STOP_LOSS) {
                        orderBuy.price = 0;
                        openPosition = "";
                        (0, orders_1.placeOrder)(utils_1.closeOrderLong)
                            .then(function (result) {
                            console.log("Order placed:", result);
                            if (result.code === "0") {
                                (0, utils_1.sendTelegramMessage)("\u274C STOP LOSS (LONG) ".concat(tick, " | RSI: ").concat(RSI, " | DEPOSIT ").concat(DEPOSIT));
                            }
                        })
                            .catch(function (err) {
                            console.error("Error placing order:", err);
                            (0, utils_1.sendTelegramMessage)("\u274C Error placing order: ".concat(err, " | RSI: ").concat(RSI, " | DEPOSIT ").concat(DEPOSIT));
                        });
                        tradeHistory.push("stop");
                        if (tradeHistory.length > utils_1.TRADING_CONFIG.TRADE_HISTORY_LENGTH)
                            tradeHistory.shift(); // сохраняем только последние 2
                        stops = tradeHistory.slice(-2).filter(function (entry) { return entry === "stop"; }).length;
                        if (stops === 2) {
                            waitUntil = Date.now() + utils_1.TRADING_CONFIG.PAUSE_AFTER_TWO_STOPS;
                            (0, utils_1.sendTelegramMessage)("⏸ Пауза 3 минуты после двух стопов подряд");
                        }
                        else if (stops === 1) {
                            waitUntil = Date.now() + utils_1.TRADING_CONFIG.PAUSE_AFTER_ONE_STOP;
                            (0, utils_1.sendTelegramMessage)("⏸ Пауза 1 минута после одного стопа");
                        }
                    }
                    _b.label = 6;
                case 6:
                    if (!(orderSell.price === 0)) return [3 /*break*/, 9];
                    if (!(RSI < 40)) return [3 /*break*/, 8];
                    return [4 /*yield*/, (0, orders_1.getTrendFilter)()];
                case 7:
                    trend_2 = _b.sent();
                    if (trend_2 !== "downtrend")
                        return [2 /*return*/]; // Фильтр тренда
                    if (now < waitUntil)
                        return [2 /*return*/];
                    orderSell.price = tick;
                    openPosition = "SHORT \u043E\u0442 ".concat(tick);
                    (0, orders_1.placeOrder)(utils_1.openOrderShort)
                        .then(function (result) {
                        console.log("Order placed:", result);
                        if (result.code === "0") {
                            (0, utils_1.sendTelegramMessage)("\uD83D\uDCC9 \u041E\u0442\u043A\u0440\u044B\u0442 SHORT \u043F\u043E \u0446\u0435\u043D\u0435: ".concat(tick, " | RSI: ").concat(RSI, " | DEPOSIT ").concat(DEPOSIT));
                        }
                    })
                        .catch(function (err) {
                        console.error("Error placing order:", err);
                        (0, utils_1.sendTelegramMessage)("\u274C Error placing order: ".concat(err, " | RSI: ").concat(RSI, " | DEPOSIT ").concat(DEPOSIT));
                    });
                    _b.label = 8;
                case 8: return [3 /*break*/, 10];
                case 9:
                    if (tick <= orderSell.price - PROFIT_TARGET) {
                        orderSell.price = 0;
                        openPosition = "";
                        (0, orders_1.placeOrder)(utils_1.closeOrderShort)
                            .then(function (result) {
                            console.log("Order placed:", result);
                            if (result.code === "0") {
                                (0, utils_1.sendTelegramMessage)("\uD83D\uDFE2TAKE PROFIT (SHORT) ".concat(tick, " | RSI: ").concat(RSI, " | DEPOSIT ").concat(DEPOSIT));
                            }
                        })
                            .catch(function (err) {
                            console.error("Error placing order:", err);
                            (0, utils_1.sendTelegramMessage)("\u274C Error placing order: ".concat(err, " | RSI: ").concat(RSI, " | DEPOSIT ").concat(DEPOSIT));
                        });
                        tradeHistory.push("profit");
                        if (tradeHistory.length > utils_1.TRADING_CONFIG.TRADE_HISTORY_LENGTH)
                            tradeHistory.shift();
                    }
                    else if (tick >= orderSell.price + STOP_LOSS) {
                        orderSell.price = 0;
                        openPosition = "";
                        (0, orders_1.placeOrder)(utils_1.closeOrderShort)
                            .then(function (result) {
                            console.log("Order placed:", result);
                            if (result.code === "0") {
                                (0, utils_1.sendTelegramMessage)("\u274C STOP LOSS (SHORT) ".concat(tick, " | RSI: ").concat(RSI, " | DEPOSIT ").concat(DEPOSIT));
                            }
                        })
                            .catch(function (err) {
                            console.error("Error placing order:", err);
                            (0, utils_1.sendTelegramMessage)("\u274C Error placing order: ".concat(err, " | RSI: ").concat(RSI, " | DEPOSIT ").concat(DEPOSIT));
                        });
                        tradeHistory.push("stop");
                        if (tradeHistory.length > utils_1.TRADING_CONFIG.TRADE_HISTORY_LENGTH)
                            tradeHistory.shift();
                        stops = tradeHistory.slice(-2).filter(function (entry) { return entry === "stop"; }).length;
                        if (stops === 2) {
                            waitUntil = Date.now() + utils_1.TRADING_CONFIG.PAUSE_AFTER_TWO_STOPS;
                            (0, utils_1.sendTelegramMessage)("⏸ Пауза 5 минут после двух стопов подряд");
                        }
                        else if (stops === 1) {
                            waitUntil = Date.now() + utils_1.TRADING_CONFIG.PAUSE_AFTER_ONE_STOP;
                            (0, utils_1.sendTelegramMessage)("⏸ Пауза 2 минуты после одного стопа");
                        }
                    }
                    _b.label = 10;
                case 10: return [2 /*return*/];
            }
        });
    }); });
    ws.on("close", function () {
        console.log("BOT_2 WebSocket закрыт. Переподключение через 3 секунды...");
        setTimeout(start, utils_1.TRADING_CONFIG.RECONNECT_DELAY);
    });
    ws.on("error", function (err) {
        console.error("WebSocket ошибка:", err.message);
        ws.close();
    });
}
start();
// === Интервал логов и сообщений ===
setInterval(function () {
    var now = new Date();
    var dateFormatter = new Intl.DateTimeFormat("ru-RU", {
        timeZone: "Europe/Moscow",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
    var timeFormatter = new Intl.DateTimeFormat("ru-RU", {
        timeZone: "Europe/Moscow",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });
    var datePart = dateFormatter.format(now);
    var timePart = timeFormatter.format(now);
    var formattedDeposit = new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "RUB",
        minimumFractionDigits: 0,
    }).format(+DEPOSIT);
    var formattedTick = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
    }).format(+tick.toFixed(0));
    var logLine = "\uD83D\uDCB0TREND: ".concat(TREND, " DEPOSIT: ").concat(formattedDeposit, "| \uD83D\uDCCA BTC/USDT: ").concat(formattedTick, "| \uD83D\uDCC9 RSI: ").concat(RSI.toFixed(1), "| ").concat(datePart.replace(" г.", "г"), ", ").concat(timePart);
    (0, utils_1.sendTelegramMessage)(logLine);
    console.log(logLine);
    if (openPosition) {
        (0, utils_1.sendTelegramMessage)("\uD83D\uDFE2\uD83D\uDD34OpenPosition: ".concat(openPosition));
    }
}, utils_1.TRADING_CONFIG.LOG_INTERVAL);
