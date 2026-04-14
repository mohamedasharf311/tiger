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
    
    // لو GET: نعرض صفحة الإرسال أو المحادثة
    if (req.method === 'GET') {
        const { phone, instance, limit } = req.query;
        
        if (!phone) {
            // صفحة إرسال رسالة
            const html = `
                <!DOCTYPE html>
                <html dir="rtl">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>النمر للشحن - إرسال رسالة</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
                        .container { max-width: 600px; margin: 50px auto; background: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
                        h2 { color: #333; margin-bottom: 20px; text-align: center; }
                        label { display: block; margin: 15px 0 5px; font-weight: bold; color: #555; }
                        input, select, textarea { width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px; box-sizing: border-box; }
                        textarea { min-height: 100px; resize: vertical; }
                        button { width: 100%; padding: 15px; background: #4CAF50; color: white; border: none; border-radius: 8px; font-size: 18px; font-weight: bold; cursor: pointer; margin-top: 20px; transition: background 0.3s; }
                        button:hover { background: #45a049; }
                        .triggers { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; }
                        .trigger-btn { background: #f0f0f0; padding: 8px 15px; border-radius: 20px; cursor: pointer; border: 1px solid #ddd; font-size: 14px; transition: all 0.2s; }
                        .trigger-btn:hover { background: #4CAF50; color: white; }
                        #result { margin-top: 20px; padding: 15px; border-radius: 8px; display: none; }
                        .success { background: #d4edda; color: #155724; }
                        .error { background: #f8d7da; color: #721c24; }
                        .info { background: #e3f2fd; color: #1565c0; }
                        .links { margin-top: 20px; text-align: center; }
                        .links a { color: #4CAF50; text-decoration: none; margin: 0 10px; }
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
                                <span class="trigger-btn" onclick="setMessage('استنى ارد')">⏸️ استنى</span>
                            </div>
                            
                            <button type="submit">🚀 إرسال الرسالة</button>
                        </form>
                        <div id="result"></div>
                        <div class="links">
                            <a href="/api/messages" target="_blank">📊 Dashboard</a>
                            <a href="/api/send?phone=222956399677568" target="_blank">💬 عرض محادثة</a>
                        </div>
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
                            resultDiv.className = 'info';
                            resultDiv.innerHTML = '⏳ جاري الإرسال...';
                            
                            try {
                                const response = await fetch('/api/send', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ phone, message, instanceId: instance })
                                });
                                const data = await response.json();
                                
                                if (data.success) {
                                    resultDiv.className = 'success';
                                    resultDiv.innerHTML = '✅ تم الإرسال بنجاح!<br>📱 ' + data.instance + '<br>💬 "' + message + '"';
                                } else {
                                    resultDiv.className = 'error';
                                    resultDiv.innerHTML = '❌ فشل الإرسال: ' + (data.error || 'خطأ غير معروف');
                                }
                            } catch (error) {
                                resultDiv.className = 'error';
                                resultDiv.innerHTML = '❌ خطأ في الاتصال: ' + error.message;
                            }
                        });
                    </script>
                </body>
                </html>
            `;
            return res.send(html);
        }
        
        // عرض المحادثة كاملة
        const instanceId = instance || 'instance3554';
        const messages = await getUserMessages(instanceId, phone, parseInt(limit) || 100);
        const instanceName = instanceId === 'instance3554' ? 'الرقم الأول' : 'الرقم الثاني';
        
        let messagesHtml = '';
        if (messages.length === 0) {
            messagesHtml = '<div style="text-align: center; padding: 50px; color: #999;">📭 مفيش رسايل لسه</div>';
        } else {
            messages.forEach(msg => {
                const date = new Date(msg.timestamp).toLocaleString('ar-EG', { 
                    hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit'
                });
                
                let badge = '';
                let sender = '';
                if (msg.fromMe) {
                    sender = '📤';
                    badge = '<span style="background: #ff9800; color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px; margin-right: 5px;">أنت</span>';
                } else {
                    sender = '📥';
                    badge = '<span style="background: #9e9e9e; color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px; margin-right: 5px;">عميل</span>';
                }
                
                const text = (msg.message || '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
                
                messagesHtml += `
                    <div style="padding: 10px 15px; margin: 8px 0; border-radius: 10px; max-width: 80%; clear: both; ${msg.fromMe ? 'background: #dcf8c6; float: left; border-top-left-radius: 0;' : 'background: white; float: right; border-top-right-radius: 0;'}">
                        <div>${text}</div>
                        <div style="font-size: 11px; color: #666; margin-top: 5px;">${badge} ${sender} 🕐 ${date}</div>
                    </div>
                    <div style="clear: both;"></div>
                `;
            });
        }
        
        const html = `
            <!DOCTYPE html>
            <html dir="rtl">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="refresh" content="10">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>محادثة ${phone} - النمر للشحن</title>
                <style>
                    * { box-sizing: border-box; }
                    body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; padding: 0; margin: 0; background: #e5ddd5; min-height: 100vh; }
                    .header { background: #075e54; color: white; padding: 15px 20px; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
                    .header-content { max-width: 900px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
                    .back-btn { color: white; text-decoration: none; font-size: 18px; padding: 8px 18px; background: rgba(255,255,255,0.2); border-radius: 20px; }
                    .chat-container { max-width: 900px; margin: 0 auto; padding: 20px; min-height: calc(100vh - 130px); }
                    .stop-form { background: white; padding: 15px 20px; max-width: 900px; margin: 0 auto; border-radius: 10px 10px 0 0; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
                    .stop-form button { background: #f44336; color: white; border: none; padding: 10px 25px; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold; }
                    .stop-form select, .stop-form input { padding: 8px 12px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px; }
                    .instance-badge { background: #075e54; color: white; padding: 5px 15px; border-radius: 20px; }
                    .footer { text-align: center; padding: 12px; background: #075e54; color: white; position: sticky; bottom: 0; }
                    .footer a { color: #ffeb3b; margin: 0 10px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="header-content">
                        <a href="/api/send" class="back-btn">← رجوع</a>
                        <div style="text-align: center;">
                            <div style="font-size: 18px; font-weight: bold;">📱 ${phone}</div>
                            <div style="font-size: 14px; opacity: 0.9;">${messages.length} رسالة</div>
                        </div>
                        <span class="instance-badge">${instanceName}</span>
                    </div>
                </div>
                
                <div class="stop-form">
                    <span style="font-weight: bold; color: #333;">🛑 إيقاف البوت:</span>
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
                        <option value="استنى ارد">استنى ارد</option>
                    </select>
                    <button type="button" onclick="stopBot()">🚫 إيقاف البوت فوراً</button>
                    <span id="stopResult" style="margin-right: 10px; font-weight: bold;"></span>
                </div>
                
                <div class="chat-container">
                    ${messagesHtml}
                </div>
                
                <div class="footer">
                    🔄 تحديث تلقائي كل 10 ثواني | ${new Date().toLocaleString('ar-EG')}
                    <br>
                    <a href="/api/messages">📊 Dashboard</a> | 
                    <a href="/api/send">📤 إرسال رسالة</a>
                </div>
                
                <script>
                    async function stopBot() {
                        const phone = document.getElementById('currentPhone').value;
                        const instance = document.getElementById('stopInstance').value;
                        const message = document.getElementById('stopMessage').value;
                        const resultSpan = document.getElementById('stopResult');
                        
                        resultSpan.innerHTML = '⏳ جاري الإرسال...';
                        resultSpan.style.color = '#333';
                        
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
                                resultSpan.innerHTML = '❌ فشل: ' + (data.error || 'خطأ');
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
    
    // POST: إرسال رسالة
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
