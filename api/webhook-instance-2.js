const axios = require('axios');

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
// 3 حالات لكل عميل:
// 🤖 "bot" - البوت يرد تلقائياً
// 👨‍💼 "human" - البوت ساكت، أنت ترد
// ⏳ "pending" - مستني رد منك، البوت يرد بشكل محدود
const userState = {};

// Instance Configuration
const INSTANCE = {
    id: "instance3537",
    token: "yzWzEjmxZpbifuOx6lWafYT3Ng69gaFpJGAdTsVc6N",
    name: "الرقم الثاني - النمر للشحن",
    active: true
};

// ==================== AUTO REPLY RULES (نفس القواعد) ====================
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
        keywords: ['3', '٣', 'مدة التوصيل', 'التوصيل', 'المدة', 'وقت', 'كم يوم', 'delivery time', 'how long'],
        reply: `⏱️ مدة التوصيل في النمر للشحن / Delivery Times:

• ${companyData.deliveryTimes.north}
• ${companyData.deliveryTimes.south}
• ${companyData.deliveryTimes.collection}

للرجوع للقائمة الرئيسية اكتب 'قائمة' / Type 'menu' to return to main menu`,
        active: true
    },
    {
        id: 4,
        keywords: ['4', '٤', 'طرق الدفع', 'الدفع', 'payment', 'how to pay', 'cash'],
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
        keywords: ['5', '٥', 'شروط', 'شروط الشحن', 'سياسة', 'terms', 'conditions'],
        reply: `📋 شروط الشحن في النمر للشحن / Shipping Terms:

${companyData.terms.map((t, i) => `${i+1}. ${t}`).join('\n')}

للرجوع للقائمة الرئيسية اكتب 'قائمة' / Type 'menu' to return to main menu`,
        active: true
    },
    {
        id: 6,
        keywords: ['6', '٦', 'خدمة العملاء', 'خدمه العملاء', 'دعم', 'support', 'customer service', 'agent', 'human', 'موظف'],
        reply: "👤 تم تحويل محادثتك إلى خدمة العملاء في النمر للشحن. سيتم الرد عليك يدوياً في أقرب وقت. شكراً لصبرك.\n\nYour conversation has been transferred to customer service. You will receive a manual reply shortly. Thank you for your patience.",
        active: true
    },
    {
        id: 7,
        keywords: ['طلب شحن', 'شحنة', 'طلب', 'اوردر', 'اطلب', 'order', 'new order'],
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
        keywords: ['vip', 'VIP', 'نفس اليوم', 'توصيل سريع', 'express', 'same day'],
        reply: `🚚 خدمة VIP توصيل نفس اليوم في النمر للشحن / VIP Same Day Delivery:

• متاحة داخل الإسكندرية فقط / Available only in Alexandria
• السعر يبدأ من 150 جنيه حسب المنطقة والوزن / Starting from 150 EGP depending on area and weight
• للطلب، تواصل مع خدمة العملاء (اضغط 6) / To order, contact customer service (press 6)

للرجوع للقائمة الرئيسية اكتب 'قائمة' / Type 'menu' to return to main menu`,
        active: true
    },
    {
        id: 9,
        keywords: ['شكرا', 'ممتاز', 'تمام', 'شكراً', 'thank', 'thanks', 'great'],
        reply: `🎉 شكراً لك على تواصلك مع النمر للشحن! / Thank you for contacting ELNMR Shipping!

نحن في خدمتك دائماً. إذا احتجت أي مساعدة أخرى، فقط اكتب 'قائمة' للعودة للخدمات المتاحة.
We are always at your service. If you need any further assistance, just type 'menu' to return to available services.

نتمنى لك يوماً سعيداً! 🐯 / Have a great day! 🐯`,
        active: true
    }
];

// ==================== HELPER FUNCTIONS ====================
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
            activeUsers: Object.keys(userState).length,
            timestamp: new Date().toISOString() 
        });
    }
    
    console.log('📩 Webhook received:', new Date().toISOString());
    
    const data = req.body;
    let rawPhone = null;
    let message = null;
    let isFromMe = false;
    
    if (data.event === 'message' && data.payload) {
        rawPhone = data.payload.from;
        message = data.payload.body;
        isFromMe = data.payload.fromMe || false;
    }
    
    if (!rawPhone || !message) {
        return res.status(200).json({ received: true, error: 'Missing data' });
    }
    
    let cleanPhone = rawPhone.replace('@c.us', '').replace('+', '').replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);
    
    console.log(`📱 Phone: ${cleanPhone}`);
    console.log(`💬 Message: ${message}`);
    console.log(`👤 Is from me: ${isFromMe}`);
    
    // 🔥🔥🔥 MANUAL OVERRIDE SYSTEM - CORE LOGIC 🔥🔥🔥
    
    // الحالة 1: أنا اللي برد على العميل (fromMe = true)
    if (isFromMe) {
        userState[cleanPhone] = "human";
        console.log(`👨‍💼 [${INSTANCE.name}] User ${cleanPhone} switched to HUMAN mode (I replied)`);
        return res.status(200).json({ 
            success: true, 
            mode: "human",
            message: "You replied to user, bot disabled for this user"
        });
    }
    
    // الحالة 2: العميل في وضع human (البوت يسكت خالص)
    if (userState[cleanPhone] === "human") {
        console.log(`🤫 [${INSTANCE.name}] Human mode active for ${cleanPhone}, bot silent`);
        return res.status(200).json({ 
            success: true, 
            mode: "human",
            message: "Bot is silent, waiting for human response"
        });
    }
    
    // الحالة 3: العميل في وضع pending (مستني رد مني)
    if (userState[cleanPhone] === "pending") {
        console.log(`⏳ [${INSTANCE.name}] Pending mode for ${cleanPhone}, waiting for your reply`);
        const isMenuRequest = message.toLowerCase().includes('menu') || message.includes('قائمة');
        if (!isMenuRequest) {
            return res.status(200).json({ 
                success: true, 
                mode: "pending",
                message: "Waiting for human response"
            });
        }
    }
    
    // 🔥 التحقق من طلب تحويل لخدمة العملاء
    const isCustomerServiceRequest = (
        message.trim() === '6' || 
        message.trim() === '٦' ||
        message.toLowerCase().includes('خدمة العملاء') ||
        message.toLowerCase().includes('support') ||
        message.toLowerCase().includes('agent') ||
        message.toLowerCase().includes('human')
    );
    
    if (isCustomerServiceRequest) {
        userState[cleanPhone] = "human";
        console.log(`👨‍💼 [${INSTANCE.name}] User ${cleanPhone} switched to HUMAN mode (requested)`);
        const autoReply = findAutoReply(message);
        if (autoReply) {
            await sendWhatsAppMessage(cleanPhone, autoReply);
        }
        return res.status(200).json({ success: true, mode: "human" });
    }
    
    // 🔥 التحقق من طلب العودة للبوت (قائمة أو menu)
    const isMenuRequest = message.toLowerCase().includes('menu') || message.includes('قائمة');
    if (isMenuRequest && (userState[cleanPhone] === "human" || userState[cleanPhone] === "pending")) {
        delete userState[cleanPhone];
        console.log(`🤖 [${INSTANCE.name}] User ${cleanPhone} switched back to BOT mode`);
    }
    
    // البحث عن رد تلقائي
    const autoReply = findAutoReply(message);
    
    if (autoReply) {
        console.log(`🤖 [${INSTANCE.name}] Auto-reply sent to ${cleanPhone}`);
        const result = await sendWhatsAppMessage(cleanPhone, autoReply);
        
        if (result.success) {
            userState[cleanPhone] = "pending";
            console.log(`⏳ [${INSTANCE.name}] User ${cleanPhone} switched to PENDING mode (waiting for human)`);
        }
        
        return res.status(200).json({ 
            success: result.success,
            replied: true,
            mode: "pending"
        });
    } else {
        console.log(`⚠️ No auto-reply found for: ${message}`);
        return res.status(200).json({ 
            success: true, 
            replied: false,
            reason: 'No matching rule found'
        });
    }
};
