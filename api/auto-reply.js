const axios = require('axios');

// قواعد الردود التلقائية
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

// دالة للحصول على Instance نشط (يمكن التوسع لاحقاً)
function getActiveInstances() {
    return instances.filter(inst => inst.active);
}

// دالة لإرسال رسالة عبر Instance محدد
async function sendMessageViaInstance(instance, phone, message) {
    try {
        let cleanPhone = phone.toString();
        cleanPhone = cleanPhone.replace('@c.us', '');
        cleanPhone = cleanPhone.replace('@lid', '');
        cleanPhone = cleanPhone.replace('+', '');
        cleanPhone = cleanPhone.replace(/[^0-9]/g, '');
        if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);
        
        const chat_id = `${cleanPhone}@c.us`;
        
        const response = await axios.post(
            `https://api.wapilot.net/api/v2/${instance.id}/send-message`,
            { chat_id, text: message },
            { headers: { "token": instance.token, "Content-Type": "application/json" } }
        );
        
        console.log(`✅ [${instance.name}] Auto-reply sent to ${phone}: ${message.substring(0, 50)}...`);
        return { success: true, data: response.data, instance: instance.name };
    } catch (error) {
        console.error(`❌ [${instance.name}] Auto-reply error:`, error.response?.data || error.message);
        return { success: false, error: error.response?.data || error.message, instance: instance.name };
    }
}

// دالة لإرسال رسالة عبر جميع الـ Instances أو أول Instance
async function sendAutoMessage(phone, message, instanceId = null) {
    let targetInstances = getActiveInstances();
    
    // إذا تم تحديد Instance معين
    if (instanceId) {
        targetInstances = targetInstances.filter(inst => inst.id === instanceId);
    }
    
    if (targetInstances.length === 0) {
        console.log('⚠️ No active instances found');
        return { success: false, error: 'No active instances' };
    }
    
    // إرسال عبر أول Instance نشط (يمكن تعديله لإرسال عبر جميعهم حسب الحاجة)
    const instance = targetInstances[0];
    return await sendMessageViaInstance(instance, phone, message);
}

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

// الدالة الرئيسية لمعالجة الرسائل الواردة (مع دعم تحديد الـ Instance)
async function processIncomingMessage(phone, message, instanceId = null) {
    console.log(`📩 رسالة واردة من ${phone}: ${message}`);
    
    const autoReply = getAutoReply(message);
    
    if (autoReply) {
        console.log(`🤖 رد تلقائي: ${autoReply}`);
        const result = await sendAutoMessage(phone, autoReply, instanceId);
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

// دوال جديدة لإدارة الـ Instances
function getInstances() {
    return instances;
}

function addInstance(id, token, name, active = true) {
    const newInstance = { id, token, name, active };
    instances.push(newInstance);
    return newInstance;
}

function updateInstanceStatus(instanceId, active) {
    const instance = instances.find(inst => inst.id === instanceId);
    if (instance) {
        instance.active = active;
        return true;
    }
    return false;
}

module.exports = {
    processIncomingMessage,
    getAutoReply,
    sendAutoMessage,
    addRule,
    getAllRules,
    getInstances,
    addInstance,
    updateInstanceStatus,
    sendMessageViaInstance
};
