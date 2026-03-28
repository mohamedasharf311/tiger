const axios = require('axios');

// إعدادات واتساب API
const INSTANCE_ID = "instance3532";
const API_TOKEN = "yzWzEjmxZpbifuOx6lWafYT3Ng69gaFpJGAdTsVc6N";
const API_URL = `https://api.wapilot.net/api/v2/${INSTANCE_ID}/send-message`;

// قواعد الردود التلقائية (يمكن تعديلها من الواجهة لاحقاً)
let autoRules = [
    {
        keywords: ['سعر', 'الثمن', 'كم سعر', 'بكام', 'price'],
        reply: '💰 سعر المنتج هو 100 جنيه مصري. هل تريد معرفة المزيد؟',
        active: true
    },
    {
        keywords: ['شكرا', 'ممتاز', 'تمام', 'ok', 'شكراً'],
        reply: '🎉 شكراً لك! نحن في خدمتك دائماً. هل تحتاج لأي شيء آخر؟',
        active: true
    },
    {
        keywords: ['طلب', 'اوردر', 'اطلب', 'order', 'شراء'],
        reply: '🛍️ مرحباً! لإنشاء طلب جديد، يرجى إرسال:\n1. اسمك الكامل\n2. العنوان\n3. اسم المنتج\n\nسيتم التواصل معك لتأكيد الطلب.',
        active: true
    },
    {
        keywords: ['توصيل', 'الشحن', 'delivery'],
        reply: '🚚 التوصيل خلال 3-5 أيام عمل. التكلفة 50 جنيهاً للتوصيل داخل القاهرة.',
        active: true
    },
    {
        keywords: ['مرحباً', 'السلام', 'اهلا', 'hello', 'hi'],
        reply: '👋 أهلاً بك! كيف يمكنني مساعدتك اليوم؟\n\nيمكنك الاستفسار عن:\n- الأسعار 💰\n- الطلبات 🛍️\n- التوصيل 🚚',
        active: true
    }
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
            message: 'Easy Order Webhook is running',
            rulesCount: autoRules.filter(r => r.active).length,
            lastConversations: conversations.slice(0, 10),
            timestamp: new Date().toISOString()
        });
    }
    
    // POST: استقبال البيانات من Wapilot Easy Order
    console.log('📦 Easy Order Webhook Received:', new Date().toISOString());
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));
    
    const data = req.body;
    
    // استخراج رقم الهاتف والرسالة من تنسيق Easy Order
    let phone = null;
    let message = null;
    
    // محاولة استخراج من مختلف التنسيقات
    if (data.phone) phone = data.phone;
    if (data.customer?.phone) phone = data.customer.phone;
    if (data.from) phone = data.from;
    
    if (data.message) message = data.message;
    if (data.note) message = data.note;
    if (data.body) message = data.body;
    if (data.text) message = data.text;
    
    // تنظيف رقم الهاتف
    if (phone) {
        phone = phone.toString().replace(/[^0-9]/g, '');
        if (phone.startsWith('0')) phone = phone.substring(1);
    }
    
    console.log(`📱 Phone: ${phone}`);
    console.log(`💬 Message: ${message}`);
    
    if (!phone || !message) {
        console.log('⚠️ Missing phone or message, but acknowledging receipt');
        return res.status(200).json({
            received: true,
            error: 'Missing phone or message',
            raw: data
        });
    }
    
    // البحث عن رد تلقائي
    const autoReply = findAutoReply(message);
    
    if (autoReply) {
        console.log(`🤖 Auto-reply found: ${autoReply.substring(0, 50)}...`);
        await sendWhatsAppMessage(phone, autoReply);
        saveConversation(phone, message, autoReply);
        
        return res.status(200).json({
            success: true,
            replied: true,
            reply: autoReply,
            timestamp: new Date().toISOString()
        });
    } else {
        console.log('⚠️ No auto-reply found, sending fallback');
        const fallbackReply = '👋 شكراً لتواصلك! إذا كان لديك استفسار عن الأسعار، اكتب "سعر". وإذا تريد طلب، اكتب "طلب".';
        await sendWhatsAppMessage(phone, fallbackReply);
        saveConversation(phone, message, fallbackReply);
        
        return res.status(200).json({
            success: true,
            replied: true,
            reply: fallbackReply,
            note: 'Fallback reply sent'
        });
    }
};
