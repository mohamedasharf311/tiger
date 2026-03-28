const axios = require('axios');

// إعدادات الإرسال
const INSTANCE_ID = "instance3532";
const API_TOKEN = "yzWzEjmxZpbifuOx6lWafYT3Ng69gaFpJGAdTsVc6N";
const API_URL = `https://api.wapilot.net/api/v2/${INSTANCE_ID}/send-message`;

// قواعد الرد
const autoRules = [
    { keywords: ['سعر', 'الثمن', 'بكام'], reply: '💰 سعر المنتج هو 100 جنيه مصري' },
    { keywords: ['شكرا', 'ممتاز'], reply: '🎉 شكراً لك! نحن في خدمتك' }
];

async function sendMessage(phone, message) {
    try {
        const chat_id = `${phone}@c.us`;
        await axios.post(API_URL, { chat_id, text: message }, {
            headers: { "token": API_TOKEN, "Content-Type": "application/json" }
        });
        console.log(`✅ Sent to ${phone}: ${message}`);
    } catch (error) {
        console.error('Send error:', error.message);
    }
}

function findReply(message) {
    const lowerMsg = message.toLowerCase();
    for (let rule of autoRules) {
        for (let keyword of rule.keywords) {
            if (lowerMsg.includes(keyword)) return rule.reply;
        }
    }
    return null;
}

module.exports = async (req, res) => {
    console.log('📦 Easy Order Webhook:', new Date().toISOString());
    console.log('Body:', req.body);
    
    const data = req.body;
    const phone = data.phone || data.customer?.phone || data.from;
    const message = data.message || data.note || data.body;
    
    if (phone && message) {
        console.log(`📩 From: ${phone}, Message: ${message}`);
        const reply = findReply(message);
        
        if (reply) {
            await sendMessage(phone, reply);
            console.log(`🤖 Auto-reply sent: ${reply}`);
        } else {
            await sendMessage(phone, '👋 شكراً لتواصلك! سيتم الرد عليك قريباً.');
        }
    }
    
    res.status(200).json({ success: true, received: true });
};
