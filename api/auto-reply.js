const axios = require('axios');

// قواعد الردود التلقائية (يمكن تخزينها في ملف JSON لاحقاً)
let autoRules = [
    {
        id: 1,
        keywords: ['سعر', 'الثمن', 'كم سعر', 'بكام'],
        reply: '💰 سعر المنتج هو 100 جنيه مصري. هل تريد معرفة المزيد؟',
        active: true
    },
    {
        id: 2,
        keywords: ['شكرا', 'ممتاز', 'تمام', 'ok'],
        reply: '🎉 شكراً لك! نحن في خدمتك دائماً.',
        active: true
    },
    {
        id: 3,
        keywords: ['طلب', 'اوردر', 'اطلب'],
        reply: '🛍️ لطلب المنتج، يرجى إرسال اسمك الكامل وعنوانك.',
        active: true
    },
    {
        id: 4,
        keywords: ['توصيل', 'الشحن', 'delivery'],
        reply: '🚚 التوصيل خلال 3-5 أيام عمل. التكلفة 50 جنيهاً.',
        active: true
    }
];

// دالة للبحث عن رد تلقائي
function getAutoReply(message) {
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

// دالة لإرسال رسالة تلقائية
async function sendAutoMessage(phone, message) {
    try {
        const INSTANCE_ID = "instance3532";
        const API_TOKEN = "yzWzEjmxZpbifuOx6lWafYT3Ng69gaFpJGAdTsVc6N";
        const chat_id = `${phone}@c.us`;
        
        const response = await axios.post(
            `https://api.wapilot.net/api/v2/${INSTANCE_ID}/send-message`,
            { chat_id, text: message },
            { headers: { "token": API_TOKEN, "Content-Type": "application/json" } }
        );
        
        console.log(`✅ Auto-reply sent to ${phone}: ${message.substring(0, 50)}...`);
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Auto-reply error:', error.response?.data || error.message);
        return { success: false, error: error.response?.data || error.message };
    }
}

// الدالة الرئيسية لمعالجة الرسائل الواردة
async function processIncomingMessage(phone, message) {
    console.log(`📩 رسالة واردة من ${phone}: ${message}`);
    
    // البحث عن رد تلقائي
    const autoReply = getAutoReply(message);
    
    if (autoReply) {
        console.log(`🤖 رد تلقائي: ${autoReply}`);
        const result = await sendAutoMessage(phone, autoReply);
        return { replied: true, message: autoReply, result };
    }
    
    console.log(`⚠️ لا يوجد رد تلقائي للرسالة: ${message}`);
    return { replied: false };
}

// دالة لإضافة قاعدة جديدة
function addRule(keywords, reply, active = true) {
    const newRule = {
        id: Date.now(),
        keywords: keywords.split(',').map(k => k.trim()),
        reply: reply,
        active: active
    };
    autoRules.push(newRule);
    return newRule;
}

// دالة للحصول على كل القواعد
function getAllRules() {
    return autoRules;
}

module.exports = {
    processIncomingMessage,
    getAutoReply,
    sendAutoMessage,
    addRule,
    getAllRules
};
