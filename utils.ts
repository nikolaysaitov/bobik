
require('dotenv').config();
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

export function sendTelegramMessage(message: string) {
    if (!BOT_TOKEN || !CHAT_ID) {
      console.error('BOT_TOKEN or CHAT_ID is not defined');
      return;
    }

   
  fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: message,
      parse_mode: 'Markdown' // можно использовать HTML тоже
    })
  }).then(res => res.json())
    .then(data => {
      if (!data.ok) {
        console.error('Telegram error:', data);
      }
    }).catch(err => {
      console.error('Network error:', err);
    });
}