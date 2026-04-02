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

// ==================== USER STATE MANAGEMENT ====================
const timeouts = {};

// Instance Configuration
const INSTANCE_ID = "instance3532";
const INSTANCE = {
    id: INSTANCE_ID,
    token: "yzWzEjmxZpbifuOx6lWafYT3Ng69gaFpJGAdTsVc6N",
    name: "الرقم الأول - النمر للشحن",
    active: true
};

const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 دقيقة

async function setAutoTimeout(phone) {
    if (timeouts[phone]) {
        clearTimeout(timeouts[phone]);
        delete timeouts[phone];
    }
    
    timeouts[phone] = setTimeout(async () => {
        const userState = await getUserState(INSTANCE_ID, phone);
        if (userState && userState.mode === "human") {
            await deleteUserState(INSTANCE_ID, phone);
            delete timeouts[phone];
            console.log(`🤖 Auto timeout: User ${phone} switched back to BOT mode after 30 minutes`);
        }
    }, TIMEOUT_DURATION);
}

async function updateUserTimestamp(phone) {
    const userState = await getUserState(INSTANCE_ID, phone);
    if (userState && userState.mode === "human") {
        await saveUserState(INSTANCE_ID, phone, {
            mode: "human",
            timestamp: Date.now()
        });
        await setAutoTimeout(phone);
    }
}

async function initialize() {
    console.log(`🚀 Initializing ${INSTANCE.name} with Firebase...`);
    await cleanupExpiredUsers(INSTANCE_ID);
}

initialize();

// ==================== HELPER FUNCTIONS ====================

// 🔥 دالة لاستخراج رقم الهاتف الحقيقي من LID
function extractRealPhoneNumber(rawPhone, payload) {
    let cleanPhone = rawPhone;
    
    // إذا كان الرقم من نوع LID
    if (rawPhone && rawPhone.includes('@lid')) {
        console.log(`⚠️ Received LID: ${rawPhone}`);
        
        // محاولة استخراج الرقم من payload.participant
        if (payload && payload.participant && !payload.participant.includes('@lid')) {
            cleanPhone = payload.participant;
            console.log(`✅ Found participant: ${cleanPhone}`);
        }
        // محاولة استخراج الرقم من payload.author
        else if (payload && payload.author && !payload.author.includes('@lid')) {
            cleanPhone = payload.author;
            console.log(`✅ Found author: ${cleanPhone}`);
        }
        // محاولة استخراج الرقم من payload.to
        else if (payload && payload.to && !payload.to.includes('@lid')) {
            cleanPhone = payload.to;
            console.log(`✅ Found to: ${cleanPhone}`);
        }
        else {
            // إذا كان الرقم يبدأ بـ 222 أو 333 (أرقام تجريبية)
            const lidMatch = rawPhone.match(/(\d+)@lid/);
            if (lidMatch) {
                const lidNumber = lidMatch[1];
                console.log(`⚠️ Cannot extract real phone from LID: ${lidNumber}`);
                console.log(`💡 This appears to be a test/simulated number`);
                return null;
            }
        }
    }
    
    return cleanPhone;
}

// 🔥 دالة للتحقق من صحة الرقم
function isValidPhoneNumber(phone) {
    if (!phone) return false;
    if (phone.includes('@lid')) return false;
    
    let cleanPhone = phone.toString();
    cleanPhone = cleanPhone.replace('@c.us', '');
    cleanPhone = cleanPhone.replace('+', '');
    cleanPhone = cleanPhone.replace(/[^0-9]/g, '');
    
    // التحقق من أن الرقم حقيقي (يبدأ بـ 2010, 2011, 2012, 2015, 2018, 2020)
    const validPrefixes = ['2010', '2011', '2012', '2015', '2018', '2020', '2090', '210'];
    const isValid = validPrefixes.some(prefix => cleanPhone.startsWith(prefix));
    
    if (!isValid) {
        console.log(`⚠️ Invalid phone number: ${cleanPhone} (not a real Egyptian number)`);
    }
    
    return isValid && cleanPhone.length >= 10;
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
        keywords: ['1', '١', 'داخل الاسكندرية', 'داخل الإسكندرية', 'اسكندرية', 'الإسكندرية', 'اسعار اسكندرية', 'اسعار داخل', 'سعر', 'price', 'alexandria'],
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
        keywords: ['2', '٢', 'خارج الاسكندرية', 'خارج الإسكندرية', 'خارج', 'اسعار خارج', 'القاهرة', 'بورسعيد', 'الإسماعيلية', 'الفيوم', 'قنا', 'سوهاج', 'outside alexandria', 'cairo'],
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
        keywords: ['عايز استفسر', 'عندي سؤال', 'ممكن اسأل', 'محتاج اعرف', 'عايز اعرف', 'عندكم', 'هل يوجد', 'متوفر', 'التفاصيل', 'ايه المميزات', 'بيشتغل ازاي', 'ينفع ل', 'مناسب ليا', 'الفرق بين', 'ضمان كام', 'الجودة', 'فيه صور', 'ابعت تفاصيل', 'inquiry', 'question', 'information', 'details', 'what is', 'how to', 'tell me', 'i need to know', 'about', 'services'],
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

function findAutoReply(message) {
    if (!message) return null;
    const lowerMsg = message.toLowerCase().trim();
    
    for (let rule of autoRules) {
        if (!rule.active) continue;
        for (let keyword of rule.keywords) {
            if (lowerMsg === keyword.toLowerCase() || lowerMsg.includes(keyword.toLowerCase())) {
                console.log(`✅ Found rule: ${rule.id} - Keyword: ${keyword}`);
                return rule.reply;
            }
        }
    }
    return null;
}

async function sendWhatsAppMessage(phone, message) {
    try {
        let cleanPhone = phone.toString();
        cleanPhone = cleanPhone.replace('@c.us', '');
        cleanPhone = cleanPhone.replace('@lid', '');
        cleanPhone = cleanPhone.replace('+', '');
        cleanPhone = cleanPhone.replace(/[^0-9]/g, '');
        if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);
        
        const chat_id = `${cleanPhone}@c.us`;
        console.log(`📤 [${INSTANCE.name}] Sending to: ${chat_id}`);
        console.log(`📤 Message: ${message.substring(0, 100)}...`);
        
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

// ==================== WEBHOOK HANDLER ====================
module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    
    if (req.method === 'GET') {
        return res.status(200).json({ 
            status: 'active', 
            instance: INSTANCE.name,
            instance_id: INSTANCE.id,
            storage: 'Firebase',
            timestamp: new Date().toISOString() 
        });
    }
    
    console.log('📩 Webhook received for instance 1:', new Date().toISOString());
    console.log('📦 Raw body:', JSON.stringify(req.body, null, 2));
    
    const data = req.body;
    let rawPhone = null;
    let message = null;
    let isFromMe = false;
    
    if (data.event === 'message' && data.payload) {
        rawPhone = data.payload.from;
        message = data.payload.body;
        isFromMe = data.payload.fromMe || false;
        
        // 🔥 محاولة استخراج رقم حقيقي من الـ payload
        const extractedPhone = extractRealPhoneNumber(rawPhone, data.payload);
        if (extractedPhone && extractedPhone !== rawPhone) {
            rawPhone = extractedPhone;
        }
    }
    
    if (!rawPhone || !message) {
        console.log('⚠️ Missing phone or message');
        return res.status(200).json({ 
            received: true, 
            error: 'Missing phone or message',
            receivedData: data
        });
    }
    
    // 🔥 التحقق من صحة الرقم قبل المعالجة
    if (!isValidPhoneNumber(rawPhone)) {
        console.log(`❌ Cannot process: Invalid phone number ${rawPhone}`);
        console.log(`💡 This is likely a test/simulated number from Wapilot`);
        return res.status(200).json({ 
            success: false, 
            reason: "Invalid phone number (LID or test number)",
            received: rawPhone
        });
    }
    
    let cleanPhone = rawPhone.toString();
    cleanPhone = cleanPhone.replace('@c.us', '');
    cleanPhone = cleanPhone.replace('+', '');
    cleanPhone = cleanPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);
    
    console.log(`📱 Clean phone: ${cleanPhone}`);
    console.log(`💬 Message: "${message}"`);
    console.log(`👤 Is from me: ${isFromMe}`);
    
    // 🔥🔥🔥 MANUAL OVERRIDE SYSTEM WITH FIREBASE 🔥🔥🔥
    
    if (isFromMe) {
        await saveUserState(INSTANCE_ID, cleanPhone, {
            mode: "human",
            timestamp: Date.now()
        });
        await setAutoTimeout(cleanPhone);
        console.log(`👨‍💼 [${INSTANCE.name}] User ${cleanPhone} switched to HUMAN mode (I replied)`);
        return res.status(200).json({ success: true, mode: "human" });
    }
    
    const userState = await getUserState(INSTANCE_ID, cleanPhone);
    
    if (userState && userState.mode === "human") {
        await updateUserTimestamp(cleanPhone);
        console.log(`🤫 [${INSTANCE.name}] Human mode active for ${cleanPhone}, bot silent`);
        return res.status(200).json({ success: true, mode: "human", silent: true });
    }
    
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
        await saveUserState(INSTANCE_ID, cleanPhone, {
            mode: "human",
            timestamp: Date.now()
        });
        await setAutoTimeout(cleanPhone);
        console.log(`👨‍💼 [${INSTANCE.name}] User ${cleanPhone} switched to HUMAN mode (requested via 6)`);
        
        const autoReply = findAutoReply(message);
        if (autoReply) {
            await sendWhatsAppMessage(cleanPhone, autoReply);
        }
        return res.status(200).json({ success: true, mode: "human" });
    }
    
    const isMenuRequest = message.toLowerCase().includes('menu') || message.includes('قائمة');
    if (isMenuRequest && userState && userState.mode === "human") {
        if (timeouts[cleanPhone]) {
            clearTimeout(timeouts[cleanPhone]);
            delete timeouts[cleanPhone];
        }
        await deleteUserState(INSTANCE_ID, cleanPhone);
        console.log(`🤖 [${INSTANCE.name}] User ${cleanPhone} switched back to BOT mode (requested menu)`);
    }
    
    const autoReply = findAutoReply(message);
    
    if (autoReply) {
        console.log(`🤖 [${INSTANCE.name}] Auto-reply found, sending...`);
        const result = await sendWhatsAppMessage(cleanPhone, autoReply);
        return res.status(200).json({ success: result.success, replied: true });
    } else {
        console.log(`⚠️ No auto-reply found for: "${message}"`);
        return res.status(200).json({ success: true, replied: false });
    }
};
