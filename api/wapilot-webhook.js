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
        console.log(`✅ Auto-reply sent to ${phone}: ${message.substring(0, 50)}...`);
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Send error:', error.response?.data || error.message);
        return { success: false, error: error.response?.data || error.message };
    }
}

// دالة البحث عن رد تلقائي مناسب
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

// دالة لحفظ المحادثات (اختياري)
let conversations = [];

function saveConversation(phone, message, reply) {
    conversations.unshift({
        phone,
        message,
        reply,
        timestamp: new Date().toISOString()
    });
    // الاحتفاظ بآخر 100 محادثة
    if (conversations.length > 100) conversations.pop();
}

// API الرئيسي
module.exports = async (req, res) => {
    // ========== تسجيل كل ما يصل للـ Webhook ==========
    console.log('========================================');
    console.log('📡 WEBHOOK RECEIVED AT:', new Date().toISOString());
    console.log('Method:', req.method);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('Query:', JSON.stringify(req.query, null, 2));
    console.log('========================================');
    // ==================================================
    
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // GET: عرض الحالة والآخر 10 محادثات
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
    const data = req.body;
    
    // ========== محاولة استخراج البيانات من جميع التنسيقات الممكنة ==========
    let phone = null;
    let message = null;
    
    // التنسيق 1: Wapilot العادي (from, body)
    if (data.from) phone = data.from;
    if (data.body) message = data.body;
    
    // التنسيق 2: Easy Order (phone, message)
    if (data.phone) phone = data.phone;
    if (data.message) message = data.message;
    
    // التنسيق 3: داخل كائن message
    if (data.message?.from) phone = data.message.from;
    if (data.message?.body) message = data.message.body;
    if (data.message?.text) message = data.message.text;
    
    // التنسيق 4: داخل كائن data
    if (data.data?.from) phone = data.data.from;
    if (data.data?.body) message = data.data.body;
    if (data.data?.message) message = data.data.message;
    
    // التنسيق 5: sender, text
    if (data.sender) phone = data.sender;
    if (data.text) message = data.text;
    if (data.content) message = data.content;
    
    // التنسيق 6: event + data
    if (data.event === 'message' && data.data) {
        phone = data.data.from || data.data.phone;
        message = data.data.body || data.data.message || data.data.text;
    }
    
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
    // ===================================================================
    
    if (!phone || !message) {
        console.log('⚠️ Could not extract phone or message from data');
        console.log('Raw data received:', JSON.stringify(data, null, 2));
        return res.status(200).json({
            received: true,
            error: 'Could not extract phone or message',
            raw: data
        });
    }
    
    // البحث عن رد تلقائي
    const autoReply = findAutoReply(message);
    
    if (autoReply) {
        console.log(`🤖 Auto-reply found for "${message}": ${autoReply.substring(0, 50)}...`);
        const result = await sendWhatsAppMessage(phone, autoReply);
        saveConversation(phone, message, autoReply);
        
        return res.status(200).json({
            success: true,
            replied: true,
            reply: autoReply,
            result: result,
            timestamp: new Date().toISOString()
        });
    } else {
        console.log(`⚠️ No auto-reply found for message: "${message}"`);
        const fallbackReply = '👋 شكراً لتواصلك! إذا كان لديك استفسار عن الأسعار، اكتب "سعر". وإذا تريد طلب، اكتب "طلب".';
        await sendWhatsAppMessage(phone, fallbackReply);
        saveConversation(phone, message, fallbackReply);
        
        return res.status(200).json({
            success: true,
            replied: true,
            reply: fallbackReply,
            note: 'Fallback reply sent',
            timestamp: new Date().toISOString()
        });
    }
};
