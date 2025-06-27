// Если используешь в Node.js, добавь это:
import fetch from "node-fetch"; // npm install node-fetch@2

// RSI расчет
function calculateRSI(closes: number[], period: number = 14): number {
  if (closes.length < period + 1) {
    throw new Error("Недостаточно данных для расчёта RSI");
  }

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const delta = closes[i] - closes[i - 1];
    if (delta > 0) {
      gains += delta;
    } else {
      losses += -delta;
    }
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < closes.length; i++) {
    const delta = closes[i] - closes[i - 1];
    const gain = delta > 0 ? delta : 0;
    const loss = delta < 0 ? -delta : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

// Получение свечей с Binance
export async function getRSIfromBinance(symbol = "BTCUSDT", interval = "30m", limit = 100, period = 14) {
  const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const closes: number[] = data.map((candle: any[]) => parseFloat(candle[4]));

    const rsi = calculateRSI(closes, period);

    return rsi;
  } catch (err) {
    console.error("Ошибка при получении свечей или расчёте RSI:", err);
  }
}

// Вызов
getRSIfromBinance();
