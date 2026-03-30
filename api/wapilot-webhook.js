const axios = require('axios');

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
    { keywords: ['مساعدة', 'help', 'الخدمات'], reply: '📋 الخدمات المتاحة:\n💰 الأسعار\n🛍️ الطلبات\n🚚 التوصيل\n📞 التواصل', active: true }
];

async function sendWhatsAppMessage(instance, phone, message) {
    try {
        let cleanPhone = phone.toString();
        cleanPhone = cleanPhone.replace('@c.us', '');
        cleanPhone = cleanPhone.replace('@lid', '');
        cleanPhone = cleanPhone.replace('+', '');
        cleanPhone = cleanPhone.replace(/[^0-9]/g, '');
        if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);
        
        if (cleanPhone.length < 10 || cleanPhone.length > 15) {
            console.log(`⚠️ Invalid phone number: ${cleanPhone}`);
            return { success: false, error: 'Invalid phone number' };
        }
        
        const chat_id = `${cleanPhone}@c.us`;
        console.log(`📤 [${instance.name}] Sending to: ${chat_id}`);
        
        const response = await axios.post(
            `https://api.wapilot.net/api/v2/${instance.id}/send-message`,
            { chat_id, text: message },
            { headers: { "token": instance.token, "Content-Type": "application/json" } }
        );
        console.log(`✅ [${instance.name}] Sent successfully to ${cleanPhone}`);
        return { success: true };
    } catch (error) {
        console.error(`❌ [${instance.name}] Send failed:`, error.response?.data || error.message);
        return { success: false, error: error.response?.data || error.message };
    }
}

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

function getInstanceForWebhook(data) {
    if (data.instance_id) {
        const instance = instances.find(inst => inst.id === data.instance_id);
        if (instance && instance.active) return instance;
    }
    return instances.find(inst => inst.active);
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
            instances: instances.map(i => ({ id: i.id, name: i.name, active: i.active })),
            timestamp: new Date().toISOString() 
        });
    }
    
    console.log('📩 Webhook received:', new Date().toISOString());
    
    const data = req.body;
    let rawPhone = null;
    let message = null;
    let instanceId = null;
    
    if (data.event === 'message' && data.payload) {
        rawPhone = data.payload.from;
        message = data.payload.body;
        instanceId = data.instance_id || data.webhook_id;
    }
    
    if (!rawPhone || !message) {
        console.log('⚠️ Missing phone or message');
        return res.status(200).json({ received: true, error: 'Missing data' });
    }
    
    console.log(`📱 Raw phone: ${rawPhone}`);
    console.log(`💬 Message: ${message}`);
    
    let targetInstance = null;
    
    if (instanceId) {
        targetInstance = instances.find(inst => inst.id === instanceId);
    }
    
    if (!targetInstance) {
        targetInstance = instances.find(inst => inst.active);
    }
    
    if (!targetInstance) {
        console.log('⚠️ No active instance available');
        return res.status(200).json({ received: true, error: 'No active instance' });
    }
    
    if (rawPhone.includes('@lid')) {
        console.log(`⚠️ Cannot reply to LID: ${rawPhone}`);
        return res.status(200).json({
            received: true,
            note: 'Cannot reply to LID, need real phone number',
            rawPhone: rawPhone,
            instance: targetInstance.name
        });
    }
    
    let cleanPhone = rawPhone.replace('@c.us', '').replace('+', '').replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);
    
    console.log(`📱 Clean phone: ${cleanPhone}`);
    console.log(`🤖 Using instance: ${targetInstance.name}`);
    
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
        console.log(`⚠️ Invalid phone number length: ${cleanPhone.length}`);
        return res.status(200).json({
            received: true,
            error: 'Invalid phone number',
            phone: cleanPhone,
            instance: targetInstance.name
        });
    }
    
    const autoReply = findAutoReply(message);
    
    if (autoReply) {
        console.log(`🤖 Auto-reply: ${autoReply.substring(0, 50)}...`);
        await sendWhatsAppMessage(targetInstance, cleanPhone, autoReply);
        return res.status(200).json({ 
            success: true, 
            replied: true,
            instance: targetInstance.name
        });
    } else {
        const fallbackReply = '👋 شكراً لتواصلك! إذا كان لديك استفسار، اكتب "سعر" أو "طلب" أو "مساعدة"';
        await sendWhatsAppMessage(targetInstance, cleanPhone, fallbackReply);
        return res.status(200).json({ 
            success: true, 
            replied: true,
            reply: fallbackReply,
            instance: targetInstance.name
        });
    }
};
