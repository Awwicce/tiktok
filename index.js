const axios = require('axios');
const { WebcastPushConnection } = require('tiktok-live-connector');

// --- ตั้งค่าจาก Environment ---
const TIKTOK_USERNAME = '@.baby_mile'; 
const ROBLOX_API_KEY = process.env.ROBLOX_API_KEY;
const UNIVERSE_ID = process.env.UNIVERSE_ID;

let tiktokLiveConnection = new WebcastPushConnection(TIKTOK_USERNAME);

// 1. ฟังก์ชันส่งข้อมูลไป Roblox
async function sendToRoblox(payload) {
    const url = `https://apis.roblox.com/messaging-service/v1/universes/${UNIVERSE_ID}/topics/TikTokGiftEvent`;
    try {
        await axios.post(url, { message: JSON.stringify(payload) }, {
            headers: { 'x-api-key': ROBLOX_API_KEY, 'Content-Type': 'application/json' }
        });
        console.log(`✅ [Gift Sent] ${payload.giftName} x${payload.count} จาก ${payload.username}`);
    } catch (error) {
        console.error('❌ [Roblox Error]:', error.message);
    }
}

// 2. รับข้อมูล "ของขวัญ" เท่านั้น (ตัด Chat/Like ออกทั้งหมด)
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

// 3. ระบบเชื่อมต่ออัตโนมัติ (Reconnect)
function startConnection() {
    console.log(`⏳ กำลังเชื่อมต่อ TikTok: ${TIKTOK_USERNAME}...`);
    tiktokLiveConnection.connect().then(state => {
        console.info(`🚀 เชื่อมต่อสำเร็จ! (Room: ${state.roomId})`);
    }).catch(err => {
        console.error('❌ เชื่อมต่อไม่ได้ รอ 10 วิ...', err.message);
        setTimeout(startConnection, 10000);
    });
}

tiktokLiveConnection.on('disconnected', () => {
    console.warn('⚠️ หลุด! กำลังต่อใหม่...');
    startConnection();
});

tiktokLiveConnection.on('error', (err) => {
    console.error('❌ TikTok Error:', err);
});

// เริ่มทำงาน
startConnection();

// 4. กัน Render หลับ
require('http').createServer((req, res) => {
    res.write('TikTok Gift Only Server is Online!');
    res.end();
}).listen(10000);
