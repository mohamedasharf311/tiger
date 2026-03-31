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

// ==================== INSTANCE CONFIGURATION ====================
// هذا الـ webhook مخصص فقط للرقم الثاني
const INSTANCE = {
    id: "instance3537",
    token: "yzWzEjmxZpbifuOx6lWafYT3Ng69gaFpJGAdTsVc6N",
    name: "الرقم الثاني - النمر للشحن",
    phoneNumber: "201119383101", // الرقم الصحيح للـ instance الثاني
    active: true
};

// ==================== AUTO REPLY RULES ====================
let autoRules = [
    // القائمة الرئيسية
    {
        id: 0,
        keywords: [
            'قائمة', 'menu', 'الرئيسية', 'start', 'بداية', 'مرحباً', 'مرحبا', 'اهلا', 'أهلاً',
            'السلام عليكم', 'وعليكم السلام', 'صباح الخير', 'مساء الخير', 'هاي', 'hello', 'hi', 
            'hey', 'ازيك', 'عامل ايه', 'عاملين ايه', 'اخباركم', 'اخبارك', 'كيفك', 'how are you',
            'good morning', 'good evening', 'hi there', 'help'
        ],
        reply: companyData.welcomeMessage,
        active: true
    },
    
    // 1️⃣ أسعار الشحن داخل الإسكندرية
    {
        id: 1,
        keywords: [
            '1', '١',
            'داخل الاسكندرية', 'داخل الإسكندرية', 'اسكندرية', 'الإسكندرية',
            'اسعار اسكندرية', 'اسعار داخل', 'سعر', 'الثمن', 'كم سعر', 'بكام', 'price',
            'alexandria', 'inside alexandria', 'cost alexandria', 'shipping inside',
            'local shipping', 'cost', 'how much'
        ],
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
    
    // 2️⃣ أسعار الشحن خارج الإسكندرية
    {
        id: 2,
        keywords: [
            '2', '٢',
            'خارج الاسكندرية', 'خارج الإسكندرية', 'خارج', 'اسعار خارج',
            'القاهرة', 'بورسعيد', 'الإسماعيلية', 'الفيوم', 'قنا', 'سوهاج',
            'outside alexandria', 'cairo', 'portsaid', 'ismailia', 'fayoum',
            'qena', 'sohag', 'outside', 'other cities'
        ],
        reply: `📍 أسعار الشحن خارج الإسكندرية / Outside Alexandria Shipping Prices:

💰 100 جنيه / EGP:
${companyData.shippingPrices.outsideAlexandria["100 جنيه"].join(' - ')}

💰 120 جنيه / EGP:
${companyData.shippingPrices.outsideAlexandria["120 جنيه"].join(' - ')}

للرجوع للقائمة الرئيسية اكتب 'قائمة' / Type 'menu' to return to main menu`,
        active: true
    },
    
    // 3️⃣ مدة التوصيل
    {
        id: 3,
        keywords: [
            '3', '٣',
            'مدة التوصيل', 'التوصيل', 'المدة', 'وقت', 'كم يوم', 'مدة الشحن',
            'المدة كام', 'توصيل', 'الشحن', 'delivery time', 'delivery duration',
            'how long', 'shipping time', 'when', 'time', 'duration', 'delivery'
        ],
        reply: `⏱️ مدة التوصيل في النمر للشحن / Delivery Times:

• ${companyData.deliveryTimes.north}
• ${companyData.deliveryTimes.south}
• ${companyData.deliveryTimes.collection}

للرجوع للقائمة الرئيسية اكتب 'قائمة' / Type 'menu' to return to main menu`,
        active: true
    },
    
    // 4️⃣ طرق الدفع
    {
        id: 4,
        keywords: [
            '4', '٤',
            'طرق الدفع', 'الدفع', 'كيف ادفع', 'ادفع ازاي', 'طرق السداد', 'السداد',
            'payment', 'payment methods', 'how to pay', 'pay', 'cash', 'bank transfer',
            'instapay', 'vodafone cash', 'wallet'
        ],
        reply: `💰 طرق الدفع في النمر للشحن / Payment Methods:

• كاش / Cash 💵
• محفظة / Wallet 📱 (فودافون كاش - انستاباي / Vodafone Cash - Instapay)
• إنستاباي / Instapay 🏦
• تحويل بنكي / Bank Transfer 💳

للرجوع للقائمة الرئيسية اكتب 'قائمة' / Type 'menu' to return to main menu`,
        active: true
    },
    
    // 5️⃣ شروط الشحن
    {
        id: 5,
        keywords: [
            '5', '٥',
            'شروط', 'شروط الشحن', 'سياسة', 'قوانين', 'ممنوع', 'مسموح', 'ضمان',
            'terms', 'conditions', 'policy', 'rules', 'shipping terms', 'warranty',
            'fragile', 'insurance'
        ],
        reply: `📋 شروط الشحن في النمر للشحن / Shipping Terms:

${companyData.terms.map((t, i) => `${i+1}. ${t}`).join('\n')}

للرجوع للقائمة الرئيسية اكتب 'قائمة' / Type 'menu' to return to main menu`,
        active: true
    },
    
    // 6️⃣ التحدث مع خدمة العملاء
    {
        id: 6,
        keywords: [
            '6', '٦',
            'خدمة العملاء', 'خدمه العملاء', 'دعم', 'تكلم مع موظف', 'موظف',
            'تحكم', 'شكوى', 'مشكلة', 'اتصل بمسؤول', 'مسؤول', 'customer service',
            'support', 'agent', 'human', 'complaint', 'problem', 'talk to someone',
            'representative', 'issue'
        ],
        reply: "👤 تم تحويل محادثتك إلى خدمة العملاء في النمر للشحن. سيتم الرد عليك يدوياً في أقرب وقت. شكراً لصبرك.\n\nYour conversation has been transferred to customer service. You will receive a manual reply shortly. Thank you for your patience.",
        active: true
    },
    
    // طلب شحن جديد
    {
        id: 7,
        keywords: [
            'طلب شحن', 'شحنة', 'شحن', 'طلب', 'اوردر', 'اطلب', 'شراء', 'عايز أطلب',
            'عايز اشتري', 'احجز', 'اريد شحن', 'اريد طلب', 'new order', 'place order',
            'order', 'shipping request', 'send package', 'i want to ship', 'book',
            'request shipping', 'create order'
        ],
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
    
    // خدمة VIP
    {
        id: 8,
        keywords: [
            'vip', 'VIP', 'نفس اليوم', 'توصيل سريع', 'توصيل فوري', 'سريع', 'عاجل',
            'خدمة vip', 'اسرع توصيل', 'same day', 'express', 'urgent', 'fast delivery',
            'quick', 'priority', 'rapid'
        ],
        reply: `🚚 خدمة VIP توصيل نفس اليوم في النمر للشحن / VIP Same Day Delivery:

• متاحة داخل الإسكندرية فقط / Available only in Alexandria
• السعر يبدأ من 150 جنيه حسب المنطقة والوزن / Starting from 150 EGP depending on area and weight
• للطلب، تواصل مع خدمة العملاء (اضغط 6) / To order, contact customer service (press 6)

للرجوع للقائمة الرئيسية اكتب 'قائمة' / Type 'menu' to return to main menu`,
        active: true
    },
    
    // شكر وتأكيد
    {
        id: 9,
        keywords: [
            'شكرا', 'ممتاز', 'تمام', 'شكراً', 'تسلم', 'الله يبارك فيك', 'حلو',
            'جميل', 'تم', 'مشكور', 'thank', 'thanks', 'great', 'excellent', 'good',
            'perfect', 'ok', 'awesome', 'nice', 'done'
        ],
        reply: `🎉 شكراً لك على تواصلك مع النمر للشحن! / Thank you for contacting ELNMR Shipping!

نحن في خدمتك دائماً. إذا احتجت أي مساعدة أخرى، فقط اكتب 'قائمة' للعودة للخدمات المتاحة.
We are always at your service. If you need any further assistance, just type 'menu' to return to available services.

نتمنى لك يوماً سعيداً! 🐯 / Have a great day! 🐯`,
        active: true
    },
    
    // استفسارات عامة
    {
        id: 10,
        keywords: [
            'عايز استفسر', 'عندي سؤال', 'ممكن اسأل', 'محتاج اعرف', 'عايز اعرف',
            'عندكم', 'هل يوجد', 'متوفر', 'التفاصيل', 'ايه المميزات', 'بيشتغل ازاي',
            'inquiry', 'question', 'information', 'details', 'what is', 'how to',
            'tell me', 'i need to know', 'about', 'services'
        ],
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
    },
    
    // استفسار عن حالة الشحنة
    {
        id: 11,
        keywords: [
            'حالة الشحنة', 'تتبع', 'أين شحنتي', 'وصول', 'استلام', 'اين الطلب', 'تتبع الشحنة',
            'track', 'tracking', 'shipment status', 'order status', 'where is my order',
            'delivery status', 'track order'
        ],
        reply: `📦 لتتبع شحنتك / To track your shipment:

يرجى إرسال رقم الشحنة وسنقوم بالرد عليك خلال 24 ساعة.
Please send your tracking number and we will reply within 24 hours.

للرجوع للقائمة الرئيسية اكتب 'قائمة' / Type 'menu' to return to main menu`,
        active: true
    },
    
    // أسعار خاصة للشركات
    {
        id: 12,
        keywords: [
            'شركات', 'تعاقد', 'عقود', 'بزنس', 'تجارة', 'كميات كبيرة', 'business',
            'company', 'corporate', 'contract', 'bulk', 'wholesale', 'partnership',
            'commercial'
        ],
        reply: `🏢 للاستفسار عن تعاقدات الشركات / For corporate contracts:

لدينا أسعار خاصة للشركات والمؤسسات.
We offer special rates for companies and institutions.

للتواصل مع قسم المبيعات / Contact sales:
• اضغط 6 للتواصل مع خدمة العملاء / Press 6 to contact customer service
• سيتم تحويلك للمبيعات / You will be transferred to sales

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
                return rule.reply;
            }
        }
    }
    
    return null;
}

async function sendWhatsAppMessage(chat_id, message) {
    try {
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
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method === 'GET') {
        return res.status(200).json({ 
            status: 'active',
            instance: INSTANCE.name,
            instance_id: INSTANCE.id,
            phone: INSTANCE.phoneNumber,
            message: 'This webhook is dedicated to instance 2 only',
            timestamp: new Date().toISOString()
        });
    }
    
    console.log(`📩 [${INSTANCE.name}] Webhook received:`, new Date().toISOString());
    console.log(`🔍 Full webhook data:`, JSON.stringify(req.body, null, 2));
    
    const data = req.body;
    let rawChatId = null;
    let message = null;
    
    if (data.payload) {
        rawChatId = data.payload.from;
        message = data.payload.body;
    }
    
    if (!rawChatId && data.from) {
        rawChatId = data.from;
        message = data.body || data.text;
    }
    
    if (!rawChatId || !message) {
        console.log(`⚠️ [${INSTANCE.name}] Missing chat_id or message`);
        return res.status(200).json({ received: true, error: 'Missing data' });
    }
    
    console.log(`📱 [${INSTANCE.name}] From: ${rawChatId}`);
    console.log(`💬 [${INSTANCE.name}] Message: ${message}`);
    
    let chatId = rawChatId;
    if (!chatId.includes('@')) {
        chatId = `${chatId}@c.us`;
    }
    
    const autoReply = findAutoReply(message);
    
    if (autoReply) {
        console.log(`🤖 [${INSTANCE.name}] Sending auto-reply...`);
        const result = await sendWhatsAppMessage(chatId, autoReply);
        
        return res.status(200).json({ 
            success: result.success,
            replied: true,
            from_instance: INSTANCE.name,
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
