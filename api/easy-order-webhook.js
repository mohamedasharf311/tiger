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
    { keywords: ['اخبارك', 'ازيك', 'كيفك', 'how are you'], reply: '👋 أنا بخير، شكراً لسؤالك! كيف يمكنني مساعدتك اليوم؟', active: true }
];

// دالة إرسال رسالة واتساب
async function sendWhatsAppMessage(phone, message) {
    try {
        // تنظيف رقم الهاتف
        let cleanPhone = phone.toString();
        cleanPhone = cleanPhone.replace('@c.us', '');
        cleanPhone = cleanPhone.replace('@lid', '');
        cleanPhone = cleanPhone.replace('+', '');
        cleanPhone = cleanPhone.replace(/[^0-9]/g, '');
        if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);
        
        // التحقق من أن الرقم صالح
        if (cleanPhone.length < 10 || cleanPhone.length > 15) {
            console.log(`⚠️ Invalid phone number: ${cleanPhone}`);
            return { success: false, error: 'Invalid phone number' };
        }
        
        const chat_id = `${cleanPhone}@c.us`;
        console.log(`📤 Sending to: ${chat_id}`);
        
        const response = await axios.post(
            API_URL,
            { chat_id, text: message },
            { headers: { "token": API_TOKEN, "Content-Type": "application/json" } }
        );
        console.log(`✅ Sent successfully to ${cleanPhone}`);
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
    let rawPhone = null;
    let message = null;
    
    // التنسيق الصحيح - البيانات في payload
    if (data.payload) {
        rawPhone = data.payload.from;
        message = data.payload.body;
    }
    
    // تنسيق بديل
    if (!rawPhone && data.from) rawPhone = data.from;
    if (!message && data.body) message = data.body;
    if (!message && data.message) message = data.message;
    
    console.log(`📱 Raw phone: ${rawPhone}`);
    console.log(`💬 Message: ${message}`);
    
    if (!rawPhone || !message) {
        console.log('⚠️ Missing phone or message');
        return res.status(200).json({ 
            received: true, 
            error: 'Missing phone or message',
            raw: data 
        });
    }
    
    // تنظيف رقم الهاتف من @lid أو @c.us
    let cleanPhone = rawPhone.toString();
    cleanPhone = cleanPhone.replace('@lid', '');
    cleanPhone = cleanPhone.replace('@c.us', '');
    cleanPhone = cleanPhone.replace('+', '');
    cleanPhone = cleanPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);
    
    console.log(`📱 Clean phone: ${cleanPhone}`);
    
    // التحقق من صحة الرقم
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
        console.log(`⚠️ Invalid phone number length: ${cleanPhone.length}`);
        // حتى لو الرقم غير صالح، نحاول الرد على المعرف الأصلي
        // نستخدم المعرف الأصلي للإرسال
        const originalId = rawPhone.includes('@') ? rawPhone : `${rawPhone}@c.us`;
        console.log(`📤 Trying to send to original ID: ${originalId}`);
        
        try {
            const response = await axios.post(
                API_URL,
                { chat_id: originalId, text: '👋 شكراً لتواصلك!' },
                { headers: { "token": API_TOKEN, "Content-Type": "application/json" } }
            );
            console.log(`✅ Sent to original ID`);
        } catch (err) {
            console.log(`❌ Failed to send to original ID`);
        }
        
        return res.status(200).json({ 
            received: true, 
            note: 'Tried to reply to original ID',
            originalId: originalId
        });
    }
    
    // البحث عن رد تلقائي
    const autoReply = findAutoReply(message);
    
    if (autoReply) {
        console.log(`🤖 Auto-reply found: ${autoReply.substring(0, 50)}...`);
        await sendWhatsAppMessage(cleanPhone, autoReply);
        return res.status(200).json({ success: true, replied: true, reply: autoReply });
    } else {
        console.log(`⚠️ No auto-reply found for: ${message}`);
        // رد عام
        const fallback = '👋 شكراً لتواصلك! إذا كان لديك استفسار، اكتب "سعر" أو "طلب" أو "اخبارك"';
        await sendWhatsAppMessage(cleanPhone, fallback);
        return res.status(200).json({ success: true, replied: true, reply: fallback });
    }
};
