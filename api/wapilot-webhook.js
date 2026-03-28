const axios = require('axios');

// إعدادات واتساب API
const INSTANCE_ID = "instance3532";
const API_TOKEN = "yzWzEjmxZpbifuOx6lWafYT3Ng69gaFpJGAdTsVc6N";
const API_URL = `https://api.wapilot.net/api/v2/${INSTANCE_ID}/send-message`;

// قواعد الردود التلقائية
let autoRules = [
    { keywords: ['سعر', 'الثمن', 'كم سعر', 'بكام', 'price'], reply: '💰 سعر المنتج هو 100 جنيه مصري. هل تريد معرفة المزيد؟', active: true },
    { keywords: ['شكرا', 'ممتاز', 'تمام', 'ok', 'شكراً'], reply: '🎉 شكراً لك! نحن في خدمتك دائماً. هل تحتاج لأي شيء آخر؟', active: true },
    { keywords: ['طلب', 'اوردر', 'اطلب', 'order', 'شراء'], reply: '🛍️ مرحباً! لإنشاء طلب جديد، يرجى إرسال:\n1. اسمك الكامل\n2. العنوان\n3. اسم المنتج\n\nسيتم التواصل معك لتأكيد الطلب.', active: true },
    { keywords: ['توصيل', 'الشحن', 'delivery'], reply: '🚚 التوصيل خلال 3-5 أيام عمل. التكلفة 50 جنيهاً للتوصيل داخل القاهرة.', active: true },
    { keywords: ['مرحباً', 'السلام', 'اهلا', 'hello', 'hi'], reply: '👋 أهلاً بك! كيف يمكنني مساعدتك اليوم؟\n\nيمكنك الاستفسار عن:\n- الأسعار 💰\n- الطلبات 🛍️\n- التوصيل 🚚', active: true }
];

// دالة إرسال رسالة واتساب
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

// تخزين المحادثات
let conversations = [];

function saveConversation(phone, message, reply) {
    conversations.unshift({
        phone,
        message,
        reply,
        timestamp: new Date().toISOString()
    });
    if (conversations.length > 100) conversations.pop();
}

module.exports = async (req, res) => {
    // CORS headers
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
            message: 'Webhook is running 24/7',
            rulesCount: autoRules.filter(r => r.active).length,
            lastConversations: conversations.slice(0, 10),
            timestamp: new Date().toISOString()
        });
    }
    
    // POST: استقبال البيانات من Wapilot
    console.log('📩 Webhook received:', new Date().toISOString());
    
    const data = req.body;
    let phone = null;
    let message = null;
    
    // التنسيق الصحيح من Wapilot - البيانات في payload
    if (data.event === 'message' && data.payload) {
        // استخراج رقم الهاتف من from (إزالة @lid أو @c.us)
        if (data.payload.from) {
            phone = data.payload.from;
            phone = phone.replace('@lid', '');
            phone = phone.replace('@c.us', '');
            phone = phone.replace('+', '');
            phone = phone.replace(/[^0-9]/g, '');
            if (phone.startsWith('0')) phone = phone.substring(1);
        }
        // استخراج الرسالة من body
        if (data.payload.body) {
            message = data.payload.body;
        }
    }
    
    // تنسيقات بديلة (احتياطي)
    if (!phone && data.from) phone = data.from;
    if (!message && data.body) message = data.body;
    if (!phone && data.phone) phone = data.phone;
    if (!message && data.message) message = data.message;
    
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
    
    // البحث عن رد تلقائي
    const autoReply = findAutoReply(message);
    
    if (autoReply) {
        console.log(`🤖 Auto-reply: ${autoReply.substring(0, 50)}...`);
        await sendWhatsAppMessage(phone, autoReply);
        saveConversation(phone, message, autoReply);
        
        return res.status(200).json({
            success: true,
            replied: true,
            reply: autoReply
        });
    } else {
        console.log(`⚠️ No auto-reply for: ${message}`);
        const fallback = '👋 شكراً لتواصلك! إذا كان لديك استفسار عن الأسعار، اكتب "سعر". وإذا تريد طلب، اكتب "طلب".';
        await sendWhatsAppMessage(phone, fallback);
        saveConversation(phone, message, fallback);
        
        return res.status(200).json({
            success: true,
            replied: true,
            reply: fallback
        });
    }
};
