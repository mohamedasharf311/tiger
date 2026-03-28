const axios = require('axios');

// إعدادات واتساب API
const INSTANCE_ID = "instance3532";
const API_TOKEN = "yzWzEjmxZpbifuOx6lWafYT3Ng69gaFpJGAdTsVc6N";
const API_URL = `https://api.wapilot.net/api/v2/${INSTANCE_ID}/send-message`;

// قواعد الردود التلقائية
let autoRules = [
    { keywords: ['سعر', 'الثمن', 'كم سعر', 'بكام', 'price'], reply: '💰 سعر المنتج هو 100 جنيه مصري. هل تريد معرفة المزيد؟', active: true },
    { keywords: ['شكرا', 'ممتاز', 'تمام', 'ok', 'شكراً'], reply: '🎉 شكراً لك! نحن في خدمتك دائماً.', active: true },
    { keywords: ['طلب', 'اوردر', 'اطلب', 'order', 'شراء'], reply: '🛍️ مرحباً! لإنشاء طلب جديد، يرجى إرسال:\n1. اسمك الكامل\n2. العنوان\n3. اسم المنتج', active: true },
    { keywords: ['توصيل', 'الشحن', 'delivery'], reply: '🚚 التوصيل خلال 3-5 أيام عمل. التكلفة 50 جنيهاً.', active: true },
    { keywords: ['مرحباً', 'السلام', 'اهلا', 'hello'], reply: '👋 أهلاً بك! كيف يمكنني مساعدتك اليوم؟', active: true }
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
        return { success: true };
    } catch (error) {
        console.error('Send error:', error.response?.data || error.message);
        return { success: false, error: error.response?.data || error.message };
    }
}

// دالة البحث عن رد
function findAutoReply(message) {
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
    console.log('📩 Webhook received:', new Date().toISOString());
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    
    const data = req.body;
    
    // محاولة استخراج البيانات من تنسيقات مختلفة
    let phone = null;
    let message = null;
    
    // تنسيق Wapilot العادي
    if (data.from) phone = data.from.replace('@c.us', '');
    if (data.body) message = data.body;
    
    // تنسيق Easy Order
    if (data.phone) phone = data.phone;
    if (data.message) message = data.message;
    if (data.text) message = data.text;
    
    // تنسيق آخر
    if (data.customer?.phone) phone = data.customer.phone;
    if (data.note) message = data.note;
    
    // تنظيف رقم الهاتف
    if (phone) phone = phone.replace(/[^0-9]/g, '');
    
    console.log(`📱 Phone: ${phone}`);
    console.log(`💬 Message: ${message}`);
    
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
        console.log(`🤖 Auto-reply found: ${autoReply.substring(0, 50)}...`);
        await sendWhatsAppMessage(phone, autoReply);
        return res.status(200).json({ 
            success: true, 
            replied: true, 
            reply: autoReply 
        });
    } else {
        console.log('⚠️ No auto-reply found');
        // رد عام
        const fallback = '👋 شكراً لتواصلك! إذا كان لديك استفسار عن الأسعار، اكتب "سعر"';
        await sendWhatsAppMessage(phone, fallback);
        return res.status(200).json({ 
            success: true, 
            replied: true, 
            reply: fallback,
            note: 'Fallback reply'
        });
    }
};
