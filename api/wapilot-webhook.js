const axios = require('axios');

// إعدادات واتساب API
const INSTANCE_ID = "instance3532";
const API_TOKEN = "yzWzEjmxZpbifuOx6lWafYT3Ng69gaFpJGAdTsVc6N";
const API_URL = `https://api.wapilot.net/api/v2/${INSTANCE_ID}/send-message`;

// قواعد الردود التلقائية (يمكن تعديلها من الواجهة لاحقاً)
let autoRules = [
    {
        id: 1,
        keywords: ['سعر', 'الثمن', 'كم سعر', 'بكام', 'price'],
        reply: '💰 سعر المنتج هو 100 جنيه مصري. هل تريد معرفة المزيد من التفاصيل؟',
        active: true
    },
    {
        id: 2,
        keywords: ['شكرا', 'ممتاز', 'تمام', 'ok', 'شكراً'],
        reply: '🎉 شكراً لك! نحن في خدمتك دائماً. هل تحتاج لأي شيء آخر؟',
        active: true
    },
    {
        id: 3,
        keywords: ['طلب', 'اوردر', 'اطلب', 'order', 'شراء'],
        reply: '🛍️ مرحباً! لإنشاء طلب جديد، يرجى إرسال:\n1. اسمك الكامل\n2. العنوان\n3. اسم المنتج\n\nسيتم التواصل معك لتأكيد الطلب.',
        active: true
    },
    {
        id: 4,
        keywords: ['توصيل', 'الشحن', 'delivery', 'شحن'],
        reply: '🚚 التوصيل خلال 3-5 أيام عمل. التكلفة 50 جنيهاً للتوصيل داخل القاهرة.',
        active: true
    },
    {
        id: 5,
        keywords: ['مرحباً', 'السلام', 'اهلا', 'hello', 'hi'],
        reply: '👋 أهلاً بك! كيف يمكنني مساعدتك اليوم؟\n\nيمكنك الاستفسار عن:\n- الأسعار 💰\n- الطلبات 🛍️\n- التوصيل 🚚',
        active: true
    },
    {
        id: 6,
        keywords: ['رقم', 'تلفون', 'واتساب', 'تواصل'],
        reply: '📞 يمكنك التواصل معنا عبر:\n- واتساب: 201158820082\n- الهاتف: 01158820082\n- البريد: support@example.com',
        active: true
    },
    {
        id: 7,
        keywords: ['متي', 'وقت', 'مواعيد', 'ساعات'],
        reply: '🕐 ساعات العمل:\n- من السبت إلى الخميس: 9 صباحاً - 9 مساءً\n- الجمعة: إجازة\n\nنحن هنا لخدمتك!',
        active: true
    }
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
        console.log(`✅ Auto-reply sent to ${phone}: ${message.substring(0, 50)}...`);
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Send error:', error.response?.data || error.message);
        return { success: false, error: error.response?.data || error.message };
    }
}

// دالة البحث عن رد تلقائي
function findAutoReply(message) {
    const lowerMsg = message.toLowerCase();
    
    // البحث عن قاعدة مطابقة
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

// دالة حفظ المحادثة (يمكن تخزينها في JSON لاحقاً)
let conversations = [];

function saveConversation(phone, message, reply) {
    const conv = {
        phone,
        message,
        reply,
        timestamp: new Date().toISOString()
    };
    conversations.unshift(conv);
    // الاحتفاظ بآخر 100 محادثة فقط
    if (conversations.length > 100) conversations.pop();
}

// API الرئيسي لاستقبال Webhook
module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // GET: عرض حالة الـ Webhook
    if (req.method === 'GET') {
        return res.status(200).json({
            status: 'active',
            message: 'Webhook is running 24/7',
            rulesCount: autoRules.filter(r => r.active).length,
            lastConversations: conversations.slice(0, 10)
        });
    }
    
    // POST: استقبال الرسائل من Wapilot
    console.log('📩 Webhook received:', new Date().toISOString());
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    
    // استخراج بيانات الرسالة (تنسيق Wapilot)
    const messageData = req.body;
    
    // محاولة استخراج رقم الهاتف والرسالة من مختلف التنسيقات
    let phone = messageData.from || messageData.phone || messageData.sender;
    let message = messageData.body || messageData.text || messageData.message;
    
    // تنظيف رقم الهاتف (إزالة @c.us إذا وجد)
    if (phone) {
        phone = phone.replace('@c.us', '');
        phone = phone.replace('+', '');
    }
    
    console.log(`📱 From: ${phone}`);
    console.log(`💬 Message: ${message}`);
    
    if (!phone || !message) {
        console.log('⚠️ Missing phone or message');
        return res.status(200).json({ 
            received: true, 
            error: 'Missing phone or message',
            raw: req.body 
        });
    }
    
    // البحث عن رد تلقائي
    const autoReply = findAutoReply(message);
    
    if (autoReply) {
        console.log(`🤖 Auto-reply: ${autoReply}`);
        
        // إرسال الرد
        const result = await sendWhatsAppMessage(phone, autoReply);
        
        // حفظ المحادثة
        saveConversation(phone, message, autoReply);
        
        return res.status(200).json({
            success: true,
            replied: true,
            reply: autoReply,
            result: result
        });
    } else {
        console.log(`⚠️ No auto-reply found for: ${message}`);
        
        // رد عام إذا لم يجد قاعدة
        const fallbackReply = '👋 شكراً لتواصلك! سيتم الرد عليك قريباً. إذا كان لديك استفسار عن الأسعار أو الطلبات، يمكنك كتابة "سعر" أو "طلب"';
        await sendWhatsAppMessage(phone, fallbackReply);
        
        saveConversation(phone, message, fallbackReply);
        
        return res.status(200).json({
            success: true,
            replied: true,
            reply: fallbackReply,
            note: 'No specific rule found, sent fallback reply'
        });
    }
};
