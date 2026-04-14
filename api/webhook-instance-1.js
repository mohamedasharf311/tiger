const axios = require('axios');
const { 
    saveUserState, 
    getUserState, 
    deleteUserState, 
    cleanupExpiredUsers,
    saveMessage,
    getMessagesStats,
    getUserMessages
} = require('./firebase-config');

// ==================== COMPANY DATA ====================
const companyData = {
    name: "النمر للشحن - ELNMR",
    services: "شحن – تخزين – تغليف داخل الإسكندرية",
    welcomeMessage: `🐯 أهلاً بيك في شركة النمر للشحن! / Welcome to ELNMR Shipping!

نحن شركة النمر للشحن - لدينا مقر رسمي، وسجل تجاري، وبطاقة ضريبية، لضمان الثقة والالتزام في التعامل.

من فضلك اختار الرقم المناسب 👇 / Please choose the appropriate number 👇

1️⃣ أسعار الشحن داخل الإسكندرية / Alexandria shipping prices
2️⃣ أسعار الشحن خارج الإسكندرية / Outside Alexandria shipping prices
3️⃣ مدة التوصيل / Delivery time
4️⃣ طرق الدفع / Payment methods
5️⃣ شروط الشحن / Shipping terms
6️⃣ التحدث مع خدمة العملاء / Contact customer service
7️⃣ الباقات والأسعار الجديدة / Packages & New Prices
8️⃣ فرص عمل للمناديب / Job opportunities for couriers
9️⃣ شروط التعامل مع وكلاء لورد / Lord agents terms`,

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
            "90 جنيه": ["برج العرب", "العامرية"]
        },
        outsideAlexandria: {
            "100 جنيه": ["القاهرة", "بورسعيد", "الإسماعيلية", "الفيوم", "قنا"],
            "120 جنيه": ["سوهاج"]
        }
    },
    
    newPrices: {
        individual: {
            "60 جنيه": "من الإبراهيمية للبحري",
            "65 جنيه": "من الإبراهيمية لسيدي بشر",
            "75 جنيه": "العجمي",
            "90 جنيه": "العامرية - برج العرب"
        },
        pickupFee: "10 جنيه على كل أوردر",
        packages: {
            "10 أوردرات": "60 جنيه",
            "20 أوردر": "55 جنيه",
            "50 أوردر": "30 جنيه"
        },
        returns: {
            customerRefusal: "في حالة رفض العميل دفع الشحن: حضرتك بتدفع الشحن كامل",
            threeOrMore: "أكثر من 3 مرتجعات: بتدفع نص الشحن"
        },
        merchantPrices: {
            "55 جنيه": "من الإبراهيمية للبحري",
            "65 جنيه": "من الإبراهيمية لسيدي بشر",
            "75 جنيه": "العجمي",
            "90 جنيه": "العامرية - برج العرب"
        }
    },
    
    jobOpportunities: {
        title: "🔥 شركة النمر للشحن - فرصة شغل قوية للمناديب",
        description: "لو بتدور على شغل ثابت أو دخل إضافي… فاتحين باب التقديم فورًا 👇",
        systems: {
            first: {
                name: "✅ النظام الأول (مرتب ثابت):",
                salary: "مرتب 5000ج 💰",
                commission: "12 : 15ج عمولة على كل أوردر 📦"
            },
            second: {
                name: "✅ النظام التاني (مرتب + عمولة أعلى):",
                salary: "مرتب 4000ج 💰",
                commission: "22ج عمولة على كل أوردر 📦"
            },
            third: {
                name: "✅ النظام التالت (بالساعة):",
                salary: "25ج في الساعة ⏱️",
                commission: "5ج عمولة على كل أوردر 📦"
            }
        },
        benefits: [
            "✔️ شغل مستمر",
            "✔️ أوردرات جاهزة يوميًا",
            "✔️ فرصة تزود دخلك على حسب شغلك"
        ],
        contactPhones: ["01130491210", "01130491209", "01119383101"],
        message: `🔥 شركة النمر للشحن - فرصة شغل قوية للمناديب

لو بتدور على شغل ثابت أو دخل إضافي… فاتحين باب التقديم فورًا 👇

✅ النظام الأول (مرتب ثابت):
مرتب 5000ج 💰
* 12 : 15ج عمولة على كل أوردر 📦

✅ النظام التاني (مرتب + عمولة أعلى):
مرتب 4000ج 💰
* 22ج عمولة على كل أوردر 📦

✅ النظام التالت (بالساعة):
25ج في الساعة ⏱️
* 5ج عمولة على كل أوردر 📦

✔️ شغل مستمر
✔️ أوردرات جاهزة يوميًا
✔️ فرصة تزود دخلك على حسب شغلك

📞 للتواصل:
01130491210
01130491209
01119383101

📩 ابعتلنا رسالة دلوقتي وابدأ شغل فورًا
💪 فرصتك تبدأ وتكبر معانا`
    },
    
    lordAgentsTerms: {
        agentFee: "40 جنيه لكل أوردر",
        paymentSystems: {
            first: {
                name: "النظام الأول:",
                description: "دفع مقدم لقيمة الأوردرات قبل الشحن."
            },
            second: {
                name: "النظام الثاني (نظام تأميني):",
                description: "دفع مبلغ تأمين 5000 جنيه عند بدء التعامل، ويتم استرداده كاملًا عند وقف التعامل."
            }
        },
        message: `📋 شروط التعامل مع وكلاء لورد - شركة النمر للشحن

• تكلفة الوكيل: 40 جنيه لكل أوردر

أنظمة الدفع:
1. النظام الأول:
دفع مقدم لقيمة الأوردرات قبل الشحن.

2. النظام الثاني (نظام تأميني):
دفع مبلغ تأمين 5000 جنيه عند بدء التعامل،
ويتم استرداده كاملًا عند وقف التعامل.

للاستفسار، يرجى التواصل مع خدمة العملاء (اضغط 6)`
    },
    
    contactInfo: {
        website: "elnmrshipping.com.eg",
        phones: ["01119383101", "01553999935", "01130491210", "01130491209"]
    },
    
    terms: [
        "السعر ممكن يتغير حسب البنزين / Price may change based on fuel cost",
        "الأوردر القابل للكسر = مسؤولية العميل / Fragile items are customer's responsibility",
        "في خدمة VIP توصيل نفس اليوم / VIP same-day delivery service available",
        "يتم إضافة تكلفة بعد 5 كيلو / Extra charge applied beyond 5 km",
        "في تعاقدات للشركات بأسعار خاصة / Corporate contracts with special rates",
        "تكلفة البيك أب: 10 جنيه على كل أوردر / Pickup fee: 10 EGP per order",
        "نظام المرتجعات: الرفض = دفع الشحن كامل، أكثر من 3 = دفع نص الشحن / Returns policy"
    ]
};

// ==================== INSTANCE CONFIGURATION ====================
const INSTANCE_ID = "instance3554";
const INSTANCE = {
    id: INSTANCE_ID,
    token: "yzWzEjmxZpbifuOx6lWafYT3Ng69gaFpJGAdTsVc6N",
    name: "الرقم الأول - النمر للشحن",
    phoneNumber: "201553999935",
    active: true
};

// 🔥 رقم هاتف المسؤول
const ADMIN_PHONE = "201119383101";

// ==================== CACHE للـ timeouts ====================
const timeouts = {};
const TIMEOUT_DURATION = 30 * 60 * 1000;

// 🔥🔥🔥 تخزين آخر رسالة تم فحصها لكل عميل
const lastCheckedMessage = {};

// 🔥🔥🔥 تنظيف الكاش كل دقيقة
setInterval(() => {
    const now = Date.now();
    for (let key in lastCheckedMessage) {
        if (now - lastCheckedMessage[key] > 5 * 60 * 1000) {
            delete lastCheckedMessage[key];
        }
    }
}, 60 * 1000);

async function setAutoTimeout(chatId) {
    if (timeouts[chatId]) {
        clearTimeout(timeouts[chatId]);
        delete timeouts[chatId];
    }
    
    timeouts[chatId] = setTimeout(async () => {
        const currentMode = await getUserState(INSTANCE_ID, chatId);
        if (currentMode === "human") {
            await deleteUserState(INSTANCE_ID, chatId);
            delete timeouts[chatId];
            console.log(`🤖 Auto timeout: User ${chatId} switched back to BOT mode after 30 minutes`);
        }
    }, TIMEOUT_DURATION);
}

// 🔥 دالة لكشف إذا كانت الرسالة من المسؤول أو تحتوي على trigger
function isMessageFromAdmin(message, isFromMe, chatId) {
    let cleanChatId = chatId.replace('@c.us', '').replace('@lid', '').replace('+', '').replace(/[^0-9]/g, '');
    let cleanAdminPhone = ADMIN_PHONE;

    const lowerMsg = message.toLowerCase();

    const stopTriggers = [
        "اهلا وسهلا يا فندم",
        "مع حضرتك شركه النمر",
        "هرد عليك",
        "ثواني وهتابع معاك",
        "انا معاك",
        "دقيقه ارد عليك",
        "استنى ارد"
    ];

    if (stopTriggers.some(trigger => lowerMsg.includes(trigger.toLowerCase()))) {
        console.log(`🔥 Manual stop trigger detected. Stopping bot.`);
        return true;
    }

    if (cleanChatId === cleanAdminPhone) {
        console.log(`✅ Admin detected by phone number: ${ADMIN_PHONE}`);
        return true;
    }

    if (isFromMe) {
        console.log(`✅ Admin detected by fromMe flag`);
        return true;
    }

    return false;
}

// 🔥🔥🔥 فحص Firebase لآخر 50 رسالة والبحث عن كلمة السر في رسائل المسؤول
async function checkFirebaseForAdminMessage(chatId, cleanNumber) {
    try {
        // نجيب آخر 50 رسالة للعميل ده
        const messages = await getUserMessages(INSTANCE_ID, cleanNumber, 50);
        
        if (!messages || messages.length === 0) return false;
        
        console.log(`🔍 [Firebase Check] Got ${messages.length} messages for ${cleanNumber}`);
        
        const stopTriggers = [
            "اهلا وسهلا يا فندم",
            "مع حضرتك شركه النمر",
            "هرد عليك",
            "ثواني وهتابع معاك",
            "انا معاك",
            "دقيقه ارد عليك",
            "استنى ارد"
        ];
        
        // نلف على كل الرسايل من الأحدث للأقدم
        for (let i = messages.length - 1; i >= 0; i--) {
            const msg = messages[i];
            
            // 🔥 المهم: ندور في رسائل المسؤول (fromMe: true) بس
            // رسائل البوت التلقائية ممكن تكون fromMe: true برضو، لكن رسائلك أنت اللي فيها كلمة السر
            if (msg.fromMe !== true) continue;
            
            const messageKey = `${cleanNumber}_${msg.timestamp}`;
            
            // لو فحصناها قبل كده، skip
            if (lastCheckedMessage[messageKey]) continue;
            
            // نخزن وقت الفحص
            lastCheckedMessage[messageKey] = Date.now();
            
            const msgText = msg.message || '';
            
            // نتأكد إنها مش رسالة تلقائية من البوت (اختياري)
            // لو عايز تفحص رسائل معينة بس، تقدر تضيف فلتر هنا
            
            console.log(`🔍 [Firebase Check] Checking admin message: "${msgText.substring(0, 50)}..."`);
            
            const lowerMsg = msgText.toLowerCase();
            
            if (stopTriggers.some(trigger => lowerMsg.includes(trigger.toLowerCase()))) {
                console.log(`🔥🔥🔥 [Firebase Check] SECRET PHRASE DETECTED! Message: "${msgText.substring(0, 100)}"`);
                return true;
            }
        }
        
        return false;
    } catch (error) {
        console.error(`❌ [Firebase Check] Error:`, error.message);
        return false;
    }
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

📌 ملاحظة: البيك أب 10 جنيه على كل أوردر / Pickup fee: 10 EGP per order

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
        keywords: ['7', '٧', 'باقة', 'باقات', 'الباقات', 'اسعار الباقات', 'عروض', 'باقات الشحن', 'أسعار الجديدة', 'package', 'packages', 'new prices', 'bundles', 'الأسعار الجديدة', 'الشحن الفردي', 'أسعار التاجر', 'مرتجعات', 'pickup', 'بيك اب'],
        reply: `🟡 أسعار الشحنة الفردية / Individual Shipping Prices:
• من الإبراهيمية للبحري: 60 جنيه
• من الإبراهيمية لسيدي بشر: 65 جنيه
• العجمي: 75 جنيه
• العامرية - برج العرب: 90 جنيه

📌 البيك أب: 10 جنيه على كل أوردر / Pickup fee: 10 EGP per order

━━━━━━━━━━━━━━━━━━━━━

🟡 باقات الشحن / Shipping Packages:
• 10 أوردرات: 60 جنيه لكل أوردر
• 20 أوردر: 55 جنيه لكل أوردر
• 50 أوردر: 30 جنيه لكل أوردر

━━━━━━━━━━━━━━━━━━━━━

🟡 نظام المرتجعات / Returns Policy:
• في حالة رفض العميل دفع الشحن: حضرتك بتدفع الشحن كامل
• أكثر من 3 مرتجعات: بتدفع نص الشحن

━━━━━━━━━━━━━━━━━━━━━

🟡 أسعار التاجر / Merchant Prices:
• من الإبراهيمية للبحري: 55 جنيه
• من الإبراهيمية لسيدي بشر: 65 جنيه
• العجمي: 75 جنيه
• العامرية - برج العرب: 90 جنيه

━━━━━━━━━━━━━━━━━━━━━

🌐 بيانات التواصل / Contact Information:
• الموقع: ${companyData.contactInfo.website}
• الهاتف: ${companyData.contactInfo.phones.join(' | ')}

للرجوع للقائمة الرئيسية اكتب 'قائمة' / Type 'menu' to return to main menu`,
        active: true
    },
    {
        id: 8,
        keywords: ['8', '٨', 'مندوب', 'شغل', 'فرصة عمل', 'وظيفة', 'توظيف', 'مرتب', 'عمولة', 'job', 'job opportunity', 'courier', 'delivery job', 'employment', 'work', 'salary', 'commission'],
        reply: companyData.jobOpportunities.message,
        active: true
    },
    {
        id: 9,
        keywords: ['9', '٩', 'وكيل', 'وكلاء', 'لورد', 'lord', 'agent', 'agents', 'تكلفة الوكيل', 'نظام تأميني', 'دفع مقدم'],
        reply: companyData.lordAgentsTerms.message,
        active: true
    },
    {
        id: 10,
        keywords: ['طلب شحن', 'شحنة', 'طلب', 'اوردر', 'اطلب', 'شراء', 'عايز أطلب', 'عايز اشتري', 'احجز', 'اريد شحن', 'اريد طلب', 'new order', 'place order', 'order', 'shipping request', 'send package', 'i want to ship', 'book', 'request shipping', 'create order'],
        reply: `🛍️ لطلب شحنة جديدة في النمر للشحن، يرجى إرسال / To place a new order, please send:

1️⃣ اسمك الكامل / Full name
2️⃣ العنوان بالتفصيل / Detailed address
3️⃣ نوع البضاعة / Package type (عادي/fragile)
4️⃣ الوزن التقريبي / Approximate weight (kg)

سيتم التواصل معك لتأكيد السعر وموعد الاستلام.
We will contact you to confirm price and pickup time.

📌 ملاحظة: البيك أب 10 جنيه على كل أوردر / Note: Pickup fee 10 EGP per order

للرجوع للقائمة الرئيسية اكتب 'قائمة' / Type 'menu' to return to main menu`,
        active: true
    },
    {
        id: 11,
        keywords: ['vip', 'VIP', 'نفس اليوم', 'توصيل سريع', 'توصيل فوري', 'سريع', 'عاجل', 'خدمة vip', 'اسرع توصيل', 'same day', 'express', 'urgent', 'fast delivery', 'quick', 'priority', 'rapid'],
        reply: `🚚 خدمة VIP توصيل نفس اليوم في النمر للشحن / VIP Same Day Delivery:

• متاحة داخل الإسكندرية فقط / Available only in Alexandria
• السعر يبدأ من 150 جنيه حسب المنطقة والوزن / Starting from 150 EGP depending on area and weight
• للطلب، تواصل مع خدمة العملاء (اضغط 6) / To order, contact customer service (press 6)

للرجوع للقائمة الرئيسية اكتب 'قائمة' / Type 'menu' to return to main menu`,
        active: true
    },
    {
        id: 12,
        keywords: ['شكرا', 'ممتاز', 'تمام', 'شكراً', 'تسلم', 'الله يبارك فيك', 'حلو', 'جميل', 'تم', 'مشكور', 'thank', 'thanks', 'great', 'excellent', 'good', 'perfect', 'ok', 'awesome', 'nice', 'done'],
        reply: `🎉 شكراً لك على تواصلك مع النمر للشحن! / Thank you for contacting ELNMR Shipping!

نحن في خدمتك دائماً. إذا احتجت أي مساعدة أخرى، فقط اكتب 'قائمة' للعودة للخدمات المتاحة.
We are always at your service. If you need any further assistance, just type 'menu' to return to available services.

نتمنى لك يوماً سعيداً! 🐯 / Have a great day! 🐯`,
        active: true
    },
    {
        id: 13,
        keywords: ['عايز استفسر', 'عندي سؤال', 'ممكن اسأل', 'محتاج اعرف', 'عايز اعرف', 'عندكم', 'هل يوجد', 'متوفر', 'التفاصيل', 'ايه المميزات', 'بيشتغل ازاي', 'inquiry', 'question', 'information', 'details', 'what is', 'how to', 'tell me', 'i need to know', 'about', 'services'],
        reply: `📋 للاستفسار عن خدمات النمر للشحن / For inquiries about ELNMR Shipping services:

لدينا الخدمات التالية / We offer:
• شحن داخل وخارج الإسكندرية / Shipping inside and outside Alexandria
• تخزين بضائع / Storage
• تغليف / Packaging
• خدمة VIP توصيل نفس اليوم / VIP Same Day Delivery
• باقات شحن مخصصة للشركات / Custom shipping packages for businesses

للحصول على معلومات محددة / For specific information:
• اضغط 1 لأسعار داخل الإسكندرية / Press 1 for Alexandria prices
• اضغط 2 لأسعار خارج الإسكندرية / Press 2 for outside Alexandria prices
• اضغط 3 لمدة التوصيل / Press 3 for delivery time
• اضغط 4 لطرق الدفع / Press 4 for payment methods
• اضغط 5 للشروط والسياسات / Press 5 for terms and policies
• اضغط 6 للتواصل مع خدمة العملاء / Press 6 to contact customer service
• اضغط 7 للباقات والأسعار الجديدة / Press 7 for packages & new prices
• اضغط 8 لفرص العمل للمناديب / Press 8 for job opportunities
• اضغط 9 لشروط وكلاء لورد / Press 9 for Lord agents terms

للرجوع للقائمة الرئيسية اكتب 'قائمة' / Type 'menu' to return to main menu`,
        active: true
    },
    {
        id: 14,
        keywords: ['تواصل', 'اتصال', 'رقم', 'تليفون', 'موبايل', 'واتساب', 'contact', 'phone', 'number', 'call', 'whatsapp', 'website', 'موقع'],
        reply: `🌐 بيانات التواصل مع النمر للشحن / Contact Information:

• الموقع الإلكتروني / Website: ${companyData.contactInfo.website}
• أرقام الهاتف / Phone Numbers:
  ${companyData.contactInfo.phones.join('\n  ')}

• واتساب / WhatsApp: ${companyData.contactInfo.phones[1]}

للرجوع للقائمة الرئيسية اكتب 'قائمة' / Type 'menu' to return to main menu`,
        active: true
    }
];

function findAutoReply(message) {
    if (!message) return null;
    const lowerMsg = message.toLowerCase().trim();
    
    console.log(`🔍 [${INSTANCE.name}] Searching for reply to: "${lowerMsg}"`);
    
    const numberMap = {
        '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
        '١': 1, '٢': 2, '٣': 3, '٤': 4, '٥': 5, '٦': 6, '٧': 7, '٨': 8, '٩': 9
    };
    
    if (numberMap[lowerMsg] !== undefined) {
        const number = numberMap[lowerMsg];
        for (let rule of autoRules) {
            if (!rule.active) continue;
            for (let keyword of rule.keywords) {
                if (keyword === number.toString()) {
                    console.log(`✅ Number match: ${number}`);
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
                console.log(`✅ Match found: ${keyword}`);
                return rule.reply;
            }
        }
    }
    
    return null;
}

async function sendWhatsAppMessage(chat_id, message) {
    try {
        console.log(`📤 [${INSTANCE.name}] Sending to: ${chat_id}`);
        console.log(`📤 Message: ${message.substring(0, 100)}...`);
        
        const response = await axios.post(
            `https://api.wapilot.net/api/v2/${INSTANCE.id}/send-message`,
            { chat_id, text: message },
            { headers: { "token": INSTANCE.token, "Content-Type": "application/json" } }
        );
        
        console.log(`✅ [${INSTANCE.name}] Sent successfully`);
        return { success: true, message: message };
    } catch (error) {
        console.error(`❌ Send failed:`, error.response?.data || error.message);
        return { success: false, error: error.response?.data || error.message };
    }
}

async function initialize() {
    console.log(`🚀 Initializing ${INSTANCE.name} with Firebase...`);
    await cleanupExpiredUsers(INSTANCE_ID);
    
    const stats = await getMessagesStats(INSTANCE_ID);
    if (stats) {
        console.log(`📊 Stats: ${stats.usersCount} users, ${stats.totalMessages} messages`);
    }
}

initialize();

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
            phone: INSTANCE.phoneNumber,
            admin_phone: ADMIN_PHONE,
            storage: 'Firebase',
            message: 'Webhook is working with Full Conversation Scan (50 messages)!',
            timestamp: new Date().toISOString()
        });
    }
    
    console.log(`📩 [${INSTANCE.name}] Webhook received:`, new Date().toISOString());
    
    const data = req.body;
    let rawChatId = null;
    let message = null;
    let isFromMe = false;
    
    if (data.payload) {
        rawChatId = data.payload.from;
        message = data.payload.body;
        isFromMe = data.payload.fromMe || false;
    }
    
    if (!rawChatId || !message) {
        console.log(`⚠️ Missing chat_id or message`);
        return res.status(200).json({ received: true, error: 'Missing data' });
    }
    
    let chatId = rawChatId;
    if (!chatId.includes('@')) {
        chatId = `${chatId}@c.us`;
    }
    
    let cleanNumber = rawChatId.toString();
    cleanNumber = cleanNumber.replace('@c.us', '').replace('@lid', '').replace(/[^0-9]/g, '');
    if (cleanNumber.startsWith('0')) cleanNumber = cleanNumber.substring(1);
    
    console.log(`📱 From: ${rawChatId}`);
    console.log(`💬 Message: ${message}`);
    console.log(`👤 Is from me (Wapilot flag): ${isFromMe}`);
    
    await saveMessage(INSTANCE_ID, cleanNumber, message, isFromMe);
    
    // 🔥🔥🔥 فحص Webhook العادي
    let isAdmin = isMessageFromAdmin(message, isFromMe, chatId);
    
    // 🔥🔥🔥 فحص Firebase لآخر 50 رسالة
    if (!isAdmin) {
        console.log(`🔍 [Firebase] Scanning last 50 messages for admin secret...`);
        isAdmin = await checkFirebaseForAdminMessage(chatId, cleanNumber);
    }
    
    console.log(`👑 Is Admin (detected): ${isAdmin}`);
    
    if (isAdmin) {
        await saveUserState(INSTANCE_ID, chatId, "human");
        await setAutoTimeout(chatId);
        console.log(`👨‍💼 [${INSTANCE.name}] 🛑 BOT STOPPED for user ${chatId} for 30 minutes`);
        console.log(`📊 MODE: human`);
        return res.status(200).json({ success: true, mode: "human", detected: "admin" });
    }
    
    const currentMode = await getUserState(INSTANCE_ID, chatId);
    console.log(`📊 Current mode for ${chatId}: ${currentMode || "bot"}`);
    
    if (currentMode === "human") {
        console.log(`🤫 [${INSTANCE.name}] Human mode active, bot silent`);
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
        await saveUserState(INSTANCE_ID, chatId, "human");
        await setAutoTimeout(chatId);
        console.log(`👨‍💼 [${INSTANCE.name}] User requested human support - BOT STOPPED`);
        console.log(`📊 MODE: human`);
        
        const autoReply = findAutoReply(message);
        if (autoReply) {
            const result = await sendWhatsAppMessage(chatId, autoReply);
            if (result.success) {
                await saveMessage(INSTANCE_ID, cleanNumber, autoReply, true);
            }
        }
        return res.status(200).json({ success: true, mode: "human" });
    }
    
    const isMenuRequest = message.toLowerCase().includes('menu') || message.includes('قائمة');
    if (isMenuRequest && currentMode === "human") {
        if (timeouts[chatId]) {
            clearTimeout(timeouts[chatId]);
            delete timeouts[chatId];
        }
        await deleteUserState(INSTANCE_ID, chatId);
        console.log(`🤖 [${INSTANCE.name}] User ${chatId} -> BOT REACTIVATED (requested menu)`);
        console.log(`📊 MODE: bot`);
    }
    
    const autoReply = findAutoReply(message);
    
    if (autoReply) {
        console.log(`🤖 [${INSTANCE.name}] Sending auto-reply to ${chatId}...`);
        const result = await sendWhatsAppMessage(chatId, autoReply);
        
        if (result.success) {
            await saveMessage(INSTANCE_ID, cleanNumber, autoReply, true);
        }
        
        return res.status(200).json({ success: result.success, replied: true });
    } else {
        console.log(`⚠️ [${INSTANCE.name}] No auto-reply found for: "${message}"`);
        return res.status(200).json({ success: true, replied: false });
    }
};
