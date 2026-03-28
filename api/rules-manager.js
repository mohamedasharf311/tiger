const fs = require('fs');
const path = require('path');

// مسار ملف القواعد
const RULES_FILE = path.join(__dirname, '..', 'data', 'rules.json');

// التأكد من وجود مجلد data
const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// القواعد الافتراضية
const DEFAULT_RULES = [
    { id: 1, keywords: ['سعر', 'الثمن', 'كم سعر', 'بكام'], reply: '💰 سعر المنتج هو 100 جنيه مصري', active: true },
    { id: 2, keywords: ['شكرا', 'ممتاز', 'تمام'], reply: '🎉 شكراً لك! نحن في خدمتك', active: true },
    { id: 3, keywords: ['طلب', 'اوردر', 'اطلب'], reply: '🛍️ لإنشاء طلب جديد، يرجى إرسال اسمك الكامل والعنوان', active: true },
    { id: 4, keywords: ['توصيل', 'الشحن'], reply: '🚚 التوصيل خلال 3-5 أيام، التكلفة 50 جنيهاً', active: true }
];

// قراءة القواعد
function getRules() {
    try {
        if (fs.existsSync(RULES_FILE)) {
            const data = fs.readFileSync(RULES_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (e) {}
    return DEFAULT_RULES;
}

// حفظ القواعد
function saveRules(rules) {
    fs.writeFileSync(RULES_FILE, JSON.stringify(rules, null, 2));
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // GET: استرجاع جميع القواعد
    if (req.method === 'GET') {
        const rules = getRules();
        return res.status(200).json(rules);
    }
    
    // POST: إضافة أو تحديث قاعدة
    if (req.method === 'POST') {
        const { id, keywords, reply, active } = req.body;
        const rules = getRules();
        
        if (id) {
            // تحديث قاعدة موجودة
            const index = rules.findIndex(r => r.id === id);
            if (index !== -1) {
                rules[index] = { ...rules[index], keywords, reply, active };
                saveRules(rules);
                return res.status(200).json({ success: true, rule: rules[index] });
            }
        } else {
            // إضافة قاعدة جديدة
            const newRule = {
                id: Date.now(),
                keywords: keywords.split(',').map(k => k.trim()),
                reply: reply,
                active: active !== false
            };
            rules.push(newRule);
            saveRules(rules);
            return res.status(200).json({ success: true, rule: newRule });
        }
    }
    
    // DELETE: حذف قاعدة
    if (req.method === 'DELETE') {
        const { id } = req.body;
        const rules = getRules();
        const filtered = rules.filter(r => r.id !== id);
        saveRules(filtered);
        return res.status(200).json({ success: true });
    }
    
    res.status(405).json({ error: 'Method not allowed' });
};
