// استقبال webhook من Easy Order في Wapilot
module.exports = async (req, res) => {
    console.log('📦 Easy Order Webhook Received');
    console.log('Method:', req.method);
    console.log('Body:', req.body);
    console.log('Headers:', req.headers);
    
    // Easy Order يرسل بيانات الطلب
    const orderData = req.body;
    
    // استخراج معلومات الطلب
    const customerPhone = orderData.phone || orderData.customer?.phone;
    const customerName = orderData.name || orderData.customer?.name;
    const product = orderData.product || orderData.items?.[0]?.name;
    const message = orderData.message || orderData.note;
    
    if (customerPhone) {
        // تخزين الطلب في localStorage (سيكون في قاعدة بيانات لاحقاً)
        console.log(`🆕 طلب جديد من: ${customerName || customerPhone}`);
        console.log(`📦 المنتج: ${product}`);
        console.log(`💬 الرسالة: ${message}`);
        
        // يمكن إرسال رد تلقائي للعميل
        // await sendAutoReply(customerPhone, product);
    }
    
    // يجب الرد بـ 200 حتى يعرف Wapilot أن الطلب استلم بنجاح
    res.status(200).json({ 
        success: true, 
        message: 'Order received successfully',
        timestamp: new Date().toISOString()
    });
};
