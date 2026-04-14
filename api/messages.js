const { getUserMessages, getMessagesStats } = require('./firebase-config');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    
    const instanceId = req.query.instance || 'instance3554';
    const phone = req.query.phone;
    const limit = parseInt(req.query.limit) || 100;
    
    // لو مش محدد رقم، اعرض إحصائيات وفورم بحث
    if (!phone) {
        const stats1 = await getMessagesStats('instance3554');
        const stats2 = await getMessagesStats('instance3537');
        
        return res.send(`
            <!DOCTYPE html>
            <html dir="rtl">
            <head>
                <title>النمر للشحن - سجل المحادثات</title>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    * { box-sizing: border-box; }
                    body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; margin: 0; }
                    .container { max-width: 900px; margin: 0 auto; background: white; padding: 30px; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
                    h1 { color: #333; margin-bottom: 10px; display: flex; align-items: center; gap: 10px; }
                    h1 span { font-size: 14px; background: #4CAF50; color: white; padding: 5px 15px; border-radius: 20px; }
                    .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 25px 0; }
                    .stat-card { background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); padding: 20px; border-radius: 15px; text-align: center; }
                    .stat-card h3 { margin: 0 0 15px 0; color: #333; }
                    .stat-number { font-size: 48px; font-weight: bold; color: #4CAF50; }
                    .stat-label { color: #666; margin-top: 5px; }
                    .search-box { background: #f9f9f9; padding: 25px; border-radius: 15px; margin: 20px 0; }
                    .search-box h3 { margin-top: 0; color: #333; }
                    input, select, button { padding: 12px 15px; margin: 5px; font-size: 16px; border: 2px solid #ddd; border-radius: 10px; transition: all 0.3s; }
                    input:focus, select:focus { border-color: #4CAF50; outline: none; }
                    input { width: 300px; }
                    button { background: #4CAF50; color: white; border: none; cursor: pointer; font-weight: bold; padding: 12px 30px; }
                    button:hover { background: #45a049; transform: scale(1.02); }
                    .tips { background: #fff3cd; padding: 15px; border-radius: 10px; margin: 20px 0; border-right: 5px solid #ffc107; }
                    .tips code { background: #333; color: #fff; padding: 3px 8px; border-radius: 5px; font-size: 14px; }
                    .recent-numbers { margin-top: 20px; }
                    .number-tag { display: inline-block; background: #e3f2fd; padding: 8px 15px; margin: 5px; border-radius: 20px; cursor: pointer; transition: all 0.2s; }
                    .number-tag:hover { background: #4CAF50; color: white; }
                    .footer { margin-top: 30px; text-align: center; color: #999; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>
                        🐯 النمر للشحن - سجل المحادثات
                        <span>Live</span>
                    </h1>
                    
                    <div class="stats-grid">
                        <div class="stat-card">
                            <h3>📱 الرقم الأول</h3>
                            <div class="stat-number">${stats1?.usersCount || 0}</div>
                            <div class="stat-label">👥 مستخدم</div>
                            <div class="stat-number" style="font-size: 36px;">${stats1?.totalMessages || 0}</div>
                            <div class="stat-label">💬 رسالة</div>
                        </div>
                        <div class="stat-card">
                            <h3>📱 الرقم الثاني</h3>
                            <div class="stat-number">${stats2?.usersCount || 0}</div>
                            <div class="stat-label">👥 مستخدم</div>
                            <div class="stat-number" style="font-size: 36px;">${stats2?.totalMessages || 0}</div>
                            <div class="stat-label">💬 رسالة</div>
                        </div>
                    </div>
                    
                    <div class="search-box">
                        <h3>🔍 بحث عن محادثة</h3>
                        <form method="GET">
                            <select name="instance" id="instance">
                                <option value="instance3554" ${instanceId === 'instance3554' ? 'selected' : ''}>📱 الرقم الأول (01553999935)</option>
                                <option value="instance3537" ${instanceId === 'instance3537' ? 'selected' : ''}>📱 الرقم الثاني (01553999936)</option>
                            </select>
                            <input type="text" name="phone" placeholder="أدخل رقم الهاتف أو LID (مثال: 222956399677568)" value="${phone || ''}" required>
                            <button type="submit">🔎 عرض المحادثة</button>
                        </form>
                    </div>
                    
                    <div class="tips">
                        <strong>💡 معلومة مهمة:</strong><br>
                        • الرقم اللي بيظهر في الـ logs بيكون LID (زي: <code>222956399677568@lid</code>)<br>
                        • انسخ الرقم ده بالظبط وحطه في مربع البحث عشان تشوف المحادثة كاملة<br>
                        • الصفحة بتتحدث تلقائياً كل 10 ثواني عشان تشوف الرسايل الجديدة
                    </div>
                    
                    <div class="footer">
                        🕐 آخر تحديث: ${new Date().toLocaleString('ar-EG')}
                    </div>
                </div>
            </body>
            </html>
        `);
    }
    
    // عرض محادثة محددة
    const messages = await getUserMessages(instanceId, phone, limit);
    const instanceName = instanceId === 'instance3554' ? 'الرقم الأول' : 'الرقم الثاني';
    
    let html = `
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
            <title>محادثة ${phone} - النمر للشحن</title>
            <meta charset="UTF-8">
            <meta http-equiv="refresh" content="10">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                * { box-sizing: border-box; }
                body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; padding: 0; margin: 0; background: #e5ddd5; min-height: 100vh; }
                .header { background: #075e54; color: white; padding: 15px 20px; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
                .header-content { max-width: 900px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
                .back-btn { color: white; text-decoration: none; font-size: 24px; padding: 5px 15px; background: rgba(255,255,255,0.2); border-radius: 20px; }
                .chat-container { max-width: 900px; margin: 0 auto; padding: 20px; background: #e5ddd5; min-height: calc(100vh - 70px); }
                .message { padding: 10px 15px; margin: 5px 0; border-radius: 10px; max-width: 75%; clear: both; word-wrap: break-word; position: relative; }
                .fromMe { background: #dcf8c6; float: left; border-top-left-radius: 0; }
                .fromCustomer { background: white; float: right; border-top-right-radius: 0; }
                .time { font-size: 11px; color: #666; margin-top: 5px; display: flex; align-items: center; gap: 5px; }
                .fromMe .time { justify-content: flex-start; }
                .fromCustomer .time { justify-content: flex-end; }
                .badge { padding: 2px 8px; border-radius: 10px; font-size: 11px; }
                .badge-bot { background: #2196F3; color: white; }
                .badge-admin { background: #ff9800; color: white; }
                .badge-customer { background: #9e9e9e; color: white; }
                .empty-state { text-align: center; padding: 60px 20px; color: #999; }
                .refresh-indicator { background: #128C7E; color: white; padding: 8px; text-align: center; font-size: 14px; position: sticky; bottom: 0; }
                .message-content { font-size: 15px; line-height: 1.5; }
                hr { border: 0; border-top: 1px solid rgba(0,0,0,0.1); margin: 20px 0; }
                .info-bar { background: white; padding: 12px 20px; border-radius: 10px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
                .instance-badge { background: #075e54; color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="header-content">
                    <a href="?instance=${instanceId}" class="back-btn">← رجوع</a>
                    <div style="text-align: center;">
                        <div style="font-size: 18px; font-weight: bold;">📱 ${phone}</div>
                        <div style="font-size: 14px; opacity: 0.9;">${messages.length} رسالة</div>
                    </div>
                    <span class="instance-badge">${instanceName}</span>
                </div>
            </div>
            
            <div class="chat-container">
    `;
    
    if (messages.length === 0) {
        html += '<div class="empty-state"><h3>📭 مفيش رسايل لسه</h3><p>لما يجي رسايل هتظهر هنا</p></div>';
    } else {
        messages.forEach(msg => {
            const date = new Date(msg.timestamp).toLocaleString('ar-EG', { 
                hour: '2-digit', 
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit'
            });
            
            const messageText = (msg.message || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            
            let senderBadge = '';
            if (msg.fromMe) {
                senderBadge = '<span class="badge badge-admin">📤 أنت</span>';
            } else {
                senderBadge = '<span class="badge badge-customer">📥 عميل</span>';
            }
            
            // لو الرسالة طويلة شوية
            const displayText = messageText.length > 500 ? messageText.substring(0, 500) + '...' : messageText;
            
            html += `
                <div class="message ${msg.fromMe ? 'fromMe' : 'fromCustomer'}">
                    <div class="message-content">${displayText.replace(/\n/g, '<br>')}</div>
                    <div class="time">
                        ${senderBadge}
                        <span>🕐 ${date}</span>
                    </div>
                </div>
                <div style="clear: both;"></div>
            `;
        });
    }
    
    html += `
            </div>
            <div class="refresh-indicator">
                🔄 الصفحة بتتحدث تلقائياً كل 10 ثواني | آخر تحديث: ${new Date().toLocaleString('ar-EG')}
            </div>
        </body>
        </html>
    `;
    
    res.send(html);
};
