const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const ROBLOX_API_KEY = process.env.ROBLOX_API_KEY;
const UNIVERSE_ID = process.env.UNIVERSE_ID;

app.post('/webhook', async (req, res) => {
    try {
        // รับข้อมูลจาก TikTok (เช่น ชื่อคนให้ของขวัญ)
        const data = req.body;
        
        // ส่งต่อไปยัง Roblox Messaging Service
        await axios.post(
            `https://apis.roblox.com/messaging-service/v1/universes/${UNIVERSE_ID}/topics/TikTokEvent`,
            { message: JSON.stringify(data) },
            { headers: { 'x-api-key': ROBLOX_API_KEY, 'Content-Type': 'application/json' } }
        );
        
        console.log("ส่งข้อมูลไป Roblox สำเร็จ!");
        res.status(200).send("OK");
    } catch (error) {
        console.error("เกิดข้อผิดพลาด:", error.message);
        res.status(500).send("Error");
    }
});

app.listen(3000, () => console.log('Server is running on port 3000'));
