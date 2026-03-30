const axios = require('axios');

// إعدادات الـ Instances المتعددة
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

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    const { phone, message, instanceId } = req.body;
    
    if (!phone || !message) {
        return res.status(400).json({ error: 'Phone and message required' });
    }
    
    // تحديد الـ Instance المطلوب
    let targetInstance = null;
    
    if (instanceId) {
        targetInstance = instances.find(inst => inst.id === instanceId);
    }
    
    if (!targetInstance) {
        targetInstance = instances.find(inst => inst.active);
    }
    
    if (!targetInstance) {
        return res.status(400).json({ error: 'No active instance available' });
    }
    
    try {
        const chat_id = `${phone}@c.us`;
        
        const response = await axios.post(
            `https://api.wapilot.net/api/v2/${targetInstance.id}/send-message`,
            { chat_id, text: message },
            { headers: { "token": targetInstance.token, "Content-Type": "application/json" } }
        );
        
        res.status(200).json({ 
            success: true, 
            data: response.data,
            instance: targetInstance.name 
        });
    } catch (error) {
        console.error('Send error:', error.response?.data || error.message);
        res.status(500).json({ 
            success: false, 
            error: error.response?.data || error.message,
            instance: targetInstance.name
        });
    }
};
