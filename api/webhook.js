const { processIncomingMessage } = require('./auto-reply');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // واجهة GET للاختبار
    if (req.method === 'GET') {
        return res.status(200).json({ 
            status: 'ok', 
            message: 'Webhook is working!',
            instructions: 'Send POST with phone and message to trigger auto-reply'
        });
    }
    
    // استقبال الرسائل من واتساب
    const { phone, message, from, text, body } = req.body;
    
    // محاولة استخراج رقم الهاتف والرسالة من مختلف التنسيقات
    const customerPhone = phone || from || req.query.phone;
    const customerMessage = message || text || body || req.query.message;
    
    if (!customerPhone || !customerMessage) {
        return res.status(400).json({ 
            error: 'Missing phone or message',
            received: req.body 
        });
    }
    
    try {
        const result = await processIncomingMessage(customerPhone, customerMessage);
        res.status(200).json({ 
            success: true, 
            replied: result.replied,
            autoReply: result.message || null
        });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: error.message });
    }
};
