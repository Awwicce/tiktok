const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const ROBLOX_API_KEY = process.env.ROBLOX_API_KEY;
const UNIVERSE_ID = process.env.UNIVERSE_ID;

// เพิ่มส่วนนี้เข้าไปครับ เพื่อให้หน้าแรกไม่ว่างเปล่า
app.get('/', (req, res) => {
    res.send('<h1>Bridge is Online!</h1><p>Ready to receive TikTok data.</p>');
});

app.post('/webhook', async (req, res) => {
    try {
        const data = req.body;
        console.log("ได้รับข้อมูล:", data);

        await axios.post(
            `https://apis.roblox.com/messaging-service/v1/universes/${UNIVERSE_ID}/topics/TikTokEvent`,
            { message: JSON.stringify(data) },
            { headers: { 'x-api-key': ROBLOX_API_KEY, 'Content-Type': 'application/json' } }
        );
        
        res.status(200).send("Data sent to Roblox!");
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).send("Error sending to Roblox");
    }
});

app.listen(3000, () => console.log('Server Ready'));
