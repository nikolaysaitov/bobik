require("dotenv").config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

export const TRADING_CONFIG = {
  PROFIT_MULTIPLIER: 150,
  STOP_LOSS_MULTIPLIER: 50,
  TRADE_HISTORY_LENGTH: 2,
  RECONNECT_DELAY: 3000,
  LOG_INTERVAL: 120000,
  PAUSE_AFTER_ONE_STOP: 2 * 60 * 1000,
  PAUSE_AFTER_TWO_STOPS: 5 * 60 * 1000,
  SZ: "1", // в калькуляторе это Задолженность BTC 0.01 - 1 контракт прибыль 1.5$ маржа 1000$ плечо - 1
};

export const openOrderLong = {
  instId: "BTC-USDT-SWAP",
  tdMode: "isolated",
  clOrdId: "b15",
  side: "buy",
  posSide: "long",
  ordType: "market",
  sz: TRADING_CONFIG.SZ,
};

export const closeOrderLong = {
  instId: "BTC-USDT-SWAP",
  tdMode: "isolated",
  clOrdId: "b15close", // Уникальный ID для закрывающего ордера
  side: "sell", // Противоположная сторона
  posSide: "long", // Та же позиция
  ordType: "market", // Рыночный ордер (быстрое закрытие)
  sz: TRADING_CONFIG.SZ, // Тот же объём, что и при открытии
};

export const openOrderShort = {
  instId: "BTC-USDT-SWAP",
  tdMode: "isolated",
  clOrdId: "s15", // Уникальный ID
  side: "sell", // Продаём, чтобы открыть short
  posSide: "short", // Сторона позиции — short
  ordType: "market", // Рыночный ордер
  sz: TRADING_CONFIG.SZ,
};

export const closeOrderShort = {
  instId: "BTC-USDT-SWAP",
  tdMode: "isolated",
  clOrdId: "s15close", // Новый уникальный ID
  side: "buy", // Покупаем, чтобы закрыть short
  posSide: "short", // Та же сторона позиции
  ordType: "market",
  sz: TRADING_CONFIG.SZ,
};

export function sendTelegramMessage(message: string) {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.error("BOT_TOKEN or CHAT_ID is not defined");
    return;
  }

  fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
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
    .then((res) => res.json())
    .then((data) => {
      if (!data.ok) {
        console.error("Telegram error:", data);
      }
    })
    .catch((err) => {
      console.error("Network error:", err);
    });
}
