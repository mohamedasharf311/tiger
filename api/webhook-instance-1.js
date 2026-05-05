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
    address: "1.7 ش أنيس الإبراهيمية",
    welcomeMessage: `🐯 أهلاً بيك في شركة النمر للشحن! / Welcome to ELNMR Shipping!

نحن شركة النمر للشحن - لدينا مقر رسمي، وسجل تجاري، وبطاقة ضريبية، لضمان الثقة والالتزام في التعامل.

عنواننا: 1.7 ش أنيس الإبراهيمية

من فضلك اختار الرقم المناسب 👇 / Please choose the appropriate number 👇

1️⃣ أسعار الشحن داخل الإسكندرية / Alexandria shipping prices
2️⃣ أسعار الشحن خارج الإسكندرية / Outside Alexandria shipping prices
3️⃣ مدة التوصيل / Delivery time
4️⃣ طرق الدفع / Payment methods
5️⃣ شروط الشحن / Shipping terms
6️⃣ التحدث مع خدمة العملاء / Contact customer service
7️⃣ الباقات والأسعار الجديدة / Packages & New Prices
8️⃣ فرص عمل للمناديب / Job opportunities for couriers
9️⃣ شروط التعامل مع وكلاء لورد / Lord agents terms
🔟 طلب شحن جديد / New shipping order`,

    deliveryTimes: {
        north: "داخل الوجه البحري: خلال 72 ساعة / Nile Delta: within 72 hours",
        south: "وجه قبلي: خلال 5 أيام / Upper Egypt: within 5 days",
        collection: "التحصيل: خلال 24 ساعة / Collection: within 24 hours"
    },
    
    paymentMethods: "كاش - محفظة - إنستاباي - حساب بنكي / Cash - Wallet - Instapay - Bank Transfer",
    
    shippingPrices: {
        alexandria: {
            "60 جنيه": ["داخلي - جميع أحياء الإسكندرية"],
            "80 جنيه": ["خارجي - ضواحي الإسكندرية"]
        },
        outsideAlexandria: {
            "120 جنيه": ["القاهرة", "الجيزة"],
            "100 جنيه": ["الدقهلية", "البحيرة", "بورسعيد", "كفر الشيخ", "الغربية", "الإسماعيلية", "دمياط", "القليوبية", "السويس", "الشرقية"],
            "150 جنيه": ["الفيوم", "بني سويف", "المنوفية", "المنيا", "أسيوط", "مطروح", "الساحل", "سوهاج"],
            "180 جنيه": ["البحر الأحمر", "الوادي الجديد", "أسوان", "قنا"],
            "200 جنيه": ["جنوب سيناء", "شمال سيناء", "الأقصر"]
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
        phones: ["01553999935", "035938007", "01119383101"],
        address: "1.7 ش أنيس الإبراهيمية"
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
const INSTANCE_ID = "instance3882";
const INSTANCE = {
    id: INSTANCE_ID,
    token: "LVQSwwsO4HiwnZKkDSSFpVIS0HHuF1AtSfOAOCTl9k",
    name: "الرقم الأول - النمر للشحن",
    phoneNumber: "201553999935",
    active: true
};

// 🔥 رقم هاتف المسؤول
const ADMIN_PHONE = "201119383101";

// ==================== كلمات السر لإيقاف البوت ====================
const STOP_TRIGGERS = [
    "اهلا وسهلا يا فندم",
    "مع حضرتك شركه النمر",
    "هرد عليك",
    "ثواني وهتابع معاك",
    "انا معاك",
    "دقيقه ارد عليك",
    "استنى ارد"
];

// ==================== CACHE للـ timeouts ====================
const timeouts = {};
const TIMEOUT_DURATION = 30 * 60 * 1000;

// 🔥🔥🔥 تخزين آخر رسالة تم فحصها لكل عميل
const lastCheckedMessage = {};

// 🔥🔥🔥 تخزين بيانات الأوردر المؤقتة لكل عميل
const orderData = {};

// 🔥🔥🔥 تخزين الخطوة الحالية في عملية إنشاء الأوردر
const orderStep = {};

// 🔥🔥🔥 تنظيف الكاش كل دقيقة
setInterval(() => {
    const now = Date.now();
    for (let key in lastCheckedMessage) {
        if (now - lastCheckedMessage[key] > 5 * 60 * 1000) {
            delete lastCheckedMessage[key];
        }
    }
    
    for (let key in orderData) {
        if (orderData[key] && orderData[key]._timestamp && (now - orderData[key]._timestamp) > 60 * 60 * 1000) {
            delete orderData[key];
            delete orderStep[key];
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
        delete orderData[chatId];
        delete orderStep[chatId];
    }, TIMEOUT_DURATION);
}

function isMessageFromAdmin(message, isFromMe, chatId) {
    let cleanChatId = chatId.replace('@c.us', '').replace('@lid', '').replace('+', '').replace(/[^0-9]/g, '');
    let cleanAdminPhone = ADMIN_PHONE;

    const lowerMsg = message.toLowerCase();

    if (STOP_TRIGGERS.some(trigger => lowerMsg.includes(trigger.toLowerCase()))) {
        console.log(`🔥 Manual stop trigger detected`);
        return true;
    }

    if (cleanChatId === cleanAdminPhone) {
        console.log(`✅ Admin detected by phone number`);
        return true;
    }

    if (isFromMe) {
        console.log(`✅ Admin detected by fromMe flag`);
        return true;
    }

    return false;
}

async function checkFirebaseForAdminMessage(chatId, cleanNumber) {
    try {
        const messages = await getUserMessages(INSTANCE_ID, cleanNumber, 50);
        
        if (!messages || messages.length === 0) {
            return false;
        }
        
        for (let i = messages.length - 1; i >= 0; i--) {
            const msg = messages[i];
            if (msg.fromMe !== true) continue;
            
            const messageKey = `${cleanNumber}_${msg.timestamp}`;
            if (lastCheckedMessage[messageKey]) continue;
            
            lastCheckedMessage[messageKey] = Date.now();
            
            const msgText = msg.message || '';
            const lowerMsg = msgText.toLowerCase();
            
            if (STOP_TRIGGERS.some(trigger => lowerMsg.includes(trigger.toLowerCase()))) {
                console.log(`🔥🔥🔥 SECRET PHRASE DETECTED in ${cleanNumber}!`);
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error(`❌ [Firebase Check] Error:`, error.message);
        return false;
    }
}

function createOrderSummary(order) {
    return `📦 **تأكيد طلب الشحن - النمر للشحن** 📦

━━━━━━━━━━━━━━━━━━━━━
**بيانات الراسل:**
• اسم الراسل: ${order.senderName || '❌ غير مدخل'}
• رقم التواصل: ${order.senderPhone || '❌ غير مدخل'}
• العنوان بالتفاصيل: ${order.senderAddress || '❌ غير مدخل'}

**بيانات الشحنة:**
• محتويات الأوردر: ${order.orderContents || '❌ غير مدخل'}
• إجمالي المبلغ: ${order.totalAmount || '❌ غير مدخل'} جنيه

**بيانات المستلم:**
• اسم المستلم: ${order.receiverName || '❌ غير مدخل'}
• رقم التواصل: ${order.receiverPhone || '❌ غير مدخل'}
• رقم آخر: ${order.receiverAltPhone || '❌ غير مدخل'}
• المحافظة: ${order.governorate || '❌ غير مدخل'}
• العنوان بالتفاصيل: ${order.receiverAddress || '❌ غير مدخل'}

━━━━━━━━━━━━━━━━━━━━━
✅ هل البيانات دي صحيحة؟

📝 اكتب **نعم** لتأكيد الأوردر
✏️ اكتب **تعديل** لتغيير البيانات
❌ اكتب **إلغاء** للخروج
━━━━━━━━━━━━━━━━━━━━━`;
}

// 🔥🔥🔥 دوال التحقق من صحة البيانات (Validation)
function isValidName(name) {
    if (!name || name.trim() === '') return false;
    
    const words = name.trim().split(/\s+/);
    
    if (words.length > 6) return false;
    
    if (name.includes('؟') || name.includes('?')) return false;
    
    const questionWords = ['ليه', 'مبيكملش', 'لي', 'مش', 'عايز', 'ازاي', 'ايه', 'اي', 'بتاع', 'يعني'];
    for (let word of questionWords) {
        if (name.toLowerCase().includes(word)) return false;
    }
    
    return true;
}

function isValidPhone(phone) {
    const phoneRegex = /^01[0125][0-9]{8}$/;
    return phoneRegex.test(phone);
}

function isValidAmount(amount) {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0 && num < 1000000;
}

function isValidGovernorate(governorate) {
    const governorates = [
    'القاهرة', 'القاهره',
    'الجيزة', 'الجيزه',
    'الإسكندرية', 'الاسكندرية', 'الإسكندريه', 'الاسكندريه',
    'الدقهلية', 'الدقهليه',
    'البحيرة', 'البحيره',
    'بورسعيد', 'بورسعيد',
    'كفر الشيخ', 'كفرالشيخ', 'كفر الشيخ',
    'الغربية', 'الغربيه',
    'الإسماعيلية', 'الاسماعيلية', 'الإسماعيليه', 'الاسماعيليه',
    'دمياط', 'دمياط',
    'القليوبية', 'القليوبيه',
    'السويس', 'السويس',
    'الشرقية', 'الشرقيه',
    'الفيوم', 'الفيوم',
    'بني سويف', 'بني سويف', 'بنيسويف',
    'المنوفية', 'المنوفيه',
    'المنيا', 'المنيا',
    'أسيوط', 'اسيوط',
    'مطروح', 'مطروح',
    'الساحل', 'الساحل',
    'سوهاج', 'سوهاج',
    'البحر الأحمر', 'البحرالاحمر', 'البحر الاحمر',
    'الوادي الجديد', 'الواديالجديد', 'الوادي الجديد',
    'أسوان', 'اسوان',
    'قنا', 'قنا',
    'جنوب سيناء', 'جنوب سيناء',
    'شمال سيناء', 'شمال سيناء',
    'الأقصر', 'الاقصر'
    ];
    
    return governorates.some(g => governorate.includes(g));
}

function isValidAddress(address) {
    if (!address || address.trim() === '') return false;
    if (address.length < 5) return false;
    if (address.includes('؟') || address.includes('?')) return false;
    return true;
}

function isValidOrderContents(contents) {
    if (!contents || contents.trim() === '') return false;
    if (contents.length < 3) return false;
    return true;
}

// 🔥🔥🔥 دالة معالجة فلو إنشاء الأوردر مع Validation كامل
async function handleOrderFlow(chatId, message, sendMessageFunc) {
    const currentStep = orderStep[chatId];
    const currentOrder = orderData[chatId] || { _timestamp: Date.now() };
    
    // بداية الفلو - أول مرة (جاية من كلمة "موافق")
    if (!currentStep || message.toLowerCase().trim() === 'موافق' || message.toLowerCase().trim() === 'ok') {
        console.log(`🚀 [ORDER FLOW] Starting new order flow for ${chatId}`);
        orderStep[chatId] = "senderName";
        orderData[chatId] = { _timestamp: Date.now() };
        await sendMessageFunc(chatId, "🚫 أنت الآن في تسجيل أوردر\n❗ لا تستخدم أرقام القائمة\n\n✏️ من فضلك اكتب **اسم الراسل** بالكامل (مثال: محمد أحمد علي):");
        return true;
    }
    
    // معالجة كل خطوة مع Validation
    switch (currentStep) {
        case "senderName":
            if (!message || message.trim() === '') {
                await sendMessageFunc(chatId, "⚠️ اسم الراسل لا يمكن أن يكون فارغًا.\n\n✏️ اكتب اسم الراسل بالكامل (مثال: محمد أحمد علي):");
                return true;
            }
            
            if (!isValidName(message)) {
                await sendMessageFunc(chatId, "⚠️ من فضلك اكتب **اسم فقط** بدون أي جمل أو أسئلة.\n\n✏️ مثال: محمد أحمد علي\n\n❌ ممنوع: ليه مبيكملش - عايز اعرف - ازاي");
                return true;
            }
            
            currentOrder.senderName = message;
            orderStep[chatId] = "senderPhone";
            await sendMessageFunc(chatId, "📞 ممتاز\n\n✏️ من فضلك اكتب **رقم التواصل** للراسل (مثال: 01012345678):");
            break;
            
        case "senderPhone":
            if (!message || message.trim() === '') {
                await sendMessageFunc(chatId, "⚠️ رقم التواصل لا يمكن أن يكون فارغًا.\n\n📞 اكتب رقم مصري صحيح (مثال: 01012345678):");
                return true;
            }
            
            if (!isValidPhone(message)) {
                await sendMessageFunc(chatId, "⚠️ رقم غير صحيح.\n\n📞 اكتب رقم مصري صحيح مكون من 11 رقم ويبدأ بـ 010 أو 011 أو 012 أو 015 (مثال: 01012345678):");
                return true;
            }
            
            currentOrder.senderPhone = message;
            orderStep[chatId] = "senderAddress";
            await sendMessageFunc(chatId, "📍 ممتاز\n\n✏️ من فضلك اكتب **عنوان الراسل** بالتفصيل (الشارع - المنطقة - أقرب معلم):");
            break;
            
        case "senderAddress":
            if (!message || message.trim() === '') {
                await sendMessageFunc(chatId, "⚠️ عنوان الراسل لا يمكن أن يكون فارغًا.\n\n📍 اكتب العنوان بالتفصيل:");
                return true;
            }
            
            if (!isValidAddress(message)) {
                await sendMessageFunc(chatId, "⚠️ العنوان قصير جداً أو غير واضح.\n\n📍 اكتب العنوان بالتفصيل (الشارع - المنطقة - أقرب معلم):");
                return true;
            }
            
            currentOrder.senderAddress = message;
            orderStep[chatId] = "orderContents";
            await sendMessageFunc(chatId, "📦 ممتاز\n\n✏️ من فضلك اكتب **محتويات الأوردر** (نوع البضاعة - الوزن التقريبي - عدد القطع):");
            break;
            
        case "orderContents":
            if (!message || message.trim() === '') {
                await sendMessageFunc(chatId, "⚠️ محتويات الأوردر لا يمكن أن تكون فارغة.\n\n📦 اكتب محتويات الأوردر بالتفصيل:");
                return true;
            }
            
            if (!isValidOrderContents(message)) {
                await sendMessageFunc(chatId, "⚠️ محتويات الأوردر غير واضحة.\n\n📦 اكتب نوع البضاعة والوزن التقريبي (مثال: ملابس - 5 كجم):");
                return true;
            }
            
            currentOrder.orderContents = message;
            orderStep[chatId] = "totalAmount";
            await sendMessageFunc(chatId, "💰 ممتاز\n\n✏️ من فضلك اكتب **إجمالي المبلغ** المستلم (بالجنيه المصري، أرقام فقط):");
            break;
            
        case "totalAmount":
            if (!message || message.trim() === '') {
                await sendMessageFunc(chatId, "⚠️ إجمالي المبلغ لا يمكن أن يكون فارغًا.\n\n💰 اكتب المبلغ بالأرقام فقط (مثال: 150):");
                return true;
            }
            
            if (!isValidAmount(message)) {
                await sendMessageFunc(chatId, "⚠️ المبلغ غير صحيح.\n\n💰 اكتب رقم فقط (مثال: 150) ولا تكتب كلمات أو حروف:");
                return true;
            }
            
            currentOrder.totalAmount = message;
            orderStep[chatId] = "receiverName";
            await sendMessageFunc(chatId, "👤 ممتاز\n\n✏️ من فضلك اكتب **اسم المستلم** بالكامل (مثال: أحمد محمود):");
            break;
            
        case "receiverName":
            if (!message || message.trim() === '') {
                await sendMessageFunc(chatId, "⚠️ اسم المستلم لا يمكن أن يكون فارغًا.\n\n👤 اكتب اسم المستلم بالكامل:");
                return true;
            }
            
            if (!isValidName(message)) {
                await sendMessageFunc(chatId, "⚠️ من فضلك اكتب **اسم فقط** بدون أي جمل أو أسئلة.\n\n✏️ مثال: أحمد محمود علي");
                return true;
            }
            
            currentOrder.receiverName = message;
            orderStep[chatId] = "receiverPhone";
            await sendMessageFunc(chatId, "📞 ممتاز\n\n✏️ من فضلك اكتب **رقم التواصل** للمستلم (مثال: 01012345678):");
            break;
            
        case "receiverPhone":
            if (!message || message.trim() === '') {
                await sendMessageFunc(chatId, "⚠️ رقم التواصل للمستلم لا يمكن أن يكون فارغًا.\n\n📞 اكتب رقم مصري صحيح:");
                return true;
            }
            
            if (!isValidPhone(message)) {
                await sendMessageFunc(chatId, "⚠️ رقم غير صحيح.\n\n📞 اكتب رقم مصري صحيح مكون من 11 رقم:");
                return true;
            }
            
            currentOrder.receiverPhone = message;
            orderStep[chatId] = "receiverAltPhone";
            await sendMessageFunc(chatId, "📞 ✏️ من فضلك اكتب **رقم آخر** للمستلم (اختياري - اكتب 'لا' إذا لم يوجد):");
            break;
            
        case "receiverAltPhone":
            if (message.toLowerCase() !== 'لا' && message.toLowerCase() !== 'لاء') {
                if (!isValidPhone(message) && message !== 'لا') {
                    await sendMessageFunc(chatId, "⚠️ رقم غير صحيح أو اكتب 'لا' إذا لم يوجد رقم آخر.\n\n📞 اكتب رقم صحيح أو 'لا':");
                    return true;
                }
                currentOrder.receiverAltPhone = message;
            } else {
                currentOrder.receiverAltPhone = "لا يوجد";
            }
            orderStep[chatId] = "governorate";
            await sendMessageFunc(chatId, "📍 ممتاز\n\n✏️ من فضلك اكتب **المحافظة** (مثال: الإسكندرية - القاهرة - الجيزة):");
            break;
            
        case "governorate":
            if (!message || message.trim() === '') {
                await sendMessageFunc(chatId, "⚠️ المحافظة لا يمكن أن تكون فارغة.\n\n📍 اكتب اسم المحافظة بشكل صحيح:");
                return true;
            }
            
            if (!isValidGovernorate(message)) {
                await sendMessageFunc(chatId, "⚠️ اسم المحافظة غير صحيح أو غير موجود.\n\n📍 المحافظات المتاحة:\nالقاهرة، الجيزة، الإسكندرية، الدقهلية، البحيرة، بورسعيد، كفر الشيخ، الغربية، الإسماعيلية، دمياط، القليوبية، السويس، الشرقية، الفيوم، بني سويف، المنوفية، المنيا، أسيوط، مطروح، الساحل، سوهاج، البحر الأحمر، الوادي الجديد، أسوان، قنا، جنوب سيناء، شمال سيناء، الأقصر");
                return true;
            }
            
            currentOrder.governorate = message;
            orderStep[chatId] = "receiverAddress";
            await sendMessageFunc(chatId, "🏠 ممتاز\n\n✏️ من فضلك اكتب **عنوان المستلم** بالتفصيل (الشارع - المنطقة - أقرب معلم):");
            break;
            
        case "receiverAddress":
            if (!message || message.trim() === '') {
                await sendMessageFunc(chatId, "⚠️ عنوان المستلم لا يمكن أن يكون فارغًا.\n\n🏠 اكتب العنوان بالتفصيل:");
                return true;
            }
            
            if (!isValidAddress(message)) {
                await sendMessageFunc(chatId, "⚠️ العنوان قصير جداً أو غير واضح.\n\n🏠 اكتب العنوان بالتفصيل (الشارع - المنطقة - أقرب معلم):");
                return true;
            }
            
            currentOrder.receiverAddress = message;
            delete orderStep[chatId];
            orderData[chatId] = currentOrder;
            
            const summary = createOrderSummary(currentOrder);
            await sendMessageFunc(chatId, summary);
            break;
            
        default:
            delete orderStep[chatId];
            delete orderData[chatId];
            await sendMessageFunc(chatId, "⚠️ حدث خطأ. اكتب 'طلب شحن' مرة أخرى للبدء من جديد.");
            break;
    }
    
    orderData[chatId] = currentOrder;
    return true;
}

async function handleOrderConfirmation(chatId, message, sendMessageFunc) {
    const currentOrder = orderData[chatId];
    
    if (!currentOrder) {
        return false;
    }
    
    const lowerMsg = message.toLowerCase().trim();
    
    if (lowerMsg === 'نعم' || lowerMsg === 'yes' || lowerMsg === 'تم') {
        console.log(`✅ Order confirmed for ${chatId}:`, currentOrder);
        
        const finalMessage = `✅ **تم تأكيد طلب الشحن بنجاح!** ✅

📦 رقم الطلب: #${Date.now().toString().slice(-8)}
📅 تاريخ الطلب: ${new Date().toLocaleString('ar-EG')}

سيتم التواصل معك خلال 24 ساعة لتأكيد موعد الاستلام.

📞 للاستفسار: اضغط 6

شكراً لثقتكم في النمر للشحن 🐯`;
        
        await sendMessageFunc(chatId, finalMessage);
        
        delete orderData[chatId];
        delete orderStep[chatId];
        return true;
    }
    
    else if (lowerMsg === 'تعديل' || lowerMsg === 'edit') {
        orderStep[chatId] = "senderName";
        await sendMessageFunc(chatId, "✏️ تم تفعيل وضع التعديل.\n\n🚫 أنت الآن في تسجيل أوردر\n❗ لا تستخدم أرقام القائمة\n\n📝 من فضلك اكتب **اسم الراسل** بالكامل:");
        return true;
    }
    
    else if (lowerMsg === 'إلغاء' || lowerMsg === 'cancel' || lowerMsg === 'الغاء') {
        delete orderData[chatId];
        delete orderStep[chatId];
        await sendMessageFunc(chatId, "❌ تم إلغاء طلب الشحن.\n\nيمكنك بدء طلب جديد في أي وقت بكتابة 'طلب شحن'.\n\nللعودة للقائمة الرئيسية اكتب 'قائمة'");
        return true;
    }
    
    else {
        await sendMessageFunc(chatId, "⚠️ لم أفهم الرد.\n\n📝 اكتب **نعم** لتأكيد الأوردر\n✏️ اكتب **تعديل** لتغيير البيانات\n❌ اكتب **إلغاء** للخروج");
        return true;
    }
}

// ==================== AUTO REPLY RULES ====================
// 🔥 تم إزالة rule رقم 11 (بتاعة "موافق") لأنها كانت بتخرب الفلو
let autoRules = [
    {
        id: 0,
        keywords: ['قائمة', 'menu', 'الرئيسية', 'start', 'بداية', 'مرحباً', 'مرحبا', 'اهلا', 'أهلاً', 'السلام عليكم', 'وعليكم السلام', 'صباح الخير', 'مساء الخير', 'هاي', 'hello', 'hi', 'hey', 'ازيك', 'عامل ايه', 'عاملين ايه', 'اخباركم', 'كيفك', 'how are you'],
        reply: companyData.welcomeMessage,
        active: true
    },
    {
        id: 1,
        keywords: ['1', '١', 'داخل الاسكندرية', 'داخل الإسكندرية', 'اسكندرية', 'الإسكندرية', 'اسعار اسكندرية', 'اسعار داخل'],
        reply: `📍 أسعار الشحن داخل الإسكندرية:

💰 60 جنيه: داخلي - جميع أحياء الإسكندرية
💰 80 جنيه: خارجي - ضواحي الإسكندرية

📌 البيك أب: 10 جنيه

للرجوع للقائمة اكتب 'قائمة'`,
        active: true
    },
    {
        id: 2,
        keywords: ['2', '٢', 'خارج الاسكندرية', 'خارج الإسكندرية', 'خارج', 'اسعار خارج'],
        reply: `📍 أسعار الشحن خارج الإسكندرية:

💰 120 جنيه: القاهرة - الجيزة
💰 100 جنيه: الدقهلية، البحيرة، بورسعيد، كفر الشيخ، الغربية، الإسماعيلية، دمياط، القليوبية، السويس، الشرقية
💰 150 جنيه: الفيوم، بني سويف، المنوفية، المنيا، أسيوط، مطروح، الساحل، سوهاج
💰 180 جنيه: البحر الأحمر، الوادي الجديد، أسوان، قنا
💰 200 جنيه: جنوب سيناء، شمال سيناء، الأقصر

للرجوع للقائمة اكتب 'قائمة'`,
        active: true
    },
    {
        id: 3,
        keywords: ['3', '٣', 'مدة التوصيل', 'التوصيل', 'المدة', 'وقت', 'delivery time'],
        reply: `⏱️ مدة التوصيل:

• داخل الوجه البحري: خلال 72 ساعة
• وجه قبلي: خلال 5 أيام
• التحصيل: خلال 24 ساعة

للرجوع للقائمة اكتب 'قائمة'`,
        active: true
    },
    {
        id: 4,
        keywords: ['4', '٤', 'طرق الدفع', 'الدفع', 'payment'],
        reply: `💰 طرق الدفع:

• كاش 💵
• محفظة 📱
• إنستاباي 🏦
• تحويل بنكي 💳

للرجوع للقائمة اكتب 'قائمة'`,
        active: true
    },
    {
        id: 5,
        keywords: ['5', '٥', 'شروط', 'شروط الشحن', 'سياسة', 'terms'],
        reply: `📋 شروط الشحن:

${companyData.terms.map((t, i) => `${i+1}. ${t}`).join('\n')}

للرجوع للقائمة اكتب 'قائمة'`,
        active: true
    },
    {
        id: 6,
        keywords: ['6', '٦', 'خدمة العملاء', 'خدمه العملاء', 'دعم', 'تكلم مع موظف', 'customer service', 'support', 'agent', 'human'],
        reply: "👤 تم تحويل محادثتك إلى خدمة العملاء. سيتم الرد عليك يدوياً.",
        active: true
    },
    {
        id: 7,
        keywords: ['7', '٧', 'باقة', 'باقات', 'الباقات', 'package', 'packages', 'new prices'],
        reply: `🟡 الأسعار الجديدة:

• فردي: 60-90 جنيه حسب المنطقة
• باقات: 10 أوردرات (60ج)، 20 أوردر (55ج)، 50 أوردر (30ج)
• البيك أب: 10 جنيه

🌐 التواصل: ${companyData.contactInfo.phones.join(' | ')}

للرجوع للقائمة اكتب 'قائمة'`,
        active: true
    },
    {
        id: 8,
        keywords: ['8', '٨', 'مندوب', 'شغل', 'فرصة عمل', 'وظيفة', 'job', 'courier'],
        reply: companyData.jobOpportunities.message,
        active: true
    },
    {
        id: 9,
        keywords: ['9', '٩', 'وكيل', 'وكلاء', 'لورد', 'lord', 'agent'],
        reply: companyData.lordAgentsTerms.message,
        active: true
    },
    {
        id: 10,
        keywords: ['10', '١٠', 'طلب شحن', 'شحنة جديدة', 'اوردر جديد', 'عايز أطلب', 'new order', 'place order', 'order new', 'start order', 'create order'],
        reply: `🛍️ مرحباً بك في خدمة طلب الشحن الجديد!

سيتم إرشادك خطوة بخطوة لتسجيل بيانات الأوردر.

📝 اكتب **موافق** للبدء.`,
        active: true
    },
    // 🔥 تم حذف rule رقم 11 (بتاعة "موافق") لأنها كانت بتخرب الفلو
    
    {
        id: 12,
        keywords: ['vip', 'VIP', 'نفس اليوم', 'توصيل سريع', 'same day', 'express'],
        reply: `🚚 خدمة VIP توصيل نفس اليوم:

• متاحة داخل الإسكندرية فقط
• السعر يبدأ من 150 جنيه
• للطلب: اضغط 6

للرجوع للقائمة اكتب 'قائمة'`,
        active: true
    },
    {
        id: 13,
        keywords: ['شكرا', 'ممتاز', 'تمام', 'شكراً', 'تسلم', 'thank', 'thanks', 'great'],
        reply: `🎉 شكراً لك! نحن في خدمتك دائماً. 🐯`,
        active: true
    },
    {
        id: 14,
        keywords: ['تواصل', 'اتصال', 'رقم', 'تليفون', 'موبايل', 'contact', 'phone'],
        reply: `🌐 بيانات التواصل:

• الموقع: ${companyData.contactInfo.website}
• العنوان: ${companyData.contactInfo.address}
• الهاتف: ${companyData.contactInfo.phones.join(' | ')}`,
        active: true
    }
];

function findAutoReply(message) {
    if (!message) return null;
    const lowerMsg = message.toLowerCase().trim();
    
    const numberMap = {
        '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
        '١': 1, '٢': 2, '٣': 3, '٤': 4, '٥': 5, '٦': 6, '٧': 7, '٨': 8, '٩': 9, '١٠': 10
    };
    
    if (numberMap[lowerMsg] !== undefined) {
        const number = numberMap[lowerMsg];
        for (let rule of autoRules) {
            if (!rule.active) continue;
            for (let keyword of rule.keywords) {
                if (keyword === number.toString()) {
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
        console.log(`📤 Sending to: ${chat_id}`);
        console.log(`📤 Message: ${message.substring(0, 100)}...`);
        
        const response = await axios.post(
            `https://api.wapilot.net/api/v2/${INSTANCE.id}/send-message`,
            { chat_id, text: message },
            { headers: { "token": INSTANCE.token, "Content-Type": "application/json" } }
        );
        
        console.log(`✅ Sent successfully`);
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
            timestamp: new Date().toISOString()
        });
    }
    
    console.log(`📩 Webhook received:`, new Date().toISOString());
    
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
        console.log(`⚠️ Missing data`);
        return res.status(200).json({ received: true });
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
    
    await saveMessage(INSTANCE_ID, cleanNumber, message, isFromMe);
    
    // فحص المسؤول
    let isAdmin = isMessageFromAdmin(message, isFromMe, chatId);
    if (!isAdmin) {
        isAdmin = await checkFirebaseForAdminMessage(chatId, cleanNumber);
    }
    
    if (isAdmin) {
        await saveUserState(INSTANCE_ID, chatId, "human");
        await setAutoTimeout(chatId);
        console.log(`🛑 BOT STOPPED for ${chatId}`);
        return res.status(200).json({ success: true, mode: "human" });
    }
    
    const currentMode = await getUserState(INSTANCE_ID, chatId);
    
    if (currentMode === "human") {
        console.log(`🤫 Human mode active, bot silent`);
        return res.status(200).json({ success: true, mode: "human", silent: true });
    }
    
    // 🔥🔥🔥 أهم حاجة: تشغيل الفلو عند كلمة "موافق" قبل أي حاجة تانية
    const lowerMessage = message.toLowerCase().trim();
    if (lowerMessage === 'موافق' || lowerMessage === 'ok' || lowerMessage === 'oki') {
        console.log(`🚀 [START ORDER FLOW] User ${chatId} typed "${message}"`);
        const handled = await handleOrderFlow(chatId, message, sendWhatsAppMessage);
        if (handled) {
            return res.status(200).json({ success: true, flow_started: true });
        }
    }
    
    // 🔥🔥🔥 منع الأرقام عالميًا أثناء الفلو
    const numberKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 
                        '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '١٠'];
    
    if (orderStep[chatId] && numberKeys.includes(message.trim())) {
        console.log(`🚫 Blocked number ${message} during order flow`);
        
        const stepQuestions = {
            senderName: "✏️ من فضلك اكتب **اسم الراسل** بالكامل:",
            senderPhone: "📞 من فضلك اكتب **رقم التواصل** للراسل:",
            senderAddress: "📍 من فضلك اكتب **عنوان الراسل** بالتفصيل:",
            orderContents: "📦 من فضلك اكتب **محتويات الأوردر**:",
            totalAmount: "💰 من فضلك اكتب **إجمالي المبلغ**:",
            receiverName: "👤 من فضلك اكتب **اسم المستلم** بالكامل:",
            receiverPhone: "📞 من فضلك اكتب **رقم التواصل** للمستلم:",
            receiverAltPhone: "📞 من فضلك اكتب **رقم آخر** للمستلم (اختياري):",
            governorate: "📍 من فضلك اكتب **المحافظة**:",
            receiverAddress: "🏠 من فضلك اكتب **عنوان المستلم** بالتفصيل:"
        };
        
        const question = stepQuestions[orderStep[chatId]] || "✏️ من فضلك اكتب البيانات المطلوبة:";
        
        await sendWhatsAppMessage(chatId, `⚠️ **أنت الآن في تسجيل أوردر**\n❗ لا تستخدم أرقام القائمة\n\n${question}`);
        
        return res.status(200).json({ success: true, blocked: true });
    }
    
    // منع السبام
    if (orderStep[chatId] && orderData[chatId] && Date.now() - orderData[chatId]._timestamp < 1000) {
        console.log(`⚠️ Fast spam detected from ${chatId}`);
        await sendWhatsAppMessage(chatId, "⚠️ من فضلك انتظر قليلاً بين كل رسالة وأخرى.\n\n✏️ أرسل البيانات المطلوبة فقط.");
        return res.status(200).json({ success: true, spam: true });
    }
    
    // الأولوية: فلو إنشاء الأوردر
    if (orderStep[chatId]) {
        console.log(`🎯 [ORDER FLOW] User in step: ${orderStep[chatId]}`);
        const handled = await handleOrderFlow(chatId, message, sendWhatsAppMessage);
        if (handled) {
            return res.status(200).json({ success: true, flow: "order_wizard" });
        }
    }
    
    // مرحلة تأكيد الأوردر
    if (orderData[chatId] && !orderStep[chatId]) {
        console.log(`🎯 [ORDER CONFIRMATION] User confirming order`);
        const handled = await handleOrderConfirmation(chatId, message, sendWhatsAppMessage);
        if (handled) {
            return res.status(200).json({ success: true, flow: "order_confirmation" });
        }
    }
    
    // خدمة العملاء
    const isCustomerServiceRequest = (
        message.trim() === '6' || message.trim() === '٦' ||
        message.toLowerCase().includes('خدمة العملاء') ||
        message.toLowerCase().includes('customer service') ||
        message.toLowerCase().includes('support') ||
        message.toLowerCase().includes('agent')
    );
    
    if (isCustomerServiceRequest) {
        await saveUserState(INSTANCE_ID, chatId, "human");
        await setAutoTimeout(chatId);
        
        const autoReply = findAutoReply(message);
        if (autoReply) {
            await sendWhatsAppMessage(chatId, autoReply);
        }
        return res.status(200).json({ success: true, mode: "human" });
    }
    
    // الرجوع للقائمة
    const isMenuRequest = message.toLowerCase().includes('menu') || message.includes('قائمة');
    if (isMenuRequest && currentMode === "human") {
        if (timeouts[chatId]) {
            clearTimeout(timeouts[chatId]);
            delete timeouts[chatId];
        }
        await deleteUserState(INSTANCE_ID, chatId);
        console.log(`🤖 BOT REACTIVATED`);
    }
    
    // الردود التلقائية العادية
    const autoReply = findAutoReply(message);
    
    if (autoReply) {
        console.log(`🤖 [AUTO REPLY] Sending regular auto-reply`);
        const result = await sendWhatsAppMessage(chatId, autoReply);
        if (result.success) {
            await saveMessage(INSTANCE_ID, cleanNumber, autoReply, true);
        }
        return res.status(200).json({ success: result.success, replied: true });
    }
    
    console.log(`⚠️ No action taken for message: "${message}"`);
    return res.status(200).json({ success: true, replied: false });
};
