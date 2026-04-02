const axios = require('axios');
const { saveUserState, getUserState, deleteUserState, cleanupExpiredUsers } = require('./firebase-config');

// ==================== COMPANY DATA ====================
const companyData = {
    name: "النمر للشحن - ELNMR",
    services: "شحن – تخزين – تغليف داخل الإسكندرية",
    welcomeMessage: `🐯 أهلاً بيك في شركة النمر للشحن! / Welcome to ELNMR Shipping!

من فضلك اختار الرقم المناسب 👇 / Please choose the appropriate number 👇

1️⃣ أسعار الشحن داخل الإسكندرية / Alexandria shipping prices
2️⃣ أسعار الشحن خارج الإسكندرية / Outside Alexandria shipping prices
3️⃣ مدة التوصيل / Delivery time
4️⃣ طرق الدفع / Payment methods
5️⃣ شروط الشحن / Shipping terms
6️⃣ التحدث مع خدمة العملاء / Contact customer service`,
    
    deliveryTimes: {
        north: "داخل الوجه البحري: خلال 72 ساعة / Nile Delta: within 72 hours",
        south: "وجه قبلي: خلال 5 أيام / Upper Egypt: within 5 days",
        collection: "التحصيل: خلال 24 ساعة / Collection: within 24 hours"
    },
    
    paymentMethods: "كاش - محفظة - إنستاباي - حساب بنكي / Cash - Wallet - Instapay - Bank Transfer",
    
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
        "السعر ممكن يتغير حسب البنزين / Price may change based on fuel cost",
        "الأوردر القابل للكسر = مسؤولية العميل / Fragile items are customer's responsibility",
        "في خدمة VIP توصيل نفس اليوم / VIP same-day delivery service available",
        "يتم إضافة تكلفة بعد 5 كيلو / Extra charge applied beyond 5 km",
        "في تعاقدات للشركات بأسعار خاصة / Corporate contracts with special rates"
    ]
};

// ==================== INSTANCE CONFIGURATION ====================
const INSTANCE_ID = "instance3532";
const INSTANCE = {
    id: INSTANCE_ID,
    token: "yzWzEjmxZpbifuOx6lWafYT3Ng69gaFpJGAdTsVc6N",
    name: "الرقم الأول - النمر للشحن",
    phoneNumber: "201553999935",
    active: true
};

// 🔥 رقم هاتف المسؤول (أنت) - ضروري للكشف عن رسائلك
const ADMIN_PHONE = "201553999935"; // ضع رقم هاتفك هنا

// ==================== CACHE للـ timeouts (في الذاكرة فقط) ====================
const timeouts = {};
const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 دقيقة

async function setAutoTimeout(phone) {
    if (timeouts[phone]) {
        clearTimeout(timeouts[phone]);
        delete timeouts[phone];
    }
    
    timeouts[phone] = setTimeout(async () => {
        const currentMode = await getUserState(INSTANCE_ID, phone);
        if (currentMode === "human") {
            await deleteUserState(INSTANCE_ID, phone);
            delete timeouts[phone];
            console.log(`🤖 Auto timeout: User ${phone} switched back to BOT mode after 30 minutes`);
        }
    }, TIMEOUT_DURATION);
}

// ==================== AUTO REPLY RULES ====================
let autoRules = [
    {
        id: 0,
        keywords: ['قائمة', 'menu', 'الرئيسية', 'start', 'بداية', 'مرحباً', 'مرحبا', 'اهلا', 'أهلاً', 'السلام عليكم', 'وعليكم السلام', 'صباح الخير', 'مساء الخير', 'هاي', 'hello', 'hi', 'hey', 'ازيك', 'عامل ايه', 'عاملين ايه', 'اخباركم', 'كيفك', 'how are you'],
        reply: companyData.welcomeMessage,
        active: true
    },
    {
        id: 1,
        keywords: ['1', '١', 'داخل الاسكندرية', 'داخل الإسكندرية', 'اسكندرية', 'الإسكندرية', 'اسعار اسكندرية', 'اسعار داخل', 'سعر', 'الثمن', 'كم سعر', 'بكام', 'price', 'alexandria', 'inside alexandria', 'cost', 'how much'],
        reply: `📍 أسعار الشحن داخل الإسكندرية / Alexandria Shipping Prices:

💰 60 جنيه / EGP:
${companyData.shippingPrices.alexandria["60 جنيه"].join(' - ')}

💰 65 جنيه / EGP:
${companyData.shippingPrices.alexandria["65 جنيه"].join(' - ')}

💰 70 جنيه / EGP:
${companyData.shippingPrices.alexandria["70 جنيه"].join(' - ')}

💰 75 جنيه / EGP:
${companyData.shippingPrices.alexandria["75 جنيه"].join(' - ')}

💰 90 جنيه / EGP:
${companyData.shippingPrices.alexandria["90 جنيه"].join(' - ')}

للرجوع للقائمة الرئيسية اكتب 'قائمة' / Type 'menu' to return to main menu`,
        active: true
    },
    {
        id: 2,
        keywords: ['2', '٢', 'خارج الاسكندرية', 'خارج الإسكندرية', 'خارج', 'اسعار خارج', 'القاهرة', 'بورسعيد', 'الإسماعيلية', 'الفيوم', 'قنا', 'سوهاج', 'outside alexandria', 'cairo', 'portsaid', 'ismailia', 'outside', 'other cities'],
        reply: `📍 أسعار الشحن خارج الإسكندرية / Outside Alexandria Shipping Prices:

💰 100 جنيه / EGP:
${companyData.shippingPrices.outsideAlexandria["100 جنيه"].join(' - ')}

💰 120 جنيه / EGP:
${companyData.shippingPrices.outsideAlexandria["120 جنيه"].join(' - ')}

للرجوع للقائمة الرئيسية اكتب 'قائمة' / Type 'menu' to return to main menu`,
        active: true
    },
    {
        id: 3,
        keywords: ['3', '٣', 'مدة التوصيل', 'التوصيل', 'المدة', 'وقت', 'كم يوم', 'مدة الشحن', 'المدة كام', 'توصيل', 'الشحن', 'delivery time', 'delivery duration', 'how long', 'shipping time', 'when', 'time', 'duration', 'delivery'],
        reply: `⏱️ مدة التوصيل في النمر للشحن / Delivery Times:

• ${companyData.deliveryTimes.north}
• ${companyData.deliveryTimes.south}
• ${companyData.deliveryTimes.collection}

للرجوع للقائمة الرئيسية اكتب 'قائمة' / Type 'menu' to return to main menu`,
        active: true
    },
    {
        id: 4,
        keywords: ['4', '٤', 'طرق الدفع', 'الدفع', 'كيف ادفع', 'ادفع ازاي', 'طرق السداد', 'السداد', 'payment', 'payment methods', 'how to pay', 'pay', 'cash', 'bank transfer', 'instapay', 'vodafone cash', 'wallet'],
        reply: `💰 طرق الدفع في النمر للشحن / Payment Methods:

• كاش / Cash 💵
• محفظة / Wallet 📱 (فودافون كاش - انستاباي / Vodafone Cash - Instapay)
• إنستاباي / Instapay 🏦
• تحويل بنكي / Bank Transfer 💳

للرجوع للقائمة الرئيسية اكتب 'قائمة' / Type 'menu' to return to main menu`,
        active: true
    },
    {
        id: 5,
        keywords: ['5', '٥', 'شروط', 'شروط الشحن', 'سياسة', 'قوانين', 'ممنوع', 'مسموح', 'ضمان', 'terms', 'conditions', 'policy', 'rules', 'shipping terms', 'warranty', 'fragile', 'insurance'],
        reply: `📋 شروط الشحن في النمر للشحن / Shipping Terms:

${companyData.terms.map((t, i) => `${i+1}. ${t}`).join('\n')}

للرجوع للقائمة الرئيسية اكتب 'قائمة' / Type 'menu' to return to main menu`,
        active: true
    },
    {
        id: 6,
        keywords: ['6', '٦', 'خدمة العملاء', 'خدمه العملاء', 'دعم', 'تكلم مع موظف', 'موظف', 'تحكم', 'شكوى', 'مشكلة', 'اتصل بمسؤول', 'مسؤول', 'customer service', 'support', 'agent', 'human', 'complaint', 'problem', 'talk to someone', 'representative', 'issue'],
        reply: "👤 تم تحويل محادثتك إلى خدمة العملاء في النمر للشحن. سيتم الرد عليك يدوياً في أقرب وقت. شكراً لصبرك.\n\nYour conversation has been transferred to customer service. You will receive a manual reply shortly. Thank you for your patience.",
        active: true
    },
    {
        id: 7,
        keywords: ['طلب شحن', 'شحنة', 'طلب', 'اوردر', 'اطلب', 'شراء', 'عايز أطلب', 'عايز اشتري', 'احجز', 'اريد شحن', 'اريد طلب', 'new order', 'place order', 'order', 'shipping request', 'send package', 'i want to ship', 'book', 'request shipping', 'create order'],
        reply: `🛍️ لطلب شحنة جديدة في النمر للشحن، يرجى إرسال / To place a new order, please send:

1️⃣ اسمك الكامل / Full name
2️⃣ العنوان بالتفصيل / Detailed address
3️⃣ نوع البضاعة / Package type (عادي/fragile)
4️⃣ الوزن التقريبي / Approximate weight (kg)

سيتم التواصل معك لتأكيد السعر وموعد الاستلام.
We will contact you to confirm price and pickup time.

للرجوع للقائمة الرئيسية اكتب 'قائمة' / Type 'menu' to return to main menu`,
        active: true
    },
    {
        id: 8,
        keywords: ['vip', 'VIP', 'نفس اليوم', 'توصيل سريع', 'توصيل فوري', 'سريع', 'عاجل', 'خدمة vip', 'اسرع توصيل', 'same day', 'express', 'urgent', 'fast delivery', 'quick', 'priority', 'rapid'],
        reply: `🚚 خدمة VIP توصيل نفس اليوم في النمر للشحن / VIP Same Day Delivery:

• متاحة داخل الإسكندرية فقط / Available only in Alexandria
• السعر يبدأ من 150 جنيه حسب المنطقة والوزن / Starting from 150 EGP depending on area and weight
• للطلب، تواصل مع خدمة العملاء (اضغط 6) / To order, contact customer service (press 6)

للرجوع للقائمة الرئيسية اكتب 'قائمة' / Type 'menu' to return to main menu`,
        active: true
    },
    {
        id: 9,
        keywords: ['شكرا', 'ممتاز', 'تمام', 'شكراً', 'تسلم', 'الله يبارك فيك', 'حلو', 'جميل', 'تم', 'مشكور', 'thank', 'thanks', 'great', 'excellent', 'good', 'perfect', 'ok', 'awesome', 'nice', 'done'],
        reply: `🎉 شكراً لك على تواصلك مع النمر للشحن! / Thank you for contacting ELNMR Shipping!

نحن في خدمتك دائماً. إذا احتجت أي مساعدة أخرى، فقط اكتب 'قائمة' للعودة للخدمات المتاحة.
We are always at your service. If you need any further assistance, just type 'menu' to return to available services.

نتمنى لك يوماً سعيداً! 🐯 / Have a great day! 🐯`,
        active: true
    },
    {
        id: 10,
        keywords: ['عايز استفسر', 'عندي سؤال', 'ممكن اسأل', 'محتاج اعرف', 'عايز اعرف', 'عندكم', 'هل يوجد', 'متوفر', 'التفاصيل', 'ايه المميزات', 'بيشتغل ازاي', 'inquiry', 'question', 'information', 'details', 'what is', 'how to', 'tell me', 'i need to know', 'about', 'services'],
        reply: `📋 للاستفسار عن خدمات النمر للشحن / For inquiries about ELNMR Shipping services:

لدينا الخدمات التالية / We offer:
• شحن داخل وخارج الإسكندرية / Shipping inside and outside Alexandria
• تخزين بضائع / Storage
• تغليف / Packaging
• خدمة VIP توصيل نفس اليوم / VIP Same Day Delivery

للحصول على معلومات محددة / For specific information:
• اضغط 1 لأسعار داخل الإسكندرية / Press 1 for Alexandria prices
• اضغط 2 لأسعار خارج الإسكندرية / Press 2 for outside Alexandria prices
• اضغط 3 لمدة التوصيل / Press 3 for delivery time
• اضغط 4 لطرق الدفع / Press 4 for payment methods
• اضغط 5 للشروط والسياسات / Press 5 for terms and policies
• اضغط 6 للتواصل مع خدمة العملاء / Press 6 to contact customer service

للرجوع للقائمة الرئيسية اكتب 'قائمة' / Type 'menu' to return to main menu`,
        active: true
    }
];

// ==================== HELPER FUNCTIONS ====================
function findAutoReply(message) {
    if (!message) return null;
    const lowerMsg = message.toLowerCase().trim();
    
    console.log(`🔍 [${INSTANCE.name}] Searching for reply to: "${lowerMsg}"`);
    
    const numberMap = {
        '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6,
        '١': 1, '٢': 2, '٣': 3, '٤': 4, '٥': 5, '٦': 6
    };
    
    if (numberMap[lowerMsg] !== undefined) {
        const number = numberMap[lowerMsg];
        for (let rule of autoRules) {
            if (!rule.active) continue;
            for (let keyword of rule.keywords) {
                if (keyword === number.toString() || 
                    (keyword === '1' && number === 1) ||
                    (keyword === '2' && number === 2) ||
                    (keyword === '3' && number === 3) ||
                    (keyword === '4' && number === 4) ||
                    (keyword === '5' && number === 5) ||
                    (keyword === '6' && number === 6)) {
                    console.log(`✅ [${INSTANCE.name}] Number match: ${number}`);
                    return rule.reply;
                }
            }
        }
    }
    
    for (let rule of autoRules) {
        if (!rule.active) continue;
        for (let keyword of rule.keywords) {
            const keywordLower = keyword.toLowerCase();
            if (lowerMsg === keywordLower || lowerMsg.includes(keywordLower)) {
                console.log(`✅ [${INSTANCE.name}] Match found: ${keyword}`);
                return rule.reply;
            }
        }
    }
    
    return null;
}

async function sendWhatsAppMessage(chat_id, message) {
    try {
        console.log(`📤 [${INSTANCE.name}] Sending to: ${chat_id}`);
        console.log(`📤 Message preview: ${message.substring(0, 100)}...`);
        
        const response = await axios.post(
            `https://api.wapilot.net/api/v2/${INSTANCE.id}/send-message`,
            { chat_id, text: message },
            { headers: { "token": INSTANCE.token, "Content-Type": "application/json" } }
        );
        
        console.log(`✅ [${INSTANCE.name}] Sent successfully`);
        return { success: true, data: response.data };
    } catch (error) {
        console.error(`❌ [${INSTANCE.name}] Send failed:`, error.response?.data || error.message);
        return { success: false, error: error.response?.data || error.message };
    }
}

// تنظيف عند بدء التشغيل
async function initialize() {
    console.log(`🚀 Initializing ${INSTANCE.name} with Firebase...`);
    await cleanupExpiredUsers(INSTANCE_ID);
}

initialize();

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
            instance: INSTANCE.name,
            instance_id: INSTANCE.id,
            phone: INSTANCE.phoneNumber,
            storage: 'Firebase',
            admin_phone: ADMIN_PHONE,
            message: 'Webhook is working with Firebase!',
            timestamp: new Date().toISOString()
        });
    }
    
    console.log(`📩 [${INSTANCE.name}] Webhook received:`, new Date().toISOString());
    console.log(`🔍 Full webhook data:`, JSON.stringify(req.body, null, 2));
    
    const data = req.body;
    let rawChatId = null;
    let message = null;
    let isFromMe = false;
    
    if (data.payload) {
        rawChatId = data.payload.from;
        message = data.payload.body;
        
        // 🔥🔥🔥 الكشف عن رسائلك أنت (المسؤول) 🔥🔥🔥
        // الطريقة 1: من خلال fromMe
        isFromMe = data.payload.fromMe || false;
        
        // الطريقة 2: لو الرقم اللي باعت هو رقمك أنت
        if (!isFromMe && rawChatId) {
            let senderPhone = rawChatId.toString();
            senderPhone = senderPhone.replace('@c.us', '');
            senderPhone = senderPhone.replace('@lid', '');
            senderPhone = senderPhone.replace('+', '');
            senderPhone = senderPhone.replace(/[^0-9]/g, '');
            if (senderPhone.startsWith('0')) senderPhone = senderPhone.substring(1);
            
            if (senderPhone === ADMIN_PHONE) {
                isFromMe = true;
                console.log(`✅ [${INSTANCE.name}] Detected admin message by phone number: ${senderPhone}`);
            }
        }
        
        // الطريقة 3: لو في to والرقم بتاعي
        if (!isFromMe && data.payload.to) {
            let toPhone = data.payload.to.toString();
            toPhone = toPhone.replace('@c.us', '').replace('@lid', '').replace('+', '').replace(/[^0-9]/g, '');
            if (toPhone.startsWith('0')) toPhone = toPhone.substring(1);
            
            if (toPhone === ADMIN_PHONE) {
                isFromMe = true;
                console.log(`✅ [${INSTANCE.name}] Detected admin message by 'to' field: ${toPhone}`);
            }
        }
    }
    
    if (!rawChatId && data.from) {
        rawChatId = data.from;
        message = data.body || data.text;
        isFromMe = data.fromMe || false;
    }
    
    if (!rawChatId || !message) {
        console.log(`⚠️ [${INSTANCE.name}] Missing chat_id or message`);
        return res.status(200).json({ received: true, error: 'Missing data' });
    }
    
    console.log(`📱 [${INSTANCE.name}] From: ${rawChatId}`);
    console.log(`💬 [${INSTANCE.name}] Message: ${message}`);
    console.log(`👤 [${INSTANCE.name}] Is from me (admin): ${isFromMe}`);
    
    // 🔥 الأهم: استخدم الرقم الأصلي كما هو من webhook (مع @lid أو @c.us)
    let chatId = rawChatId;
    if (!chatId.includes('@')) {
        chatId = `${chatId}@c.us`;
    }
    
    // استخراج رقم نظيف للتخزين في Firebase
    let cleanNumber = rawChatId.toString();
    cleanNumber = cleanNumber.replace('@c.us', '');
    cleanNumber = cleanNumber.replace('@lid', '');
    cleanNumber = cleanNumber.replace('+', '');
    cleanNumber = cleanNumber.replace(/[^0-9]/g, '');
    if (cleanNumber.startsWith('0')) cleanNumber = cleanNumber.substring(1);
    
    // 🔥🔥🔥 HUMAN MODE SYSTEM WITH FIREBASE 🔥🔥🔥
    
    // 1. إذا أنا اللي رديت على العميل (أنا المسؤول)
    if (isFromMe) {
        // 🔥 هذا هو المفتاح - عندما ترد أنت، البوت يتوقف لمدة 30 دقيقة
        await saveUserState(INSTANCE_ID, cleanNumber, "human");
        await setAutoTimeout(cleanNumber);
        console.log(`👨‍💼 [${INSTANCE.name}] 🛑 BOT STOPPED for user ${cleanNumber} for 30 minutes (admin replied)`);
        return res.status(200).json({ success: true, mode: "human", storage: "Firebase", message: "Bot disabled for 30 minutes" });
    }
    
    // استرجاع حالة العميل من Firebase
    const currentMode = await getUserState(INSTANCE_ID, cleanNumber);
    
    // 2. إذا العميل في وضع human (البوت يسكت خالص)
    if (currentMode === "human") {
        console.log(`🤫 [${INSTANCE.name}] Human mode active for ${cleanNumber}, bot silent (waiting for admin)`);
        return res.status(200).json({ success: true, mode: "human", silent: true });
    }
    
    // 3. طلب خدمة العملاء (الرقم 6) - يوقف البوت أيضاً
    const isCustomerServiceRequest = (
        message.trim() === '6' || 
        message.trim() === '٦' ||
        message.toLowerCase().includes('خدمة العملاء') ||
        message.toLowerCase().includes('خدمه العملاء') ||
        message.toLowerCase().includes('customer service') ||
        message.toLowerCase().includes('support') ||
        message.toLowerCase().includes('agent') ||
        message.toLowerCase().includes('human') ||
        message.toLowerCase().includes('موظف')
    );
    
    if (isCustomerServiceRequest) {
        await saveUserState(INSTANCE_ID, cleanNumber, "human");
        await setAutoTimeout(cleanNumber);
        console.log(`👨‍💼 [${INSTANCE.name}] User ${cleanNumber} requested human support - BOT STOPPED`);
        
        const autoReply = findAutoReply(message);
        if (autoReply) {
            await sendWhatsAppMessage(chatId, autoReply);
        }
        return res.status(200).json({ success: true, mode: "human" });
    }
    
    // 4. طلب العودة للبوت (قائمة أو menu)
    const isMenuRequest = message.toLowerCase().includes('menu') || message.includes('قائمة');
    if (isMenuRequest && currentMode === "human") {
        if (timeouts[cleanNumber]) {
            clearTimeout(timeouts[cleanNumber]);
            delete timeouts[cleanNumber];
        }
        await deleteUserState(INSTANCE_ID, cleanNumber);
        console.log(`🤖 [${INSTANCE.name}] User ${cleanNumber} -> BOT REACTIVATED (requested menu)`);
    }
    
    // البحث عن رد تلقائي
    const autoReply = findAutoReply(message);
    
    if (autoReply) {
        console.log(`🤖 [${INSTANCE.name}] Sending auto-reply...`);
        const result = await sendWhatsAppMessage(chatId, autoReply);
        
        return res.status(200).json({ 
            success: result.success,
            replied: true,
            from_instance: INSTANCE.name,
            storage: "Firebase",
            result: result
        });
    } else {
        console.log(`⚠️ [${INSTANCE.name}] No auto-reply found for: "${message}"`);
        return res.status(200).json({ 
            success: true,
            replied: false,
            reason: 'No matching rule found'
        });
    }
};
