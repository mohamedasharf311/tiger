const axios = require('axios');

// رسالة التهنئة الوحيدة
const eidReply = `🐏 كل عام وأنتم بخير بمناسبة عيد الأضحى المبارك 🐏

تقبل الله منا ومنكم صالح الأعمال.

📢 يرجى العلم بأن العمل سيستأنف يوم الأحد المقبل 📢

نتمنى لكم عيداً سعيداً 🐯`;

// إعدادات الإنستانس
const INSTANCE_ID = "instance3882";
const INSTANCE = {
    id: INSTANCE_ID,
    token: "LVQSwwsO4HiwnZKkDSSFpVIS0HHuF1AtSfOAOCTl9k",
    name: "الرقم الأول - النمر للشحن",
    phoneNumber: "201553999935",
    active: true
};

// دالة إرسال رسالة واتساب
async function sendWhatsAppMessage(chat_id, message) {
    try {
        console.log(`📤 Sending to: ${chat_id}`);
        
        const response = await axios.post(
            `https://api.wapilot.net/api/v2/${INSTANCE.id}/send-message`,
            { chat_id, text: message },
            { headers: { "token": INSTANCE.token, "Content-Type": "application/json" } }
        );
        
        console.log(`✅ Sent successfully`);
        return { success: true };
    } catch (error) {
        console.error(`❌ Send failed:`, error.response?.data || error.message);
        return { success: false, error: error.response?.data || error.message };
    }
}

// Webhook الرئيسي
module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    
    if (req.method === 'GET') {
        return res.status(200).json({ 
            status: 'active',
            instance: INSTANCE.name,
            message: "Eid greeting bot is running"
        });
    }
    
    console.log(`📩 Webhook received:`, new Date().toISOString());
    
    const data = req.body;
    let rawChatId = null;
    
    if (data.payload) {
        rawChatId = data.payload.from;
    }
    
    if (!rawChatId) {
        console.log(`⚠️ Missing chat ID`);
        return res.status(200).json({ received: true });
    }
    
    let chatId = rawChatId;
    if (!chatId.includes('@')) {
        chatId = `${chatId}@c.us`;
    }
    
    console.log(`📱 From: ${rawChatId}`);
    
    // 👇 أي رسالة - يرد برسالة التهنئة
    await sendWhatsAppMessage(chatId, eidReply);
    
    return res.status(200).json({ success: true, replied: true });
};
