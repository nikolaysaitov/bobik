import * as WebSocket from "ws";
import { getRSIfromBinance } from "./api";
import { sendTelegramMessage } from "./utils";

const WS_URL = "wss://ws.okx.com:8443/ws/v5/public";

interface SubscribeMsg {
  op: string;
  args: Array<{
    channel: string;
    instId: string;
  }>;
}

let orderBuy = { price: 0 };
let orderSell = { price: 0 };
let DEPOSIT: number = 10000;
let tick = 0;
let RSI = 0;
let openPosition = "";

const PROFIT_TARGET = 0.015 * DEPOSIT;
const STOP_LOSS = 0.005 * DEPOSIT;

let tradeHistory: string[] = []; // хранит 'profit' или 'stop'
let waitUntil: number = 0; // timestamp до которого ждать перед следующей сделкой

const getData = async () => {
  try {
    const res: any = await getRSIfromBinance();
    RSI = res ? res : 0;
    return res;
  } catch (error) {
    console.error("Ошибка при получении данных RSI:", error);
  }
};

function start() {
  const ws = new WebSocket.WebSocket(WS_URL);

  ws.on("open", () => {
    console.log("BOT_2 Connected to OKX WebSocket");
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

    const msg = JSON.parse(data.toString());

    if (msg.event === "subscribe") {
      console.log("BOT_2 Subscribed:", msg.arg);
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
      if (now < waitUntil) return;

      // ===== LONG logic =====
      if (RSI > 60) {
        if (orderBuy.price === 0) {
          orderBuy.price = tick;
          openPosition = `LONG от ${tick}`;
          console.log(`📈BOT_2  Открыт LONG по цене: ${tick} | RSI: ${RSI} | DEPOSIT ${DEPOSIT}`);
        } else {
          if (tick >= orderBuy.price + PROFIT_TARGET) {
            console.log(`🟢BOT_2  TAKE PROFIT (LONG) ${tick}`);
            DEPOSIT += PROFIT_TARGET;
            orderBuy.price = 0;
            openPosition = "";

            tradeHistory.push("profit");
            if (tradeHistory.length > 2) tradeHistory.shift();
          } else if (tick <= orderBuy.price - STOP_LOSS) {
            console.log(`❌BOT_2  STOP LOSS (LONG) ${tick}`);
            DEPOSIT -= STOP_LOSS;
            orderBuy.price = 0;
            openPosition = "";

            tradeHistory.push("stop");
            if (tradeHistory.length > 2) tradeHistory.shift(); // сохраняем только последние 2

            // Если две последние сделки были stop — ждем 3 минуты
            if (tradeHistory[0] === "stop" && tradeHistory[1] === "stop") {
              waitUntil = Date.now() + 3 * 60 * 1000;
              console.log("⏸ BOT_2 Пауза 3 минуты после двух стопов подряд");
            }
          }
        }
      }

      // ===== SHORT logic =====
      else if (RSI < 40) {
        if (orderSell.price === 0) {
          orderSell.price = tick;
          openPosition = `SHORT от ${tick}`;
          console.log(`📉BOT_2  Открыт SHORT по цене: ${tick} | RSI: ${RSI} | DEPOSIT ${DEPOSIT}`);
        } else {
          if (tick <= orderSell.price - PROFIT_TARGET) {
            console.log(`🟢BOT_2  TAKE PROFIT (SHORT) ${tick}`);
            DEPOSIT += PROFIT_TARGET;
            orderSell.price = 0;
            openPosition = "";

            tradeHistory.push("profit");
            if (tradeHistory.length > 2) tradeHistory.shift();
          } else if (tick >= orderSell.price + STOP_LOSS) {
            console.log(`❌BOT_2  STOP LOSS (SHORT) ${tick}`);
            DEPOSIT -= STOP_LOSS;
            orderSell.price = 0;
            openPosition = "";

            tradeHistory.push("stop");
            if (tradeHistory.length > 2) tradeHistory.shift();

            if (tradeHistory[0] === "stop" && tradeHistory[1] === "stop") {
              waitUntil = Date.now() + 3 * 60 * 1000;
              console.log("⏸ BOT_2 Пауза 3 минуты после двух стопов подряд");
            }
          }
        }
      }
    }
  });

  ws.on("close", () => {
    console.log("BOT_2 WebSocket закрыт. Переподключение через 3 секунды...");
    setTimeout(start, 3000);
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

  const logLine = `BOT2 💰 DEPOSIT: ${formattedDeposit}| 📊 BTC/USDT: ${formattedTick}| 📉 RSI: ${RSI.toFixed(1)}| ${datePart.replace(
    " г.",
    "г"
  )}, ${timePart}`;
  console.log(logLine);
  sendTelegramMessage(logLine);

  if (openPosition) {
    console.log(`🟢🔴BOT_2  OpenPosition: ${openPosition}`);
    sendTelegramMessage(`🟢🔴BOT2  OpenPosition: ${openPosition}`);
  }

  if (RSI < 40) {
    console.log("📉BOT_2  RSI < 40 — сигнал SHORT:", RSI);
  } else if (RSI > 60) {
    console.log("📈BOT_2  RSI > 60 — сигнал LONG:", RSI);
  }
}, 1800000);
