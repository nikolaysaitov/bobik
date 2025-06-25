"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTelegramMessage = sendTelegramMessage;
require('dotenv').config();
var BOT_TOKEN = process.env.BOT_TOKEN;
var CHAT_ID = process.env.CHAT_ID;
//https://api.telegram.org/bot7778880932:AAH4GgboL0vtsNg8LHIfUHVpXgORpynBVp4/getUpdates
function sendTelegramMessage(message) {
    if (!BOT_TOKEN || !CHAT_ID) {
        console.error('BOT_TOKEN or CHAT_ID is not defined');
        return;
    }
    fetch("https://api.telegram.org/bot".concat(BOT_TOKEN, "/sendMessage"), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'Markdown' // можно использовать HTML тоже
        })
    }).then(function (res) { return res.json(); })
        .then(function (data) {
        if (!data.ok) {
            console.error('Telegram error:', data);
        }
    }).catch(function (err) {
        console.error('Network error:', err);
    });
}
