const axios = require('axios');

// إعدادات واتساب API
const INSTANCE_ID = "instance3532";
const API_TOKEN = "yzWzEjmxZpbifuOx6lWafYT3Ng69gaFpJGAdTsVc6N";
const API_URL = `https://api.wapilot.net/api/v2/${INSTANCE_ID}/send-message`;

// قواعد الردود التلقائية
let autoRules = [
    { keywords: ['سعر', 'الثمن', 'كم سعر', 'بكام'], reply: '💰 سعر المنتج هو 100 جنيه مصري', active: true },
    { keywords: ['شكرا', 'ممتاز', 'تمام'], reply: '🎉 شكراً لك! نحن في خدمتك', active: true },
    { keywords: ['طلب', 'اوردر', 'اطلب'], reply: '🛍️ لإنشاء طلب جديد، يرجى إرسال اسمك الكامل والعنوان', active: true }
];

async function sendWhatsAppMessage(phone, message) {
    try {
        let cleanPhone = phone.toString().replace(/[^0-9]/g, '');
        if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);
        const chat_id = `${cleanPhone}@c.us`;
        
        const response = await axios.post(
            API_URL,
            { chat_id, text: message },
            { headers: { "token": API_TOKEN, "Content-Type": "application/json" } }
        );
        console.log(`✅ Sent to ${cleanPhone}`);
        return true;
    } catch (error) {
        console.error('Send error:', error.response?.data || error.message);
        return false;
    }
}

function findAutoReply(message) {
    if (!message) return null;
    const lowerMsg = message.toLowerCase();
    for (let rule of autoRules) {
        if (!rule.active) continue;
        for (let keyword of rule.keywords) {
            if (lowerMsg.includes(keyword)) return rule.reply;
        }
    }
    return null;
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    
    if (req.method === 'GET') {
        return res.status(200).json({ status: 'active', message: 'Easy Order Webhook running' });
    }
    
    console.log('📦 Easy Order Webhook:', new Date().toISOString());
    console.log('Body:', JSON.stringify(req.body, null, 2));
    
    const data = req.body;
    let phone = data.phone || data.customer?.phone;
    let message = data.message || data.note;
    
    console.log(`📱 Phone: ${phone}`);
    console.log(`💬 Message: ${message}`);
    
    if (!phone || !message) {
        return res.status(200).json({ received: true, error: 'Missing data' });
    }
    
    const autoReply = findAutoReply(message);
    
    if (autoReply) {
        console.log(`🤖 Auto-reply: ${autoReply}`);
        await sendWhatsAppMessage(phone, autoReply);
    }
    
    res.status(200).json({ success: true });
};
