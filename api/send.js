const axios = require('axios');
const { saveMessage, getUserMessages } = require('./firebase-config');

const instances = [
    {
        id: "instance3554",
        token: "yzWzEjmxZpbifuOx6lWafYT3Ng69gaFpJGAdTsVc6N",
        name: "الرقم الأول",
        phoneNumber: "201553999935",
        active: true
    },
    {
        id: "instance3537",
        token: "yzWzEjmxZpbifuOx6lWafYT3Ng69gaFpJGAdTsVc6N",
        name: "الرقم الثاني",
        phoneNumber: "201553999936",
        active: true
    }
];

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // 🔥 لو GET: نعرض المحادثة كاملة (Dashboard)
    if (req.method === 'GET') {
        const { phone, instance, limit } = req.query;
        
        if (!phone) {
            return res.send(`
                <!DOCTYPE html>
                <html dir="rtl">
                <head>
                    <meta charset="UTF-8">
                    <title>النمر للشحن - إرسال رسالة</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
                        .container { max-width: 600px; margin: 50px auto; background: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
                        h2 { color: #333; margin-bottom: 20px; }
                        label { display: block; margin: 15px 0 5px; font-weight: bold; }
                        input, select, textarea { width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px; box-sizing: border-box; }
                        textarea { min-height: 100px; resize: vertical; }
                        button { width: 100%; padding: 15px; background: #4CAF50; color: white; border: none; border-radius: 8px; font-size: 18px; font-weight: bold; cursor: pointer; margin-top: 20px; }
                        button:hover { background: #45a049; }
                        .triggers { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; }
                        .trigger-btn { background: #f0f0f0; padding: 8px 15px; border-radius: 20px; cursor: pointer; border: 1px solid #ddd; }
                        .trigger-btn:hover { background: #4CAF50; color: white; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h2>📤 إرسال رسالة عبر واتساب</h2>
                        <form id="sendForm">
                            <label>📱 اختر الرقم:</label>
                            <select id="instance">
                                <option value="instance3554">الرقم الأول (01553999935)</option>
                                <option value="instance3537">الرقم الثاني (01553999936)</option>
                            </select>
                            
                            <label>👤 رقم المستلم (LID أو رقم الجوال):</label>
                            <input type="text" id="phone" placeholder="مثال: 222956399677568 أو 201119383101" required>
                            
                            <label>💬 الرسالة:</label>
                            <textarea id="message" placeholder="اكتب رسالتك هنا..." required></textarea>
                            
                            <div class="triggers">
                                <span class="trigger-btn" onclick="setMessage('اهلا وسهلا يا فندم')">👋 اهلا وسهلا</span>
                                <span class="trigger-btn" onclick="setMessage('مع حضرتك شركه النمر')">🐯 شركة النمر</span>
                                <span class="trigger-btn" onclick="setMessage('هرد عليك')">💬 هرد عليك</span>
                                <span class="trigger-btn" onclick="setMessage('ثواني وهتابع معاك')">⏱️ ثواني</span>
                            </div>
                            
                            <button type="submit">🚀 إرسال الرسالة</button>
                        </form>
                        <div id="result" style="margin-top: 20px; padding: 15px; border-radius: 8px; display: none;"></div>
                        <p style="margin-top: 20px; font-size: 12px; color: #999; text-align: center;">
                            💡 بعد الإرسال، تقدر تشوف المحادثة كاملة من <a href="/api/messages" target="_blank">هنا</a>
                        </p>
                    </div>
                    <script>
                        function setMessage(msg) {
                            document.getElementById('message').value = msg;
                        }
                        
                        document.getElementById('sendForm').addEventListener('submit', async (e) => {
                            e.preventDefault();
                            const instance = document.getElementById('instance').value;
                            const phone = document.getElementById('phone').value;
                            const message = document.getElementById('message').value;
                            
                            const resultDiv = document.getElementById('result');
                            resultDiv.style.display = 'block';
                            resultDiv.style.background = '#f0f0f0';
                            resultDiv.innerHTML = '⏳ جاري الإرسال...';
                            
                            try {
                                const response = await fetch('/api/send', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ phone, message, instanceId: instance })
                                });
                                const data = await response.json();
                                
                                if (data.success) {
                                    resultDiv.style.background = '#d4edda';
                                    resultDiv.style.color = '#155724';
                                    resultDiv.innerHTML = `✅ تم الإرسال بنجاح!<br>📱 ${data.instance}<br>💬 "${message}"`;
                                } else {
                                    resultDiv.style.background = '#f8d7da';
                                    resultDiv.style.color = '#721c24';
                                    resultDiv.innerHTML = `❌ فشل الإرسال: ${data.error}`;
                                }
                            } catch (error) {
                                resultDiv.style.background = '#f8d7da';
                                resultDiv.style.color = '#721c24';
                                resultDiv.innerHTML = `❌ خطأ: ${error.message}`;
                            }
                        });
                    </script>
                </body>
                </html>
            `);
        }
        
        // 🔥 لو في رقم، نعرض المحادثة كاملة
        const instanceId = instance || 'instance3554';
        const messages = await getUserMessages(instanceId, phone, parseInt(limit) || 100);
        const instanceName = instanceId === 'instance3554' ? 'الرقم الأول' : 'الرقم الثاني';
        
        let html = `
            <!DOCTYPE html>
            <html dir="rtl">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="refresh" content="10">
                <title>محادثة ${phone} - النمر للشحن</title>
                <style>
                    * { box-sizing: border-box; }
                    body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; padding: 0; margin: 0; background: #e5ddd5; min-height: 100vh; }
                    .header { background: #075e54; color: white; padding: 15px 20px; position: sticky; top: 0; z-index: 100; }
                    .header-content { max-width: 900px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
                    .back-btn { color: white; text-decoration: none; font-size: 20px; padding: 5px 15px; background: rgba(255,255,255,0.2); border-radius: 20px; }
                    .chat-container { max-width: 900px; margin: 0 auto; padding: 20px; }
                    .message { padding: 10px 15px; margin: 8px 0; border-radius: 10px; max-width: 80%; clear: both; }
                    .fromMe { background: #dcf8c6; float: left; border-top-left-radius: 0; }
                    .fromCustomer { background: white; float: right; border-top-right-radius: 0; }
                    .time { font-size: 11px; color: #666; margin-top: 5px; }
                    .badge { padding: 2px 8px; border-radius: 10px; font-size: 11px; margin-right: 5px; }
                    .badge-admin { background: #ff9800; color: white; }
                    .badge-bot { background: #2196F3; color: white; }
                    .badge-customer { background: #9e9e9e; color: white; }
                    .instance-badge { background: #075e54; color: white; padding: 5px 15px; border-radius: 20px; }
                    .stop-form { background: white; padding: 15px; border-radius: 10px; margin: 20px; max-width: 900px; margin: 20px auto; }
                    .stop-form button { background: #f44336; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 14px; }
                    .stop-form select, .stop-form input { padding: 8px; border: 1px solid #ddd; border-radius: 5px; margin: 0 5px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="header-content">
                        <a href="/api/send" class="back-btn">← رجوع</a>
                        <div style="text-align: center;">
                            <div style="font-size: 18px;">📱 ${phone}</div>
                            <div style="font-size: 14px;">${messages.length} رسالة</div>
                        </div>
                        <span class="instance-badge">${instanceName}</span>
                    </div>
                </div>
                
                <div class="stop-form">
                    <form id="stopForm" style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                        <span style="font-weight: bold;">🛑 إيقاف البوت:</span>
                        <input type="hidden" id="currentPhone" value="${phone}">
                        <select id="stopInstance">
                            <option value="instance3554" ${instanceId === 'instance3554' ? 'selected' : ''}>الرقم الأول</option>
                            <option value="instance3537" ${instanceId === 'instance3537' ? 'selected' : ''}>الرقم الثاني</option>
                        </select>
                        <select id="stopMessage">
                            <option value="اهلا وسهلا يا فندم">اهلا وسهلا يا فندم</option>
                            <option value="مع حضرتك شركه النمر">مع حضرتك شركه النمر</option>
                            <option value="هرد عليك">هرد عليك</option>
                            <option value="ثواني وهتابع معاك">ثواني وهتابع معاك</option>
                        </select>
                        <button type="button" onclick="stopBot()">🚫 إيقاف البوت فوراً</button>
                        <span id="stopResult" style="margin-right: 10px;"></span>
                    </form>
                </div>
                
                <div class="chat-container">
        `;
        
        if (messages.length === 0) {
            html += '<div style="text-align: center; padding: 50px; color: #999;">📭 مفيش رسايل لسه</div>';
        } else {
            messages.forEach(msg => {
                const date = new Date(msg.timestamp).toLocaleString('ar-EG', { 
                    hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit'
                });
                
                let sender = '';
                let badge = '';
                if (msg.fromMe) {
                    sender = '📤';
                    badge = '<span class="badge badge-admin">أنت</span>';
                } else {
                    sender = '📥';
                    badge = '<span class="badge badge-customer">عميل</span>';
                }
                
                const text = (msg.message || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                
                html += `
                    <div class="message ${msg.fromMe ? 'fromMe' : 'fromCustomer'}">
                        <div>${text.replace(/\n/g, '<br>')}</div>
                        <div class="time">${badge} ${sender} 🕐 ${date}</div>
                    </div>
                    <div style="clear: both;"></div>
                `;
            });
        }
        
        html += `
                </div>
                <div style="text-align: center; padding: 10px; background: #075e54; color: white; position: sticky; bottom: 0;">
                    🔄 تحديث تلقائي كل 10 ثواني | ${new Date().toLocaleString('ar-EG')}
                </div>
                <script>
                    async function stopBot() {
                        const phone = document.getElementById('currentPhone').value;
                        const instance = document.getElementById('stopInstance').value;
                        const message = document.getElementById('stopMessage').value;
                        const resultSpan = document.getElementById('stopResult');
                        
                        resultSpan.innerHTML = '⏳ جاري الإرسال...';
                        
                        try {
                            const response = await fetch('/api/send', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ phone, message, instanceId: instance })
                            });
                            const data = await response.json();
                            
                            if (data.success) {
                                resultSpan.innerHTML = '✅ تم إيقاف البوت!';
                                resultSpan.style.color = 'green';
                            } else {
                                resultSpan.innerHTML = '❌ فشل: ' + data.error;
                                resultSpan.style.color = 'red';
                            }
                        } catch (error) {
                            resultSpan.innerHTML = '❌ خطأ: ' + error.message;
                            resultSpan.style.color = 'red';
                        }
                    }
                </script>
            </body>
            </html>
        `;
        
        return res.send(html);
    }
    
    // 🔥 POST: إرسال رسالة
    const { phone, message, instanceId } = req.body;
    
    if (!phone || !message) {
        return res.status(400).json({ error: 'Phone and message required' });
    }
    
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
        // تنظيف الرقم
        let cleanPhone = phone.toString();
        cleanPhone = cleanPhone.replace('@c.us', '').replace('@lid', '').replace(/[^0-9]/g, '');
        if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);
        
        const chat_id = `${cleanPhone}@c.us`;
        
        console.log(`📤 [${targetInstance.name}] Sending to: ${chat_id}`);
        console.log(`📤 Message: ${message.substring(0, 100)}...`);
        
        const response = await axios.post(
            `https://api.wapilot.net/api/v2/${targetInstance.id}/send-message`,
            { chat_id, text: message },
            { headers: { "token": targetInstance.token, "Content-Type": "application/json" } }
        );
        
        console.log(`✅ [${targetInstance.name}] Sent successfully`);
        
        // 🔥🔥🔥 تسجيل الرسالة في Firebase كـ fromMe: true
        try {
            await saveMessage(targetInstance.id, cleanPhone, message, true);
            console.log(`💾 Message saved to Firebase for ${cleanPhone}`);
        } catch (saveError) {
            console.error(`⚠️ Failed to save message to Firebase:`, saveError.message);
        }
        
        res.status(200).json({ 
            success: true, 
            data: response.data,
            instance: targetInstance.name,
            phone: cleanPhone
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
