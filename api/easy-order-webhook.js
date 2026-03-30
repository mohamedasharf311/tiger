const axios = require('axios');

// إعدادات واتساب API
const INSTANCE_ID = "instance3537";
const API_TOKEN = "yzWzEjmxZpbifuOx6lWafYT3Ng69gaFpJGAdTsVc6N";
const API_URL = `https://api.wapilot.net/api/v2/${INSTANCE_ID}/send-message`;

// قواعد الردود التلقائية
let autoRules = [
    { keywords: ['سعر', 'الثمن', 'كم سعر', 'بكام', 'price'], reply: '💰 سعر المنتج هو 100 جنيه مصري. هل تريد معرفة المزيد؟', active: true },
    { keywords: ['شكرا', 'ممتاز', 'تمام', 'ok', 'شكراً'], reply: '🎉 شكراً لك! نحن في خدمتك دائماً.', active: true },
    { keywords: ['طلب', 'اوردر', 'اطلب', 'order', 'شراء'], reply: '🛍️ مرحباً! لإنشاء طلب جديد، يرجى إرسال:\n1. اسمك الكامل\n2. العنوان\n3. اسم المنتج', active: true },
    { keywords: ['توصيل', 'الشحن', 'delivery'], reply: '🚚 التوصيل خلال 3-5 أيام عمل. التكلفة 50 جنيهاً.', active: true },
    { keywords: ['اخبارك', 'ازيك', 'كيفك', 'how are you'], reply: '👋 أنا بخير، شكراً لسؤالك! كيف يمكنني مساعدتك اليوم؟', active: true }
];

// دالة إرسال رسالة - تستقبل chat_id مباشرة
async function sendWhatsAppMessage(chat_id, message) {
    try {
        console.log(`📤 Sending to: ${chat_id}`);
        
        const response = await axios.post(
            API_URL,
            { chat_id, text: message },
            { headers: { "token": API_TOKEN, "Content-Type": "application/json" } }
        );
        
        console.log(`✅ Sent successfully to ${chat_id}`);
        return { success: true };
    } catch (error) {
        console.error('❌ Send failed:', error.response?.data || error.message);
        return { success: false, error: error.response?.data || error.message };
    }
}

// دالة البحث عن رد
function findAutoReply(message) {
    if (!message) return null;
    const lowerMsg = message.toLowerCase();
    for (let rule of autoRules) {
        if (!rule.active) continue;
        for (let keyword of rule.keywords) {
            if (lowerMsg.includes(keyword.toLowerCase())) {
                return rule.reply;
            }
        }
    }
    return null;
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method === 'GET') {
        return res.status(200).json({ 
            status: 'active', 
            message: 'Easy Order Webhook is running',
            timestamp: new Date().toISOString()
        });
    }
    
    console.log('📦 Easy Order Webhook received:', new Date().toISOString());
    
    const data = req.body;
    let rawChatId = null;
    let message = null;
    
    // استخراج البيانات من payload
    if (data.payload) {
        rawChatId = data.payload.from;
        message = data.payload.body;
    }
    
    if (!rawChatId || !message) {
        console.log('⚠️ Missing chat_id or message');
        return res.status(200).json({ 
            received: true, 
            error: 'Missing data',
            raw: data 
        });
    }
    
    console.log(`📱 Original chat_id: ${rawChatId}`);
    console.log(`💬 Message: ${message}`);
    
    // 🔥 المهم: استخدام chat_id الأصلي كما هو
    // إذا كان يحتوي على @lid أو @c.us، نستخدمه مباشرة
    const chatId = rawChatId.includes('@') ? rawChatId : `${rawChatId}@c.us`;
    
    console.log(`📤 Sending to chat_id: ${chatId}`);
    
    // البحث عن رد تلقائي
    const autoReply = findAutoReply(message);
    
    if (autoReply) {
        console.log(`🤖 Auto-reply: ${autoReply.substring(0, 50)}...`);
        const result = await sendWhatsAppMessage(chatId, autoReply);
        return res.status(200).json({ 
            success: true, 
            replied: true, 
            reply: autoReply,
            chat_id: chatId
        });
    } else {
        console.log(`⚠️ No auto-reply found for: ${message}`);
        const fallback = '👋 شكراً لتواصلك! إذا كان لديك استفسار، اكتب "سعر" أو "طلب" أو "اخبارك"';
        await sendWhatsAppMessage(chatId, fallback);
        return res.status(200).json({ 
            success: true, 
            replied: true, 
            reply: fallback,
            chat_id: chatId
        });
    }
};
