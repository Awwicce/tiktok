const express = require('express');
const axios = require('axios');
const { WebcastPushConnection } = require('tiktok-live-connector');
const app = express();

// --- ตั้งค่าตรงนี้ ---
const TIKTOK_USERNAME = '@biwbong1276'; // ใส่ชื่อ TikTok ของคุณ (ต้องมี @)
const ROBLOX_API_KEY = process.env.ROBLOX_API_KEY;
const UNIVERSE_ID = process.env.UNIVERSE_ID;
// ------------------

let tiktokConnection = new WebcastPushConnection(TIKTOK_USERNAME);

// ฟังก์ชันส่งข้อมูลไป Roblox
async function sendToRoblox(payload) {
    try {
        await axios.post(
            `https://apis.roblox.com/messaging-service/v1/universes/${UNIVERSE_ID}/topics/TikTokEvent`,
            { message: JSON.stringify(payload) },
            { headers: { 'x-api-key': ROBLOX_API_KEY, 'Content-Type': 'application/json' } }
        );
        console.log(`ส่งไป Roblox แล้ว: ${payload.event} จาก ${payload.nickname}`);
    } catch (err) {
        console.error("ส่งไป Roblox พลาด:", err.message);
    }
}

// เชื่อมต่อ TikTok
tiktokConnection.connect().then(state => {
    console.info(`เชื่อมต่อกับไลฟ์ของ ${TIKTOK_USERNAME} สำเร็จ!`);
}).catch(err => {
    console.error("เชื่อมต่อ TikTok ไม่ได้ (อาจจะยังไม่ขึ้นไลฟ์):", err);
});

// ดักจับเหตุการณ์ต่างๆ
// 1. สำหรับ "ของขวัญ" (ส่งทุกชิ้น เพราะสำคัญ!)
tiktokLiveConnection.on('gift', (data) => {
    console.log(`[Gift] จาก ${data.nickname}: ${data.giftName}`);
    sendToRoblox({
        event: "gift",
        username: data.nickname,
        giftName: data.giftName,
        count: data.repeatCount
    });
});

// 2. สำหรับ "คอมเมนต์" (ส่งไปแสดงโชว์)
tiktokLiveConnection.on('chat', (data) => {
    console.log(`[Chat] ${data.nickname}: ${data.comment}`);
    sendToRoblox({
        event: "chat",
        username: data.nickname,
        comment: data.comment
    });
});

// 3. ส่วน "Like" (แนะนำให้ปิดไว้ก่อน หรือส่งแค่ตอน Like เยอะจริงๆ)
// เพราะ Like คือตัวการหลักที่ทำให้ขึ้น Error 429 ครับ
/*
tiktokLiveConnection.on('like', (data) => {
    // ปิดไว้เพื่อความเสถียรของระบบ
});
*/
// ป้องกัน Render หลับ (Keep Alive)
app.get('/', (req, res) => res.send('TikTok Bridge is Running 24/7'));
app.listen(3000, () => console.log('Server Ready'));
