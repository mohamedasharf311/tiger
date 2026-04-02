const axios = require('axios');
const fs = require('fs');
const path = require('path');

// ==================== COMPANY DATA ====================
const companyData = {
    name: "النمر للشحن - ELNMR",
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

// ==================== USER STATE ====================
const userState = {};
const timeouts = {};

const STATE_FILE = path.join(__dirname, '..', 'data', 'easy-order-states.json');
const DATA_DIR = path.join(__dirname, '..', 'data');

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadUserStates() {
    try {
        if (fs.existsSync(STATE_FILE)) {
            const data = fs.readFileSync(STATE_FILE, 'utf8');
            const saved = JSON.parse(data);
            const now = Date.now();
            const TIMEOUT_DURATION = 30 * 60 * 1000;
            
            Object.keys(saved).forEach(phone => {
                if (saved[phone].mode === "human" && saved[phone].timestamp) {
                    const elapsed = now - saved[phone].timestamp;
                    if (elapsed < TIMEOUT_DURATION) {
                        userState[phone] = saved[phone];
                    }
                }
            });
            console.log(`📂 Loaded ${Object.keys(userState).length} user states`);
        }
    } catch (error) {
        console.error('Error loading user states:', error);
    }
}

function saveUserStates() {
    try {
        const toSave = {};
        Object.keys(userState).forEach(phone => {
            toSave[phone] = {
                mode: userState[phone].mode,
                timestamp: userState[phone].timestamp
            };
        });
        fs.writeFileSync(STATE_FILE, JSON.stringify(toSave, null, 2));
    } catch (error) {
        console.error('Error saving user states:', error);
    }
}

const TIMEOUT_DURATION = 30 * 60 * 1000;

function setAutoTimeout(phone) {
    if (timeouts[phone]) {
        clearTimeout(timeouts[phone]);
        delete timeouts[phone];
    }
    
    timeouts[phone] = setTimeout(() => {
        if (userState[phone] && userState[phone].mode === "human") {
            delete userState[phone];
            delete timeouts[phone];
            saveUserStates();
            console.log(`🤖 Auto timeout: User ${phone} back to BOT`);
        }
    }, TIMEOUT_DURATION);
}

loadUserStates();

// ==================== INSTANCES ====================
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

// ==================== AUTO REPLY RULES ====================
const autoRules = [
    {
        keywords: ['مرحب', 'اهلا', 'سلام', 'hello', 'hi', 'start', 'قائمة', 'menu'],
        reply: companyData.welcomeMessage,
        active: true
    },
    {
        keywords: ['1', 'داخل', 'اسكندرية', 'alexandria'],
        reply: `📍 أسعار الشحن داخل الإسكندرية:\n💰 60 جنيه: سيدي جابر، جليم، سموحة\n💰 65 جنيه: رأس السودة، سيوف\n💰 70 جنيه: المندرة، المعمورة\n💰 75 جنيه: العجمي\n💰 90 جنيه: برج العرب\n\nاكتب 'قائمة' للرجوع`,
        active: true
    },
    {
        keywords: ['2', 'خارج', 'القاهرة', 'cairo'],
        reply: `📍 أسعار الشحن خارج الإسكندرية:\n💰 100 جنيه: القاهرة، بورسعيد، الإسماعيلية\n💰 120 جنيه: سوهاج\n\nاكتب 'قائمة' للرجوع`,
        active: true
    },
    {
        keywords: ['3', 'مدة', 'توصيل', 'delivery'],
        reply: `⏱️ مدة التوصيل:\n• داخل الوجه البحري: 72 ساعة\n• وجه قبلي: 5 أيام\n• التحصيل: 24 ساعة\n\nاكتب 'قائمة' للرجوع`,
        active: true
    },
    {
        keywords: ['4', 'دفع', 'payment'],
        reply: `💰 طرق الدفع:\n• كاش\n• محفظة (فودافون كاش - انستاباي)\n• إنستاباي\n• تحويل بنكي\n\nاكتب 'قائمة' للرجوع`,
        active: true
    },
    {
        keywords: ['5', 'شروط', 'terms'],
        reply: `📋 شروط الشحن:\n1. السعر ممكن يتغير حسب البنزين\n2. الأوردر القابل للكسر = مسؤولية العميل\n3. في خدمة VIP توصيل نفس اليوم\n\nاكتب 'قائمة' للرجوع`,
        active: true
    },
    {
        keywords: ['6', 'خدمة', 'customer', 'support', 'human', 'موظف'],
        reply: "👤 تم تحويل محادثتك إلى خدمة العملاء. سيتم الرد عليك يدوياً في أقرب وقت.",
        active: true
    }
];

function findAutoReply(message) {
    if (!message) return null;
    const lowerMsg = message.toLowerCase().trim();
    console.log(`🔍 Searching for: "${lowerMsg}"`);
    
    for (let rule of autoRules) {
        if (!rule.active) continue;
        for (let keyword of rule.keywords) {
            if (lowerMsg.includes(keyword.toLowerCase()) || lowerMsg === keyword.toLowerCase()) {
                console.log(`✅ Found match: "${keyword}"`);
                return rule.reply;
            }
        }
    }
    console.log(`❌ No match found`);
    return null;
}

async function sendWhatsAppMessage(instance, chat_id, message) {
    try {
        console.log(`📤 [${instance.name}] Sending to: ${chat_id}`);
        console.log(`📤 Message: ${message.substring(0, 100)}...`);
        
        const response = await axios.post(
            `https://api.wapilot.net/api/v2/${instance.id}/send-message`,
            { chat_id, text: message },
            { headers: { "token": instance.token, "Content-Type": "application/json" } }
        );
        
        console.log(`✅ [${instance.name}] Sent successfully`);
        return { success: true };
    } catch (error) {
        console.error(`❌ Send failed:`, error.response?.data || error.message);
        return { success: false, error: error.message };
    }
}

// ==================== WEBHOOK HANDLER ====================
module.exports = async (req, res) => {
    console.log('='.repeat(50));
    console.log('📩 Webhook received at:', new Date().toISOString());
    console.log('📩 Method:', req.method);
    console.log('📩 Headers:', JSON.stringify(req.headers, null, 2));
    console.log('📩 Body:', JSON.stringify(req.body, null, 2));
    console.log('='.repeat(50));
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method === 'GET') {
        return res.status(200).json({ 
            status: 'active', 
            message: 'Webhook is working!',
            activeUsers: Object.keys(userState).length
        });
    }
    
    // استخراج البيانات
    const data = req.body;
    let phone = null;
    let message = null;
    let isFromMe = false;
    
    // تجربة كل التنسيقات الممكنة
    if (data.payload) {
        phone = data.payload.from;
        message = data.payload.body;
        isFromMe = data.payload.fromMe || false;
    } else if (data.from) {
        phone = data.from;
        message = data.body || data.text;
        isFromMe = data.fromMe || false;
    } else if (data.phone) {
        phone = data.phone;
        message = data.message;
    } else if (data.sender) {
        phone = data.sender;
        message = data.text;
    }
    
    // تجربة أخذ من URL query
    if (!message && req.query.message) {
        message = req.query.message;
        phone = req.query.phone;
    }
    
    if (!phone || !message) {
        console.log('❌ Missing phone or message');
        return res.status(200).json({ 
            received: true, 
            error: 'Missing phone or message',
            receivedData: data 
        });
    }
    
    // تنظيف رقم الهاتف
    let cleanPhone = phone.toString();
    cleanPhone = cleanPhone.replace('@c.us', '');
    cleanPhone = cleanPhone.replace('@lid', '');
    cleanPhone = cleanPhone.replace('+', '');
    cleanPhone = cleanPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);
    
    console.log(`📱 Clean phone: ${cleanPhone}`);
    console.log(`💬 Message: "${message}"`);
    console.log(`👤 Is from me: ${isFromMe}`);
    
    // تحديد الـ instance
    let targetInstance = instances.find(i => i.active);
    
    if (!targetInstance) {
        console.log('❌ No active instance');
        return res.status(200).json({ error: 'No active instance' });
    }
    
    const chatId = `${cleanPhone}@c.us`;
    
    // 🔥 SYSTEM LOGIC
    
    // لو أنا اللي برد
    if (isFromMe) {
        userState[cleanPhone] = { mode: "human", timestamp: Date.now() };
        setAutoTimeout(cleanPhone);
        saveUserStates();
        console.log(`👨‍💼 User ${cleanPhone} -> HUMAN mode (I replied)`);
        return res.status(200).json({ success: true, mode: "human" });
    }
    
    // لو العميل في وضع human
    if (userState[cleanPhone]?.mode === "human") {
        userState[cleanPhone].timestamp = Date.now();
        saveUserStates();
        setAutoTimeout(cleanPhone);
        console.log(`🤫 Human mode active, bot silent`);
        return res.status(200).json({ success: true, mode: "human", silent: true });
    }
    
    // طلب خدمة العملاء
    if (message.trim() === '6' || message.includes('خدمة العملاء') || message.includes('customer service')) {
        userState[cleanPhone] = { mode: "human", timestamp: Date.now() };
        setAutoTimeout(cleanPhone);
        saveUserStates();
        console.log(`👨‍💼 User ${cleanPhone} -> HUMAN mode (requested support)`);
        
        const reply = "👤 تم تحويل محادثتك إلى خدمة العملاء. سيتم الرد عليك يدوياً في أقرب وقت.";
        await sendWhatsAppMessage(targetInstance, chatId, reply);
        return res.status(200).json({ success: true, mode: "human" });
    }
    
    // طلب العودة للقائمة
    if (message.includes('قائمة') || message.toLowerCase().includes('menu')) {
        if (userState[cleanPhone]) {
            delete userState[cleanPhone];
            saveUserStates();
            console.log(`🤖 User ${cleanPhone} -> BOT mode (requested menu)`);
        }
    }
    
    // البحث عن رد تلقائي
    const autoReply = findAutoReply(message);
    
    if (autoReply) {
        console.log(`🤖 Sending auto-reply to ${cleanPhone}`);
        const result = await sendWhatsAppMessage(targetInstance, chatId, autoReply);
        return res.status(200).json({ success: result.success, replied: true });
    } else {
        console.log(`⚠️ No auto-reply found for: "${message}"`);
        return res.status(200).json({ success: true, replied: false, reason: 'No match' });
    }
};
