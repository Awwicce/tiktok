const axios = require('axios');
const { WebcastPushConnection } = require('tiktok-live-connector');

// --- ตั้งค่าตรงนี้ ---
const TIKTOK_USERNAME = '@.baby_mile'; // ชื่อ TikTok ของคุณ
const ROBLOX_API_KEY = process.env.ROBLOX_API_KEY;
const UNIVERSE_ID = process.env.UNIVERSE_ID;
// ------------------

// 1. สร้างตัวเชื่อมต่อ TikTok (ประกาศตัวแปรให้ถูกต้องตามที่ Error ฟ้องตะกี้)
let tiktokLiveConnection = new WebcastPushConnection(TIKTOK_USERNAME);

// 2. ฟังก์ชันส่งข้อมูลไป Roblox
async function sendToRoblox(payload) {
    const url = `https://apis.roblox.com/messaging-service/v1/universes/${UNIVERSE_ID}/topics/TikTokGiftEvent`;
    
    try {
        await axios.post(url, {
            message: JSON.stringify(payload)
        }, {
            headers: {
                'x-api-key': ROBLOX_API_KEY,
                'Content-Type': 'application/json'
            }
        });
        console.log(`✅ [Roblox] ส่ง ${payload.event} จาก ${payload.username} สำเร็จ`);
    } catch (error) {
        if (error.response && error.response.status === 429) {
            console.error('⚠️ [429] ส่งรัวเกินไป! (Roblox จำกัดจำนวนครั้งต่อนาที)');
        } else {
            console.error('❌ [Roblox Error]:', error.message);
        }
    }
}

// 3. รับข้อมูล "ของขวัญ"
tiktokLiveConnection.on('gift', (data) => {
    // ส่งเมื่อจบการส่งต่อเนื่อง (Streak) หรือส่งชิ้นเดียว
    if (data.streakFinished || data.repeatCount === 1) {
        sendToRoblox({
            event: "gift",
            username: data.nickname,
            giftName: data.giftName,
            count: data.repeatCount
        });
    }
});

// 4. รับข้อมูล "คอมเมนต์" (Chat)
tiktokLiveConnection.on('chat', (data) => {
    sendToRoblox({
        event: "chat",
        username: data.nickname,
        comment: data.comment
    });
});

// 5. เริ่มเชื่อมต่อ
tiktokLiveConnection.connect().then(state => {
    console.info(`🚀 เชื่อมต่อกับไลฟ์ของ ${TIKTOK_USERNAME} สำเร็จ (Room ID: ${state.roomId})`);
}).catch(err => {
    console.error('❌ เชื่อมต่อ TikTok ไม่ได้ (อาจจะยังไม่ขึ้นไลฟ์):', err.message);
});

// 6. กัน Render หลับ (Listen Port 10000)
const http = require('http');
http.createServer((req, res) => {
    res.write('TikTok to Roblox Server is Online!');
    res.end();
}).listen(10000);
