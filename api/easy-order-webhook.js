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

// ==================== INSTANCES CONFIGURATION ====================
const instances = [
    {
        id: "instance3532",
        token: "yzWzEjmxZpbifuOx6lWafYT3Ng69gaFpJGAdTsVc6N",
        name: "الرقم الأول - النمر للشحن",
        phoneNumber: "201028467631", // ⚠️ لازم تحط الرقم الصحيح هنا
        active: true
    },
    {
        id: "instance3537",
        token: "yzWzEjmxZpbifuOx6lWafYT3Ng69gaFpJGAdTsVc6N",
        name: "الرقم الثاني - النمر للشحن",
        phoneNumber: "201119383101", // ⚠️ لازم تحط الرقم الصحيح هنا
        active: true
    }
];

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
    
    console.log(`🔍 Searching for reply to: "${lowerMsg}"`);
    
    // معالجة خاصة للأرقام (1, 2, 3, 4, 5, 6)
    const numberMap = {
        '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6,
        '١': 1, '٢': 2, '٣': 3, '٤': 4, '٥': 5, '٦': 6
    };
    
    // إذا كانت الرسالة رقم فقط (مثل "1" أو "٢")
    if (numberMap[lowerMsg] !== undefined) {
        const number = numberMap[lowerMsg];
        console.log(`🔢 Number detected: ${number}`);
        
        // البحث عن القاعدة المطابقة للرقم
        for (let rule of autoRules) {
            if (!rule.active) continue;
            for (let keyword of rule.keywords) {
                // مطابقة الرقم مع الكلمة المفتاحية
                if (keyword === number.toString() || 
                    keyword === '1' && number === 1 ||
                    keyword === '2' && number === 2 ||
                    keyword === '3' && number === 3 ||
                    keyword === '4' && number === 4 ||
                    keyword === '5' && number === 5 ||
                    keyword === '6' && number === 6) {
                    console.log(`✅ Number match found: rule ${rule.id} for number ${number}`);
                    return rule.reply;
                }
            }
        }
    }
    
    // البحث العادي في القواعد
    for (let rule of autoRules) {
        if (!rule.active) continue;
        
        for (let keyword of rule.keywords) {
            const keywordLower = keyword.toLowerCase();
            
            // مطابقة تامة
            if (lowerMsg === keywordLower) {
                console.log(`✅ Exact match: rule ${rule.id} - keyword: "${keyword}"`);
                return rule.reply;
            }
            
            // مطابقة جزئية
            if (lowerMsg.includes(keywordLower)) {
                console.log(`✅ Partial match: rule ${rule.id} - keyword: "${keyword}" in "${lowerMsg}"`);
                return rule.reply;
            }
        }
    }
    
    console.log(`⚠️ No auto-reply found for: "${message}"`);
    return null;
}

// دالة محسنة لاستخراج instance_id من جميع المواقع الممكنة
function extractInstanceId(data) {
    // محاولة استخراج instance_id من جميع المواقع الممكنة
    return (
        data.instance_id ||
        data.instanceId ||
        data.webhook_id ||
        data.webhookId ||
        data.payload?.instance_id ||
        data.payload?.instanceId ||
        data.payload?.webhook_id ||
        data.payload?.webhookId ||
        data.data?.instance_id ||
        data.data?.instanceId ||
        null
    );
}

// دالة محسنة لاستخراج رقم الهاتف المستلم (الرقم الذي وصلت له الرسالة)
function extractReceivedPhone(data) {
    // محاولة استخراج الرقم الذي استلم الرسالة
    const phone = (
        data.payload?.to ||
        data.to ||
        data.payload?.recipient ||
        data.recipient ||
        data.payload?.destination ||
        data.destination ||
        null
    );
    
    if (phone) {
        return phone.toString().replace('@c.us', '').replace('+', '');
    }
    return null;
}

async function sendWhatsAppMessage(instance, chat_id, message) {
    try {
        console.log(`📤 [${instance.name}] Sending to: ${chat_id}`);
        
        const response = await axios.post(
            `https://api.wapilot.net/api/v2/${instance.id}/send-message`,
            { chat_id, text: message },
            { headers: { "token": instance.token, "Content-Type": "application/json" } }
        );
        
        console.log(`✅ [${instance.name}] Sent successfully to ${chat_id}`);
        return { success: true, data: response.data };
    } catch (error) {
        console.error(`❌ [${instance.name}] Send failed:`, error.response?.data || error.message);
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
            company: companyData.name,
            message: 'النمر للشحن - Webhook is running (Dual Instance - Fixed)',
            instances: instances.map(i => ({ 
                id: i.id, 
                name: i.name, 
                phoneNumber: i.phoneNumber,
                active: i.active 
            })),
            rulesCount: autoRules.filter(r => r.active).length,
            timestamp: new Date().toISOString()
        });
    }
    
    console.log('📦 Easy Order Webhook received:', new Date().toISOString());
    console.log('🔍 Full webhook data:', JSON.stringify(req.body, null, 2));
    
    const data = req.body;
    let rawChatId = null;
    let message = null;
    
    // استخراج البيانات من webhook
    if (data.payload) {
        rawChatId = data.payload.from;
        message = data.payload.body;
    }
    
    if (!rawChatId && data.from) {
        rawChatId = data.from;
        message = data.body || data.text;
    }
    
    if (!rawChatId || !message) {
        console.log('⚠️ Missing chat_id or message');
        return res.status(200).json({ 
            received: true, 
            error: 'Missing data',
            raw: data 
        });
    }
    
    // ========== الجزء المهم: استخراج الـ instance ID ==========
    const incomingInstanceId = extractInstanceId(data);
    const receivedPhone = extractReceivedPhone(data);
    
    console.log(`📱 Original chat_id: ${rawChatId}`);
    console.log(`💬 Message: ${message}`);
    console.log(`🔌 Extracted Instance ID: ${incomingInstanceId || 'NOT FOUND!'}`);
    console.log(`📞 Received Phone (who got the message): ${receivedPhone || 'NOT FOUND!'}`);
    console.log(`📋 Available instances: ${instances.map(i => `${i.id} (${i.name})`).join(', ')}`);
    
    let targetInstance = null;
    
    // استراتيجية 1: البحث باستخدام instance_id
    if (incomingInstanceId) {
        targetInstance = instances.find(inst => inst.id === incomingInstanceId && inst.active);
        if (targetInstance) {
            console.log(`✅ Found instance by ID: ${targetInstance.name}`);
        } else {
            console.log(`⚠️ Instance with ID ${incomingInstanceId} not found or inactive`);
        }
    }
    
    // استراتيجية 2: البحث باستخدام رقم الهاتف المستلم (إذا وجد)
    if (!targetInstance && receivedPhone) {
        let cleanPhone = receivedPhone.replace(/[^0-9]/g, '');
        if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);
        
        console.log(`🔍 Searching for instance with phone: ${cleanPhone}`);
        
        targetInstance = instances.find(inst => {
            if (!inst.phoneNumber) return false;
            let instPhone = inst.phoneNumber.toString().replace(/[^0-9]/g, '');
            if (instPhone.startsWith('0')) instPhone = instPhone.substring(1);
            return instPhone === cleanPhone;
        });
        
        if (targetInstance && targetInstance.active) {
            console.log(`✅ Found instance by phone number: ${targetInstance.name}`);
        } else if (targetInstance && !targetInstance.active) {
            console.log(`⚠️ Instance found by phone is not active`);
            targetInstance = null;
        }
    }
    
    // استراتيجية 3: البحث عن طريق مطابقة الرقم الذي أرسل له (من chat_id)
    if (!targetInstance && rawChatId) {
        // في بعض الحالات، chat_id يحتوي على معلومات عن المستلم
        // يمكن استخدامها لتحديد الـ instance
        console.log(`⚠️ Could not determine instance by ID or phone, will use active instance`);
    }
    
    // استراتيجية 4: استخدام أول instance نشط (fallback)
    if (!targetInstance) {
        targetInstance = instances.find(inst => inst.active);
        if (targetInstance) {
            console.log(`⚠️⚠️⚠️ WARNING: Using fallback instance: ${targetInstance.name}`);
            console.log(`⚠️⚠️⚠️ This may cause replies to come from the wrong number!`);
            console.log(`⚠️⚠️⚠️ Please check webhook configuration to ensure instance_id is being sent correctly`);
        }
    }
    
    if (!targetInstance) {
        console.log('⚠️ No active instance available');
        return res.status(200).json({ 
            received: true, 
            error: 'No active instance',
            debug: {
                incomingInstanceId,
                receivedPhone,
                availableInstances: instances.map(i => ({ id: i.id, phone: i.phoneNumber, active: i.active }))
            }
        });
    }
    
    let chatId = rawChatId;
    if (!chatId.includes('@')) {
        chatId = `${chatId}@c.us`;
    }
    
    console.log(`📤 WILL REPLY FROM: ${targetInstance.name} (${targetInstance.id})`);
    console.log(`📤 Instance phone number: ${targetInstance.phoneNumber || 'Not configured'}`);
    console.log(`📤 Sending to chat_id: ${chatId}`);
    
    const autoReply = findAutoReply(message);
    
    if (autoReply) {
        console.log(`🤖 Auto-reply found for message: "${message}" - Sending response...`);
        const result = await sendWhatsAppMessage(targetInstance, chatId, autoReply);
        
        return res.status(200).json({ 
            success: result.success,
            replied: true,
            reply: autoReply.substring(0, 100) + (autoReply.length > 100 ? '...' : ''),
            from_instance: targetInstance.name,
            from_instance_id: targetInstance.id,
            from_phone: targetInstance.phoneNumber,
            original_instance_id: incomingInstanceId,
            original_received_phone: receivedPhone,
            chat_id: chatId,
            result: result
        });
    } else {
        console.log(`⚠️ No matching auto-reply found for message: "${message}" - No response will be sent`);
        return res.status(200).json({ 
            success: true,
            replied: false,
            reason: 'No matching rule found',
            message: message,
            from_instance: targetInstance.name,
            original_instance_id: incomingInstanceId
        });
    }
};
