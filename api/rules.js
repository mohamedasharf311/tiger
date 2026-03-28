const { getAllRules, addRule } = require('./auto-reply');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // GET: استرجاع كل القواعد
    if (req.method === 'GET') {
        const rules = getAllRules();
        return res.status(200).json(rules);
    }
    
    // POST: إضافة قاعدة جديدة
    if (req.method === 'POST') {
        const { keywords, reply, active } = req.body;
        
        if (!keywords || !reply) {
            return res.status(400).json({ error: 'Keywords and reply are required' });
        }
        
        const newRule = addRule(keywords, reply, active);
        return res.status(200).json({ success: true, rule: newRule });
    }
    
    res.status(405).json({ error: 'Method not allowed' });
};
