const axios = require('axios');
const { getInstances, sendMessageViaInstance } = require('./auto-reply');

// إعدادات الـ Instances المتعددة
const instances = [
    {
        id: "instance3532",
        token: "yzWzEjmxZpbifuOx6lWafYT3Ng69gaFpJGAdTsVc6N",
        name: "الرقم الأول",
        active: true
    },
    {
        id: "instance3537",
        token: "yzWzEjmxZpbifuOx6lWafYT3Ng69gaFpJGAdTsVc6N",
        name: "الرقم الثاني",
        active: true
    }
];

// قواعد الردود التلقائية
let autoRules = [
    { keywords: ['سعر', 'الثمن', 'كم سعر', 'بكام', 'price'], reply: '💰 سعر المنتج هو 100 جنيه مصري. هل تريد معرفة المزيد؟', active: true },
    { keywords: ['شكرا', 'ممتاز', 'تمام', 'ok', 'شكراً'], reply: '🎉 شكراً لك! نحن في خدمتك دائماً.', active: true },
    { keywords: ['طلب', 'اوردر', 'اطلب', 'order', 'شراء'], reply: '🛍️ مرحباً! لإنشاء طلب جديد، يرجى إرسال:\n1. اسمك الكامل\n2. العنوان\n3. اسم المنتج', active: true },
    { keywords: ['توصيل', 'الشحن', 'delivery'], reply: '🚚 التوصيل خلال 3-5 أيام عمل. التكلفة 50 جنيهاً.', active: true },
    { keywords: ['اخبارك', 'ازيك', 'كيفك', 'how are you'], reply: '👋 أنا بخير، شكراً لسؤالك! كيف يمكنني مساعدتك اليوم؟', active: true }
];

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

// دالة لتحديد أي Instance استقبل الرسالة (بناءً على webhook)
function getInstanceFromWebhook(data) {
    // يمكن تحديد الـ Instance من data.webhook_id أو data.instance_id إذا كانت موجودة
    if (data.instance_id) {
        return instances.find(inst => inst.id === data.instance_id);
    }
    // إذا لم يتم تحديد، نستخدم الـ Instance الأول النشط
    return instances.find(inst => inst.active);
}

// دالة إرسال رسالة باستخدام Instance محدد
async function sendWhatsAppMessage(instance, chat_id, message) {
    try {
        console.log(`📤 [${instance.name}] Sending to: ${chat_id}`);
        
        const response = await axios.post(
            `https://api.wapilot.net/api/v2/${instance.id}/send-message`,
            { chat_id, text: message },
            { headers: { "token": instance.token, "Content-Type": "application/json" } }
        );
        
        console.log(`✅ [${instance.name}] Sent successfully to ${chat_id}`);
        return { success: true };
    } catch (error) {
        console.error(`❌ [${instance.name}] Send failed:`, error.response?.data || error.message);
        return { success: false, error: error.response?.data || error.message };
    }
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
            message: 'Easy Order Webhook is running (Dual Instance)',
            instances: instances.map(i => ({ id: i.id, name: i.name, active: i.active })),
            timestamp: new Date().toISOString()
        });
    }
    
    console.log('📦 Easy Order Webhook received:', new Date().toISOString());
    
    const data = req.body;
    let rawChatId = null;
    let message = null;
    let webhookInstanceId = null;
    
    // استخراج البيانات من payload
    if (data.payload) {
        rawChatId = data.payload.from;
        message = data.payload.body;
        webhookInstanceId = data.instance_id || data.webhook_id;
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
    console.log(`🔌 Webhook Instance: ${webhookInstanceId || 'auto-detect'}`);
    
    // تحديد أي Instance سيتم استخدامه للرد
    let targetInstance = null;
    
    if (webhookInstanceId) {
        targetInstance = instances.find(inst => inst.id === webhookInstanceId);
    }
    
    if (!targetInstance) {
        targetInstance = instances.find(inst => inst.active);
    }
    
    if (!targetInstance) {
        console.log('⚠️ No active instance available');
        return res.status(200).json({ received: true, error: 'No active instance' });
    }
    
    const chatId = rawChatId.includes('@') ? rawChatId : `${rawChatId}@c.us`;
    
    console.log(`📤 Using instance: ${targetInstance.name} (${targetInstance.id})`);
    console.log(`📤 Sending to chat_id: ${chatId}`);
    
    // البحث عن رد تلقائي
    const autoReply = findAutoReply(message);
    
    if (autoReply) {
        console.log(`🤖 Auto-reply: ${autoReply.substring(0, 50)}...`);
        const result = await sendWhatsAppMessage(targetInstance, chatId, autoReply);
        return res.status(200).json({ 
            success: true, 
            replied: true, 
            reply: autoReply,
            chat_id: chatId,
            instance: targetInstance.name
        });
    } else {
        console.log(`⚠️ No auto-reply found for: ${message}`);
        const fallback = '👋 شكراً لتواصلك! إذا كان لديك استفسار، اكتب "سعر" أو "طلب" أو "اخبارك"';
        await sendWhatsAppMessage(targetInstance, chatId, fallback);
        return res.status(200).json({ 
            success: true, 
            replied: true, 
            reply: fallback,
            chat_id: chatId,
            instance: targetInstance.name
        });
    }
};
