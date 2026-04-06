const axios = require('axios');
const { WebcastPushConnection } = require('tiktok-live-connector');

const TIKTOK_USERNAME = '@.baby_mile'; 
const ROBLOX_API_KEY = process.env.ROBLOX_API_KEY;
const UNIVERSE_ID = process.env.UNIVERSE_ID;

let tiktokLiveConnection = new WebcastPushConnection(TIKTOK_USERNAME);
let isPausing = false; // ตัวแปรเช็คสถานะการส่งรัว

async function sendToRoblox(payload) {
    if (isPausing && payload.event === 'chat') return; // ถ้าส่งแชทรัวไป ให้ข้ามคอมเมนต์นี้ไปก่อน

    const url = `https://apis.roblox.com/messaging-service/v1/universes/${UNIVERSE_ID}/topics/TikTokGiftEvent`;
    try {
        await axios.post(url, { message: JSON.stringify(payload) }, {
            headers: { 'x-api-key': ROBLOX_API_KEY, 'Content-Type': 'application/json' }
        });
        console.log(`✅ [Roblox] ส่ง ${payload.event} สำเร็จ`);
        
        // ถ้าส่งคอมเมนต์ ให้หยุดพัก 1 วินาที เพื่อไม่ให้โดนบล็อก
        if (payload.event === 'chat') {
            isPausing = true;
            setTimeout(() => { isPausing = false; }, 1000); 
        }
    } catch (error) {
        console.error('❌ [Error]:', error.message);
    }
}

// รับของขวัญ (ให้ความสำคัญสูงสุด)
tiktokLiveConnection.on('gift', (data) => {
    if (data.streakFinished || data.repeatCount === 1) {
        sendToRoblox({
            event: "gift",
            username: data.nickname,
            giftName: data.giftName,
            count: data.repeatCount
        });
    }
});

// รับแชท (จำกัดความเร็ว)
tiktokLiveConnection.on('chat', (data) => {
    sendToRoblox({ event: "chat", username: data.nickname, comment: data.comment });
});

// ระบบต่ออัตโนมัติ
function connect() {
    tiktokLiveConnection.connect().then(() => console.log("🚀 Connected")).catch(() => setTimeout(connect, 5000));
}
tiktokLiveConnection.on('disconnected', connect);
connect();

const http = require('http');
http.createServer((req, res) => { res.write('Running'); res.end(); }).listen(10000);
