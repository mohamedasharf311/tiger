const { getUserMessages, getMessagesStats } = require('./firebase-config');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    
    const instanceId = req.query.instance || 'instance3554';
    const phone = req.query.phone;
    const limit = parseInt(req.query.limit) || 50;
    
    // لو مش محدد رقم، اعرض إحصائيات
    if (!phone) {
        const stats = await getMessagesStats(instanceId);
        return res.send(`
            <!DOCTYPE html>
            <html dir="rtl">
            <head>
                <title>النمر للشحن - المحادثات</title>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
                    .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; }
                    input, button { padding: 10px; margin: 5px; font-size: 16px; }
                    input { width: 300px; }
                    button { background: #4CAF50; color: white; border: none; cursor: pointer; border-radius: 5px; }
                    .stats { background: #e3f2fd; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
                    .message { padding: 10px; margin: 5px 0; border-radius: 5px; }
                    .fromMe { background: #dcf8c6; text-align: right; }
                    .fromCustomer { background: #ffffff; border: 1px solid #ddd; text-align: left; }
                    .time { font-size: 12px; color: #666; margin-top: 5px; }
                    h1 { color: #333; }
                    .instance-select { margin-bottom: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🐯 النمر للشحن - سجل المحادثات</h1>
                    
                    <div class="instance-select">
                        <label>اختر الرقم:</label>
                        <select id="instance" onchange="updateInstance()">
                            <option value="instance3554" ${instanceId === 'instance3554' ? 'selected' : ''}>📱 الرقم الأول (01553999935)</option>
                            <option value="instance3537" ${instanceId === 'instance3537' ? 'selected' : ''}>📱 الرقم الثاني (01553999936)</option>
                        </select>
                    </div>
                    
                    <div class="stats">
                        <strong>📊 إحصائيات ${instanceId === 'instance3554' ? 'الرقم الأول' : 'الرقم الثاني'}:</strong><br>
                        ${stats ? `👥 عدد المستخدمين: ${stats.usersCount}<br>💬 عدد الرسائل: ${stats.totalMessages}` : 'جاري التحميل...'}
                    </div>
                    
                    <form method="GET">
                        <input type="hidden" name="instance" value="${instanceId}">
                        <input type="text" name="phone" placeholder="أدخل رقم الهاتف (مثال: 201119383101)" value="${phone || ''}" required>
                        <button type="submit">🔍 عرض المحادثة</button>
                    </form>
                    
                    <p style="margin-top: 10px; font-size: 14px; color: #666;">
                        💡 نصيحة: الرقم الظاهر في logs بيبقى LID (مثال: 222956399677568@lid) - انسخه بالظبط
                    </p>
                    
                    ${phone ? '<hr><h3>📝 المحادثة مع: ' + phone + '</h3>' : ''}
                </div>
            </body>
            <script>
                function updateInstance() {
                    const instance = document.getElementById('instance').value;
                    window.location.href = '?instance=' + instance;
                }
            </script>
            </html>
        `);
    }
    
    // عرض محادثة محددة
    const messages = await getUserMessages(instanceId, phone, limit);
    
    let html = `
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
            <title>محادثة ${phone} - النمر للشحن</title>
            <meta charset="UTF-8">
            <meta http-equiv="refresh" content="10">
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
                .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; }
                .back { margin-bottom: 20px; }
                .back a { color: #4CAF50; text-decoration: none; font-size: 18px; }
                .message { padding: 12px; margin: 8px 0; border-radius: 8px; max-width: 80%; }
                .fromMe { background: #dcf8c6; margin-right: auto; text-align: right; }
                .fromCustomer { background: #ffffff; border: 1px solid #ddd; margin-left: auto; text-align: left; }
                .time { font-size: 11px; color: #888; margin-top: 5px; }
                .header { display: flex; justify-content: space-between; align-items: center; }
                .refresh { color: #4CAF50; }
                h2 { margin: 0; }
                .instance-badge { background: #4CAF50; color: white; padding: 5px 10px; border-radius: 20px; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="back">
                    <a href="?instance=${instanceId}">← رجوع للرئيسية</a>
                </div>
                <div class="header">
                    <h2>📱 محادثة: ${phone}</h2>
                    <span class="instance-badge">${instanceId === 'instance3554' ? 'الرقم الأول' : 'الرقم الثاني'}</span>
                </div>
                <p class="refresh">🔄 الصفحة بتتحدث تلقائياً كل 10 ثواني</p>
                <hr>
    `;
    
    if (messages.length === 0) {
        html += '<p style="color: #999; text-align: center; padding: 40px;">📭 مفيش رسايل لسه</p>';
    } else {
        messages.forEach(msg => {
            const date = new Date(msg.timestamp).toLocaleString('ar-EG', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            
            const messageText = msg.message.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            
            html += `
                <div class="message ${msg.fromMe ? 'fromMe' : 'fromCustomer'}">
                    <div>${messageText}</div>
                    <div class="time">${date} ${msg.fromMe ? '📤 أنت' : '📥 عميل'}</div>
                </div>
            `;
        });
    }
    
    html += `
            </div>
        </body>
        </html>
    `;
    
    res.send(html);
};
