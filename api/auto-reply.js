const axios = require('axios');

// ==================== COMPANY DATA ====================
const companyData = {
    name: "النمر للشحن - ELNMR",
    services: "شحن – تخزين – تغليف داخل الإسكندرية",
    welcomeMessage: `🐯 أهلاً بيك في شركة النمر للشحن!

من فضلك اختار الرقم المناسب 👇

1️⃣ أسعار الشحن داخل الإسكندرية
2️⃣ أسعار الشحن خارج الإسكندرية
3️⃣ مدة التوصيل
4️⃣ طرق الدفع
5️⃣ شروط الشحن
6️⃣ التحدث مع خدمة العملاء`,
    
    deliveryTimes: {
        north: "داخل الوجه البحري: خلال 72 ساعة",
        south: "وجه قبلي: خلال 5 أيام",
        collection: "التحصيل: خلال 24 ساعة"
    },
    
    paymentMethods: "كاش - محفظة - إنستاباي - حساب بنكي",
    
    shippingPrices: {
        alexandria: {
            "60 جنيه": ["سيدي جابر", "جليم", "سموحة", "كفر عبده", "محطة الرمل", "محرم بك", "محطة مصر", "اللبان", "العطارين", "المنشية", "كرموز"],
            "65 جنيه": ["رأس السودة", "سيوف", "حجر النواتية", "خورشيد"],
            "70 جنيه": ["المندرة", "المعمورة", "طوسون", "أبو قير"],
            "75 جنيه": ["العجمي"],
            "90 جنيه": ["برج العرب"]
        },
        outsideAlexandria: {
            "100 جنيه": ["القاهرة", "بورسعيد", "الإسماعيلية", "الفيوم", "قنا"],
            "120 جنيه": ["سوهاج"]
        }
    },
    
    terms: [
        "السعر ممكن يتغير حسب البنزين",
        "الأوردر القابل للكسر = مسؤولية العميل",
        "في خدمة VIP توصيل نفس اليوم",
        "يتم إضافة تكلفة بعد 5 كيلو",
        "في تعاقدات للشركات بأسعار خاصة"
    ]
};

// ==================== AUTO REPLY RULES ====================
// قواعد الردود التلقائية - نظام القوائم (Menu Bot)
let autoRules = [
    // القائمة الرئيسية
    {
        id: 0,
        keywords: ['قائمة', 'menu', 'الرئيسية', 'start', 'بداية', 'مرحباً', 'مرحبا', 'اهلا', 'أهلاً', 'السلام عليكم', 'وعليكم السلام', 'صباح الخير', 'مساء الخير', 'هاي', 'hello', 'hi', 'hey', 'ازيك', 'عامل ايه', 'عاملين ايه', 'اخباركم', 'في حد هنا', 'حد موجود'],
        reply: companyData.welcomeMessage,
        active: true
    },
    
    // 1️⃣ أسعار الشحن داخل الإسكندرية
    {
        id: 1,
        keywords: ['1', 'داخل الاسكندرية', 'داخل الإسكندرية', 'اسكندرية', 'الإسكندرية', 'اسعار اسكندرية', 'اسعار داخل'],
        reply: `📍 أسعار الشحن داخل الإسكندرية:

💰 60 جنيه:
${companyData.shippingPrices.alexandria["60 جنيه"].join(' - ')}

💰 65 جنيه:
${companyData.shippingPrices.alexandria["65 جنيه"].join(' - ')}

💰 70 جنيه:
${companyData.shippingPrices.alexandria["70 جنيه"].join(' - ')}

💰 75 جنيه:
${companyData.shippingPrices.alexandria["75 جنيه"].join(' - ')}

💰 90 جنيه:
${companyData.shippingPrices.alexandria["90 جنيه"].join(' - ')}

للرجوع للقائمة الرئيسية اكتب 'قائمة'`,
        active: true
    },
    
    // 2️⃣ أسعار الشحن خارج الإسكندرية
    {
        id: 2,
        keywords: ['2', 'خارج الاسكندرية', 'خارج الإسكندرية', 'خارج', 'اسعار خارج', 'القاهرة', 'بورسعيد', 'الإسماعيلية', 'الفيوم', 'قنا', 'سوهاج'],
        reply: `📍 أسعار الشحن خارج الإسكندرية:

💰 100 جنيه:
${companyData.shippingPrices.outsideAlexandria["100 جنيه"].join(' - ')}

💰 120 جنيه:
${companyData.shippingPrices.outsideAlexandria["120 جنيه"].join(' - ')}

للرجوع للقائمة الرئيسية اكتب 'قائمة'`,
        active: true
    },
    
    // 3️⃣ مدة التوصيل
    {
        id: 3,
        keywords: ['3', 'مدة التوصيل', 'التوصيل', 'المدة', 'وقت', 'كم يوم', 'مدة الشحن', 'المدة كام'],
        reply: `⏱️ مدة التوصيل في النمر للشحن:

• ${companyData.deliveryTimes.north}
• ${companyData.deliveryTimes.south}
• ${companyData.deliveryTimes.collection}

للرجوع للقائمة الرئيسية اكتب 'قائمة'`,
        active: true
    },
    
    // 4️⃣ طرق الدفع
    {
        id: 4,
        keywords: ['4', 'طرق الدفع', 'الدفع', 'payment', 'كيف ادفع', 'ادفع ازاي', 'طرق السداد', 'السداد'],
        reply: `💰 طرق الدفع في النمر للشحن:

• كاش 💵
• محفظة 📱 (فودافون كاش - انستاباي)
• إنستاباي 🏦
• تحويل بنكي 💳

للرجوع للقائمة الرئيسية اكتب 'قائمة'`,
        active: true
    },
    
    // 5️⃣ شروط الشحن
    {
        id: 5,
        keywords: ['5', 'شروط', 'شروط الشحن', 'سياسة', 'قوانين', 'ممنوع', 'مسموح', 'ضمان'],
        reply: `📋 شروط الشحن في النمر للشحن:

${companyData.terms.map((t, i) => `${i+1}. ${t}`).join('\n')}

للرجوع للقائمة الرئيسية اكتب 'قائمة'`,
        active: true
    },
    
    // 6️⃣ التحدث مع خدمة العملاء
    {
        id: 6,
        keywords: ['6', 'خدمة العملاء', 'خدمه العملاء', 'دعم', 'support', 'تكلم مع موظف', 'موظف', 'تحكم', 'شكوى', 'مشكلة', 'اتصل بمسؤول', 'مسؤول', 'agent', 'human', 'شخص'],
        reply: "👤 تم تحويل محادثتك إلى خدمة العملاء في النمر للشحن. سيتم الرد عليك يدوياً في أقرب وقت. شكراً لصبرك.",
        active: true
    },
    
    // طلب شحن جديد
    {
        id: 7,
        keywords: ['طلب شحن', 'شحنة', 'شحن', 'طلب', 'اوردر', 'عايز أطلب', 'عايز اشتري', 'احجز', 'ابدأ معاك', 'يلا نبدأ', 'عايز اشترك', 'سجلني', 'امشي في الموضوع'],
        reply: `🛍️ لطلب شحنة جديدة في النمر للشحن، يرجى إرسال:

1️⃣ اسمك الكامل
2️⃣ العنوان بالتفصيل (المنطقة - الشارع)
3️⃣ نوع البضاعة (عادي / قابل للكسر)
4️⃣ الوزن التقريبي (بالكيلو)

سيتم التواصل معك لتأكيد السعر وموعد الاستلام.

للرجوع للقائمة الرئيسية اكتب 'قائمة'`,
        active: true
    },
    
    // خدمة VIP
    {
        id: 8,
        keywords: ['vip', 'VIP', 'نفس اليوم', 'توصيل سريع', 'توصيل فوري', 'سريع', 'عاجل'],
        reply: `🚚 خدمة VIP توصيل نفس اليوم في النمر للشحن:

• متاحة داخل الإسكندرية فقط
• السعر يبدأ من 150 جنيه حسب المنطقة والوزن
• للطلب، تواصل مع خدمة العملاء (اضغط 6)

للرجوع للقائمة الرئيسية اكتب 'قائمة'`,
        active: true
    },
    
    // الاستفسار عن الأسعار بشكل عام
    {
        id: 9,
        keywords: ['سعر', 'الثمن', 'كم سعر', 'بكام', 'التكلفة كام', 'فيه عرض', 'في خصم', 'ارخص حاجة', 'نظام الدفع', 'فيه تقسيط'],
        reply: `💰 أسعار الشحن في النمر للشحن:

📍 داخل الإسكندرية: من 60 إلى 90 جنيه حسب المنطقة
📍 خارج الإسكندرية: 100 - 120 جنيه حسب المحافظة

للتفاصيل الدقيقة:
• اضغط 1 لأسعار داخل الإسكندرية
• اضغط 2 لأسعار خارج الإسكندرية

للرجوع للقائمة الرئيسية اكتب 'قائمة'`,
        active: true
    },
    
    // استفسارات عامة
    {
        id: 10,
        keywords: ['عايز استفسر', 'عندي سؤال', 'ممكن اسأل', 'محتاج اعرف', 'عايز اعرف', 'عندكم', 'هل يوجد', 'متوفر', 'التفاصيل', 'ايه المميزات', 'بيشتغل ازاي', 'ينفع ل', 'مناسب ليا', 'الفرق بين', 'ضمان كام', 'الجودة', 'فيه صور', 'ابعت تفاصيل'],
        reply: `📋 للاستفسار عن خدمات النمر للشحن:

لدينا الخدمات التالية:
• شحن داخل وخارج الإسكندرية
• تخزين بضائع
• تغليف
• خدمة VIP توصيل نفس اليوم

للحصول على معلومات محددة:
• اضغط 1 لأسعار داخل الإسكندرية
• اضغط 2 لأسعار خارج الإسكندرية
• اضغط 3 لمدة التوصيل
• اضغط 4 لطرق الدفع
• اضغط 5 للشروط والسياسات
• اضغط 6 للتواصل مع خدمة العملاء

للرجوع للقائمة الرئيسية اكتب 'قائمة'`,
        active: true
    },
    
    // شكر وتأكيد
    {
        id: 11,
        keywords: ['شكرا', 'ممتاز', 'تمام', 'ok', 'شكراً', 'تسلم', 'الله يبارك فيك', 'حلو', 'جميل', 'تم', 'مشكور'],
        reply: `🎉 شكراً لك على تواصلك مع النمر للشحن!

نحن في خدمتك دائماً. إذا احتجت أي مساعدة أخرى، فقط اكتب 'قائمة' للعودة للخدمات المتاحة.

نتمنى لك يوماً سعيداً! 🐯`,
        active: true
    }
];

// ==================== INSTANCES CONFIGURATION ====================
const instances = [
    {
        id: "instance3532",
        token: "yzWzEjmxZpbifuOx6lWafYT3Ng69gaFpJGAdTsVc6N",
        name: "الرقم الأول - النمر للشحن",
        active: true
    },
    {
        id: "instance3537",
        token: "yzWzEjmxZpbifuOx6lWafYT3Ng69gaFpJGAdTsVc6N",
        name: "الرقم الثاني - النمر للشحن",
        active: true
    }
];

// ==================== HELPER FUNCTIONS ====================
function getActiveInstances() {
    return instances.filter(inst => inst.active);
}

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
        
        console.log(`✅ [${instance.name}] Auto-reply sent to ${phone}`);
        return { success: true, data: response.data, instance: instance.name };
    } catch (error) {
        console.error(`❌ [${instance.name}] Auto-reply error:`, error.response?.data || error.message);
        return { success: false, error: error.response?.data || error.message, instance: instance.name };
    }
}

async function sendAutoMessage(phone, message, instanceId = null) {
    let targetInstances = getActiveInstances();
    
    if (instanceId) {
        targetInstances = targetInstances.filter(inst => inst.id === instanceId);
    }
    
    if (targetInstances.length === 0) {
        console.log('⚠️ No active instances found');
        return { success: false, error: 'No active instances' };
    }
    
    const instance = targetInstances[0];
    return await sendMessageViaInstance(instance, phone, message);
}

function getAutoReply(message) {
    if (!message) return null;
    const lowerMsg = message.toLowerCase().trim();
    
    // البحث عن الرد المناسب حسب الأولوية
    for (let rule of autoRules) {
        if (!rule.active) continue;
        
        // التحقق من الكلمات المفتاحية
        for (let keyword of rule.keywords) {
            if (lowerMsg.includes(keyword.toLowerCase())) {
                console.log(`✅ تم العثور على قاعدة: ${rule.id} - كلمة: ${keyword}`);
                return rule.reply;
            }
        }
    }
    
    // إذا لم يتم العثور على قاعدة، نرسل القائمة الرئيسية
    console.log(`⚠️ لا يوجد رد تلقائي للرسالة: ${message}`);
    return companyData.welcomeMessage;
}

async function processIncomingMessage(phone, message, instanceId = null) {
    console.log(`📩 رسالة واردة من ${phone}: ${message}`);
    
    const autoReply = getAutoReply(message);
    
    if (autoReply) {
        console.log(`🤖 رد تلقائي: ${autoReply.substring(0, 100)}...`);
        const result = await sendAutoMessage(phone, autoReply, instanceId);
        return { replied: true, message: autoReply, result };
    }
    
    console.log(`⚠️ لا يوجد رد تلقائي للرسالة: ${message}`);
    return { replied: false };
}

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

function getAllRules() {
    return autoRules;
}

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

// تصدير البيانات الإضافية للاستخدام في الواجهة
function getCompanyData() {
    return companyData;
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
    sendMessageViaInstance,
    getCompanyData,
    companyData
};
