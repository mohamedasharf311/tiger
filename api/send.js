const axios = require('axios');

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // GET request - للاختبار
    if (req.method === 'GET') {
        return res.status(200).json({ 
            status: 'ok', 
            message: 'API is working! Use POST to send messages.' 
        });
    }
    
    // POST request - لإرسال الرسائل
    const { phone, message } = req.body;
    
    if (!phone || !message) {
        return res.status(400).json({ error: 'Phone and message are required' });
    }
    
    try {
        const INSTANCE_ID = "instance3532";
        const API_TOKEN = "yzWzEjmxZpbifuOx6lWafYT3Ng69gaFpJGAdTsVc6N";
        const chat_id = `${phone}@c.us`;
        
        const response = await axios.post(
            `https://api.wapilot.net/api/v2/${INSTANCE_ID}/send-message`,
            { chat_id, text: message },
            { headers: { "token": API_TOKEN, "Content-Type": "application/json" } }
        );
        
        res.status(200).json({ success: true, data: response.data });
    } catch (error) {
        console.error('Send error:', error.response?.data || error.message);
        res.status(500).json({ 
            success: false, 
            error: error.response?.data || error.message 
        });
    }
};
