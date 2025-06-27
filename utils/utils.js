"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeOrderShort = exports.openOrderShort = exports.closeOrderLong = exports.openOrderLong = exports.TRADING_CONFIG = void 0;
exports.sendTelegramMessage = sendTelegramMessage;
require("dotenv").config();
var BOT_TOKEN = process.env.BOT_TOKEN;
var CHAT_ID = process.env.CHAT_ID;
exports.TRADING_CONFIG = {
    PROFIT_MULTIPLIER: 150,
    STOP_LOSS_MULTIPLIER: 50,
    TRADE_HISTORY_LENGTH: 2,
    RECONNECT_DELAY: 3000,
    LOG_INTERVAL: 120000,
    PAUSE_AFTER_ONE_STOP: 2 * 60 * 1000,
    PAUSE_AFTER_TWO_STOPS: 5 * 60 * 1000,
    SZ: "1", // в калькуляторе это Задолженность BTC 0.01 - 1 контракт прибыль 1.5$ маржа 1000$ плечо - 1
};
exports.openOrderLong = {
    instId: "BTC-USDT-SWAP",
    tdMode: "isolated",
    clOrdId: "b15",
    side: "buy",
    posSide: "long",
    ordType: "market",
    sz: exports.TRADING_CONFIG.SZ,
};
exports.closeOrderLong = {
    instId: "BTC-USDT-SWAP",
    tdMode: "isolated",
    clOrdId: "b15close", // Уникальный ID для закрывающего ордера
    side: "sell", // Противоположная сторона
    posSide: "long", // Та же позиция
    ordType: "market", // Рыночный ордер (быстрое закрытие)
    sz: exports.TRADING_CONFIG.SZ, // Тот же объём, что и при открытии
};
exports.openOrderShort = {
    instId: "BTC-USDT-SWAP",
    tdMode: "isolated",
    clOrdId: "s15", // Уникальный ID
    side: "sell", // Продаём, чтобы открыть short
    posSide: "short", // Сторона позиции — short
    ordType: "market", // Рыночный ордер
    sz: exports.TRADING_CONFIG.SZ,
};
exports.closeOrderShort = {
    instId: "BTC-USDT-SWAP",
    tdMode: "isolated",
    clOrdId: "s15close", // Новый уникальный ID
    side: "buy", // Покупаем, чтобы закрыть short
    posSide: "short", // Та же сторона позиции
    ordType: "market",
    sz: exports.TRADING_CONFIG.SZ,
};
function sendTelegramMessage(message) {
    if (!BOT_TOKEN || !CHAT_ID) {
        console.error("BOT_TOKEN or CHAT_ID is not defined");
        return;
    }
    fetch("https://api.telegram.org/bot".concat(BOT_TOKEN, "/sendMessage"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            chat_id: CHAT_ID,
            text: message,
            parse_mode: "Markdown", // можно использовать HTML тоже
        }),
    })
        .then(function (res) { return res.json(); })
        .then(function (data) {
        if (!data.ok) {
            console.error("Telegram error:", data);
        }
    })
        .catch(function (err) {
        console.error("Network error:", err);
    });
}
