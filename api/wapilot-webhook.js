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
        return { success: true, data: response.data };
    } catch (error) {
        console.error(`❌ [${instance.name}] Send failed:`, error.response?.data || error.message);
        return { success: false, error: error.response?.data || error.message };
    }
}

function findAutoReply(message) {
    if (!message) return null;
    const lowerMsg = message.toLowerCase().trim();
    
    for (let rule of autoRules) {
        if (!rule.active) continue;
        for (let keyword of rule.keywords) {
            if (lowerMsg.includes(keyword.toLowerCase())) {
                console.log(`✅ Found rule: ${rule.id} - keyword: ${keyword}`);
                return rule.reply;
            }
        }
    }
    
    console.log(`⚠️ No auto-reply found for: ${message}`);
    return null;
}

// ==================== WEBHOOK HANDLER ====================
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
            company: companyData.name,
            instances: instances.map(i => ({ id: i.id, name: i.name, active: i.active })),
            rulesCount: autoRules.filter(r => r.active).length,
            timestamp: new Date().toISOString() 
        });
    }
    
    console.log('📩 Webhook received:', new Date().toISOString());
    console.log('🔍 Full webhook data:', JSON.stringify(req.body, null, 2));
    
    const data = req.body;
    let rawPhone = null;
    let message = null;
    let incomingInstanceId = null;
    
    // استخراج البيانات حسب تنسيق webhook
    if (data.event === 'message' && data.payload) {
        rawPhone = data.payload.from;
        message = data.payload.body;
        incomingInstanceId = data.instance_id || data.webhook_id;
    }
    
    // محاولة تنسيقات أخرى
    if (!rawPhone && data.from) {
        rawPhone = data.from;
        message = data.body || data.text;
        incomingInstanceId = data.instance_id;
    }
    
    if (!rawPhone || !message) {
        console.log('⚠️ Missing phone or message');
        return res.status(200).json({ received: true, error: 'Missing data', raw: data });
    }
    
    console.log(`📱 Raw phone: ${rawPhone}`);
    console.log(`💬 Message: ${message}`);
    console.log(`🔌 Incoming instance ID: ${incomingInstanceId || 'not provided'}`);
    
    // تحديد الـ instance التي سترد
    let targetInstance = null;
    
    if (incomingInstanceId) {
        targetInstance = instances.find(inst => inst.id === incomingInstanceId);
        if (targetInstance && targetInstance.active) {
            console.log(`✅ Using same instance that received the message: ${targetInstance.name}`);
        } else if (targetInstance && !targetInstance.active) {
            console.log(`⚠️ Instance ${incomingInstanceId} is not active`);
            targetInstance = null;
        } else {
            console.log(`⚠️ Instance ID ${incomingInstanceId} not found in config`);
        }
    }
    
    if (!targetInstance) {
        targetInstance = instances.find(inst => inst.active);
        console.log(`⚠️ No matching active instance found, using fallback: ${targetInstance?.name}`);
    }
    
    if (!targetInstance) {
        console.log('⚠️ No active instance available');
        return res.status(200).json({ received: true, error: 'No active instance' });
    }
    
    // التحقق من LID
    if (rawPhone.includes('@lid')) {
        console.log(`⚠️ Cannot reply to LID: ${rawPhone}`);
        return res.status(200).json({
            received: true,
            note: 'Cannot reply to LID, need real phone number',
            rawPhone: rawPhone,
            instance: targetInstance.name
        });
    }
    
    // تنظيف رقم الهاتف
    let cleanPhone = rawPhone.replace('@c.us', '').replace('+', '').replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);
    
    console.log(`📱 Clean phone: ${cleanPhone}`);
    console.log(`🤖 WILL REPLY FROM: ${targetInstance.name} (${targetInstance.id})`);
    console.log(`🎯 Original message came from instance: ${incomingInstanceId || 'unknown'}`);
    
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
        console.log(`⚠️ Invalid phone number length: ${cleanPhone.length}`);
        return res.status(200).json({
            received: true,
            error: 'Invalid phone number',
            phone: cleanPhone,
            instance: targetInstance.name
        });
    }
    
    // البحث عن رد تلقائي مناسب
    const autoReply = findAutoReply(message);
    
    if (autoReply) {
        // ✅ يوجد رد تلقائي مناسب، نرسله
        console.log(`🤖 Auto-reply found for message: "${message}" - Sending response...`);
        const result = await sendWhatsAppMessage(targetInstance, cleanPhone, autoReply);
        
        return res.status(200).json({ 
            success: result.success,
            replied: true,
            reply: autoReply.substring(0, 100) + (autoReply.length > 100 ? '...' : ''),
            from_instance: targetInstance.name,
            original_instance: incomingInstanceId || 'unknown',
            phone: cleanPhone,
            result: result
        });
    } else {
        // ❌ لا يوجد رد تلقائي مناسب، لا نرسل شيئاً
        console.log(`⚠️ No matching auto-reply found for message: "${message}" - No response will be sent`);
        return res.status(200).json({ 
            success: true,
            replied: false,
            reason: 'No matching rule found',
            message: message,
            from_instance: targetInstance.name,
            original_instance: incomingInstanceId || 'unknown'
        });
    }
};
