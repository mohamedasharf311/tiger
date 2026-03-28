const axios = require('axios');

// إعدادات واتساب API
const INSTANCE_ID = "instance3532";
const API_TOKEN = "yzWzEjmxZpbifuOx6lWafYT3Ng69gaFpJGAdTsVc6N";
const API_URL = `https://api.wapilot.net/api/v2/${INSTANCE_ID}/send-message`;

// قواعد الردود التلقائية
let autoRules = [
    { keywords: ['سعر', 'الثمن', 'كم سعر', 'بكام'], reply: '💰 سعر المنتج هو 100 جنيه مصري. هل تريد معرفة المزيد؟', active: true },
    { keywords: ['شكرا', 'ممتاز', 'تمام', 'شكراً'], reply: '🎉 شكراً لك! نحن في خدمتك دائماً.', active: true },
    { keywords: ['طلب', 'اوردر', 'اطلب', 'شراء'], reply: '🛍️ مرحباً! لإنشاء طلب جديد، يرجى إرسال:\n1. اسمك الكامل\n2. العنوان\n3. اسم المنتج', active: true },
    { keywords: ['توصيل', 'الشحن'], reply: '🚚 التوصيل خلال 3-5 أيام عمل. التكلفة 50 جنيهاً.', active: true },
    { keywords: ['مرحباً', 'السلام', 'اهلا'], reply: '👋 أهلاً بك! كيف يمكنني مساعدتك اليوم؟', active: true }
];

// دالة إرسال رسالة
async function sendWhatsAppMessage(phone, message) {
    try {
        const chat_id = `${phone}@c.us`;
        const response = await axios.post(
            API_URL,
            { chat_id, text: message },
            { headers: { "token": API_TOKEN, "Content-Type": "application/json" } }
        );
        console.log(`✅ Auto-reply sent to ${phone}`);
        return true;
    } catch (error) {
        console.error('Send error:', error.response?.data || error.message);
        return false;
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
    
    // GET: عرض الحالة
    if (req.method === 'GET') {
        return res.status(200).json({ 
            status: 'active', 
            message: 'Webhook is running',
            timestamp: new Date().toISOString()
        });
    }
    
    // POST: استقبال البيانات
    console.log('========================================');
    console.log('📡 WEBHOOK RECEIVED:', new Date().toISOString());
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('========================================');
    
    const data = req.body;
    let phone = null;
    let message = null;
    
    // تنسيق Wapilot (الأكثر شيوعاً)
    if (data.from) phone = data.from;
    if (data.body) message = data.body;
    
    // تنسيق آخر
    if (data.sender) phone = data.sender;
    if (data.text) message = data.text;
    if (data.content) message = data.content;
    
    // تنظيف رقم الهاتف
    if (phone) {
        phone = phone.toString();
        phone = phone.replace('@c.us', '');
        phone = phone.replace('+', '');
        phone = phone.replace(/[^0-9]/g, '');
        if (phone.startsWith('0')) phone = phone.substring(1);
    }
    
    console.log(`📱 Extracted Phone: ${phone}`);
    console.log(`💬 Extracted Message: ${message}`);
    
    if (!phone || !message) {
        console.log('⚠️ Missing phone or message');
        return res.status(200).json({ 
            received: true, 
            error: 'Missing phone or message',
            raw: data 
        });
    }
    
    // البحث عن رد
    const autoReply = findAutoReply(message);
    
    if (autoReply) {
        console.log(`🤖 Auto-reply found: ${autoReply}`);
        await sendWhatsAppMessage(phone, autoReply);
        return res.status(200).json({ 
            success: true, 
            replied: true, 
            reply: autoReply 
        });
    } else {
        console.log('⚠️ No auto-reply found');
        const fallback = '👋 شكراً لتواصلك! إذا كان لديك استفسار، اكتب "سعر" أو "طلب"';
        await sendWhatsAppMessage(phone, fallback);
        return res.status(200).json({ 
            success: true, 
            replied: true, 
            reply: fallback 
        });
    }
};
