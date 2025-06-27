import axios from "axios";
import * as crypto from "crypto";

const MODE = "demo"; // "demo" or "prod"

const API_KEY: string | undefined = MODE === "demo" ? process.env.API_KEY_DEMO : process.env.API_KEY;
const API_SECRET: string | undefined = MODE === "demo" ? process.env.API_SECRET_DEMO : process.env.API_SECRET;
const PASSPHRASE: string | undefined = process.env.PASSPHRASE;

const baseURL = "https://www.okx.com";

function signRequest(timestamp: string, method: string, endpoint: string, body: string | undefined) {
  if (!API_SECRET) throw new Error("API_SECRET not defined");
  const prehash = timestamp + method + endpoint + (body || "");
  return crypto.createHmac("sha256", API_SECRET).update(prehash).digest("base64");
}

export async function placeOrder(order: any) {
  const endpoint = "/api/v5/trade/order";
  const method = "POST";
  const timestamp = new Date().toISOString();
  const body = JSON.stringify(order);
  const sign = signRequest(timestamp, method, endpoint, body);

  const headers = {
    "OK-ACCESS-KEY": API_KEY || "",
    "OK-ACCESS-SIGN": sign,
    "OK-ACCESS-TIMESTAMP": timestamp,
    "OK-ACCESS-PASSPHRASE": PASSPHRASE || "",
    "Content-Type": "application/json",
    "x-simulated-trading": MODE === "demo" ? "1" : "0", // 0 - реальная торговля, 1 - симуляция
  };

  try {
    const response = await axios.post(baseURL + endpoint, order, { headers });
    return response.data;
  } catch (error) {
    console.error("Error placing order:", error);
  }
}


export async function getAccountBalance(ccy?: string) {
  const endpoint = "/api/v5/account/balance";
  const method = "GET";
  const timestamp = new Date().toISOString();
  const queryParams = ccy ? `?ccy=${ccy}` : "";
  const sign = signRequest(timestamp, method, endpoint + queryParams, undefined);

  const headers = {
    "OK-ACCESS-KEY": API_KEY || "",
    "OK-ACCESS-SIGN": sign,
    "OK-ACCESS-TIMESTAMP": timestamp,
    "OK-ACCESS-PASSPHRASE": PASSPHRASE || "",
    "x-simulated-trading": MODE === "demo" ? "1" : "0",
  };

  try {
    const response = await axios.get(baseURL + endpoint + queryParams, { headers });
    return response.data;
  } catch (error) {
    console.error("Error getting account balance:", error);
    throw error;
  }
}


// Получаем данные свечей с биржи для расчета SMA
async function getCandles(instId = "BTC-USDT", bar = "1H", limit = 200) {
  const endpoint = `/api/v5/market/candles?instId=${instId}&bar=${bar}&limit=${limit}`;
  try {
      const response = await axios.get(baseURL + endpoint);
      return response.data.data.map((candle: any) => parseFloat(candle[4])); // закрытие свечи
  } catch (error) {
      console.error("Error getting candles:", error);
      return [];
  }
}

// Рассчитываем SMA
function calculateSMA(prices: number[], period = 50) {
  if (prices.length < period) return null;
  const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
  return sum / period;
}

// Функция определения тренда
export async function getTrendFilter() {
  const candles = await getCandles();
  if (candles.length < 200) return "neutral";
  
  const sma50 = calculateSMA(candles, 50);
  const sma200 = calculateSMA(candles, 200);
  const currentPrice = candles[candles.length - 1];
  // console.log("SMA50:", sma50);
  // console.log("SMA200:", sma200);
  // console.log("Current Price:", currentPrice);
  
  if (!sma50 || !sma200) return "neutral";
  
  if (currentPrice > sma50 && sma50 > sma200) return "uptrend";
  if (currentPrice < sma50 && sma50 < sma200) return "downtrend";
  return "neutral";
}

