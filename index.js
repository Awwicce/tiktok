const axios = require('axios');
const { WebcastPushConnection } = require('tiktok-live-connector');

// --- ตั้งค่าตรงนี้ ---
const TIKTOK_USERNAME = '@.baby_mile'; 
const ROBLOX_API_KEY = process.env.ROBLOX_API_KEY;
const UNIVERSE_ID = process.env.UNIVERSE_ID;
// ------------------

let tiktokLiveConnection = new WebcastPushConnection(TIKTOK_USERNAME);

// 1. ฟังก์ชันส่งข้อมูลไป Roblox
async function sendToRoblox(payload) {
    const url = `https://apis.roblox.com/messaging-service/v1/universes/${UNIVERSE_ID}/topics/TikTokGiftEvent`;
    try {
        await axios.post(url, { message: JSON.stringify(payload) }, {
            headers: { 'x-api-key': ROBLOX_API_KEY, 'Content-Type': 'application/json' }
        });
        console.log(`✅ [Roblox] ส่ง ${payload.event} จาก ${payload.username} สำเร็จ`);
    } catch (error) {
        if (error.response && error.response.status === 429) {
            console.error('⚠️ [429] Roblox รับข้อมูลไม่ทัน (ส่งรัวเกินไป)');
        } else {
            console.error('❌ [Roblox Error]:', error.message);
        }
    }
}

// 2. ฟังก์ชันการเชื่อมต่อ (แบบต่ออัตโนมัติ)
function connectToTikTok() {
    console.log(`⏳ กำลังพยายามเชื่อมต่อกับ TikTok: ${TIKTOK_USERNAME}...`);
    
    tiktokLiveConnection.connect().then(state => {
        console.info(`🚀 [TikTok] เชื่อมต่อสำเร็จ! (Room ID: ${state.roomId})`);
    }).catch(err => {
        console.error('❌ [TikTok] เชื่อมต่อไม่ได้ (รอ 10 วิเพื่อลองใหม่):', err.message);
        setTimeout(connectToTikTok, 10000); // ถ้าพลาดให้ลองใหม่ทุก 10 วินาที
    });
}

// 3. ดักจับเหตุการณ์ต่างๆ
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

tiktokLiveConnection.on('chat', (data) => {
    sendToRoblox({ event: "chat", username: data.nickname, comment: data.comment });
});

// 4. ส่วนสำคัญ: ถ้าหลุดให้เชื่อมใหม่ทันที
tiktokLiveConnection.on('disconnected', () => {
    console.warn('⚠️ [TikTok] การเชื่อมต่อหลุด! กำลังเริ่มเชื่อมต่อใหม่...');
    connectToTikTok();
});

tiktokLiveConnection.on('error', (err) => {
    console.error('❌ [TikTok Error]:', err);
});

// เริ่มทำงาน
connectToTikTok();

// 5. กัน Render หลับ
const http = require('http');
http.createServer((req, res) => {
    res.write('TikTok to Roblox Server is Online!');
    res.end();
}).listen(10000);
