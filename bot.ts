import * as WebSocket from "ws";
import { getRSIfromBinance } from "./utils/api";
import { TRADING_CONFIG, closeOrderLong, closeOrderShort, openOrderLong, openOrderShort, sendTelegramMessage } from "./utils/utils";
import { getAccountBalance, getTrendFilter, placeOrder } from "./utils/orders";
import { SubscribeMsg } from "./types/types";
const WS_URL = "wss://ws.okx.com:8443/ws/v5/public";

let orderBuy = { price: 0 };
let orderSell = { price: 0 };
let DEPOSIT: number = 10000; //4 981,55 ₽
let tick = 0;
let RSI = 0;
let openPosition = "";
let TREND = "";
console.log("TREND", TREND);
const getBalance = async () => {
  try {
    const usdtBalance = await getAccountBalance("USDT");
    console.log("USDT balance:", usdtBalance.data[0].details[0].cashBal);
    DEPOSIT = usdtBalance.data[0].details[0].cashBal;
    return usdtBalance.data[0].details[0].cashBal;
  } catch (error) {
    console.error("Error getting account balance:", error);
  }
};

getBalance();

const PROFIT_TARGET = TRADING_CONFIG.PROFIT_MULTIPLIER;
const STOP_LOSS = TRADING_CONFIG.STOP_LOSS_MULTIPLIER;

let tradeHistory: string[] = []; // хранит 'profit' или 'stop'
let waitUntil: number = 0; // timestamp до которого ждать перед следующей сделкой

const getData = async () => {
  try {
    const res: any = await getRSIfromBinance();
    RSI = res ? res : 0;
    return res;
  } catch (error) {
    sendTelegramMessage(`❌ Error placing order: ${error} | RSI: ${RSI} | DEPOSIT ${DEPOSIT}`);
    console.error("Ошибка при получении данных RSI:", error);
  }
};

function start() {
  const ws = new WebSocket.WebSocket(WS_URL);

  ws.on("open", () => {
    console.log("Connected to OKX WebSocket");
    const subscribeMsg: SubscribeMsg = {
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

  ws.on("message", async (data) => {
    await getData(); // RSI обновляется при каждом тике
    const trend = await getTrendFilter();
    TREND = trend;

    const msg = JSON.parse(data.toString());

    if (msg.event === "subscribe") {
      console.log("Subscribed:", msg.arg);
      return;
    }
    if (msg.event === "error") {
      console.error("Error:", msg);
      return;
    }

    if (msg.arg?.channel === "tickers" && msg.data && RSI !== 0) {
      const ticker = msg.data[0];
      tick = +ticker.last;

      // Проверка: если мы ждём — не открываем новые сделки
      const now = Date.now();

      // ===== LONG logic =====

      if (orderBuy.price === 0) {
        if (RSI > 60) {
          const trend = await getTrendFilter();
          if (trend !== "uptrend") return; // Фильтр тренда
          if (now < waitUntil) return;
          orderBuy.price = tick;
          openPosition = `LONG от ${tick}`;

          placeOrder(openOrderLong)
            .then((result) => {
              console.log("Order placed:", result);
              if (result.code === "0") {
                sendTelegramMessage(`📈 Открыт LONG по цене: ${tick} | RSI: ${RSI} | DEPOSIT ${DEPOSIT}`);
              }
            })
            .catch((err) => {
              console.error("Error placing order:", err);
              sendTelegramMessage(`❌ Error placing order: ${err} | RSI: ${RSI} | DEPOSIT ${DEPOSIT}`);
            });
        }
      } else {
        if (tick >= orderBuy.price + PROFIT_TARGET) {
          orderBuy.price = 0;
          openPosition = "";

          placeOrder(closeOrderLong)
            .then((result) => {
              console.log("Order placed:", result);
              if (result.code === "0") {
                sendTelegramMessage(`🟢 TAKE PROFIT (LONG) ${tick} | RSI: ${RSI} | DEPOSIT ${DEPOSIT}`);
              }
            })
            .catch((err) => {
              console.error("Error placing order:", err);
              sendTelegramMessage(`❌ Error placing order: ${err} | RSI: ${RSI} | DEPOSIT ${DEPOSIT}`);
            });

          tradeHistory.push("profit");
          if (tradeHistory.length > TRADING_CONFIG.TRADE_HISTORY_LENGTH) tradeHistory.shift();
        } else if (tick <= orderBuy.price - STOP_LOSS) {
          orderBuy.price = 0;
          openPosition = "";

          placeOrder(closeOrderLong)
            .then((result) => {
              console.log("Order placed:", result);
              if (result.code === "0") {
                sendTelegramMessage(`❌ STOP LOSS (LONG) ${tick} | RSI: ${RSI} | DEPOSIT ${DEPOSIT}`);
              }
            })
            .catch((err) => {
              console.error("Error placing order:", err);
              sendTelegramMessage(`❌ Error placing order: ${err} | RSI: ${RSI} | DEPOSIT ${DEPOSIT}`);
            });

          tradeHistory.push("stop");
          if (tradeHistory.length > TRADING_CONFIG.TRADE_HISTORY_LENGTH) tradeHistory.shift(); // сохраняем только последние 2

          // Установка паузы на основе истории
          const stops = tradeHistory.slice(-2).filter((entry) => entry === "stop").length;
          if (stops === 2) {
            waitUntil = Date.now() + TRADING_CONFIG.PAUSE_AFTER_TWO_STOPS;
            sendTelegramMessage("⏸ Пауза 3 минуты после двух стопов подряд");
          } else if (stops === 1) {
            waitUntil = Date.now() + TRADING_CONFIG.PAUSE_AFTER_ONE_STOP;
            sendTelegramMessage("⏸ Пауза 1 минута после одного стопа");
          }
        }
      }

      // ===== SHORT logic =====

      if (orderSell.price === 0) {
        if (RSI < 40) {
          const trend = await getTrendFilter();
          if (trend !== "downtrend") return; // Фильтр тренда
          if (now < waitUntil) return;
          orderSell.price = tick;
          openPosition = `SHORT от ${tick}`;
          placeOrder(openOrderShort)
            .then((result) => {
              console.log("Order placed:", result);
              if (result.code === "0") {
                sendTelegramMessage(`📉 Открыт SHORT по цене: ${tick} | RSI: ${RSI} | DEPOSIT ${DEPOSIT}`);
              }
            })
            .catch((err) => {
              console.error("Error placing order:", err);
              sendTelegramMessage(`❌ Error placing order: ${err} | RSI: ${RSI} | DEPOSIT ${DEPOSIT}`);
            });
        }
      } else {
        if (tick <= orderSell.price - PROFIT_TARGET) {
          orderSell.price = 0;
          openPosition = "";
          placeOrder(closeOrderShort)
            .then((result) => {
              console.log("Order placed:", result);
              if (result.code === "0") {
                sendTelegramMessage(`🟢TAKE PROFIT (SHORT) ${tick} | RSI: ${RSI} | DEPOSIT ${DEPOSIT}`);
              }
            })
            .catch((err) => {
              console.error("Error placing order:", err);
              sendTelegramMessage(`❌ Error placing order: ${err} | RSI: ${RSI} | DEPOSIT ${DEPOSIT}`);
            });
          tradeHistory.push("profit");
          if (tradeHistory.length > TRADING_CONFIG.TRADE_HISTORY_LENGTH) tradeHistory.shift();
        } else if (tick >= orderSell.price + STOP_LOSS) {
          orderSell.price = 0;

          openPosition = "";

          placeOrder(closeOrderShort)
            .then((result) => {
              console.log("Order placed:", result);
              if (result.code === "0") {
                sendTelegramMessage(`❌ STOP LOSS (SHORT) ${tick} | RSI: ${RSI} | DEPOSIT ${DEPOSIT}`);
              }
            })
            .catch((err) => {
              console.error("Error placing order:", err);
              sendTelegramMessage(`❌ Error placing order: ${err} | RSI: ${RSI} | DEPOSIT ${DEPOSIT}`);
            });
          tradeHistory.push("stop");
          if (tradeHistory.length > TRADING_CONFIG.TRADE_HISTORY_LENGTH) tradeHistory.shift();

          // Установка паузы на основе истории
          const stops = tradeHistory.slice(-2).filter((entry) => entry === "stop").length;
          if (stops === 2) {
            waitUntil = Date.now() + TRADING_CONFIG.PAUSE_AFTER_TWO_STOPS;
            sendTelegramMessage("⏸ Пауза 5 минут после двух стопов подряд");
          } else if (stops === 1) {
            waitUntil = Date.now() + TRADING_CONFIG.PAUSE_AFTER_ONE_STOP;
            sendTelegramMessage("⏸ Пауза 2 минуты после одного стопа");
          }
        }
      }
    }
  });

  ws.on("close", () => {
    console.log("BOT_2 WebSocket закрыт. Переподключение через 3 секунды...");
    setTimeout(start, TRADING_CONFIG.RECONNECT_DELAY);
  });

  ws.on("error", (err) => {
    console.error("WebSocket ошибка:", err.message);
    ws.close();
  });
}

start();

// === Интервал логов и сообщений ===
setInterval(() => {
  const now = new Date();
  const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Europe/Moscow",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeFormatter = new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Europe/Moscow",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const datePart = dateFormatter.format(now);
  const timePart = timeFormatter.format(now);

  const formattedDeposit = new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
  }).format(+DEPOSIT);

  const formattedTick = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(+tick.toFixed(0));

  const logLine = `💰TREND: ${TREND} DEPOSIT: ${formattedDeposit}| 📊 BTC/USDT: ${formattedTick}| 📉 RSI: ${RSI.toFixed(1)}| ${datePart.replace(
    " г.",
    "г"
  )}, ${timePart}`;
  sendTelegramMessage(logLine);
  console.log(logLine);
  if (openPosition) {
    sendTelegramMessage(`🟢🔴OpenPosition: ${openPosition}`);
  }
}, TRADING_CONFIG.LOG_INTERVAL);
