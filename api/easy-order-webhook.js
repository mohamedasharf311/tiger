// أضف هذا في بداية الملف بعد الـ requires
const userState = {};

// وفي webhook handler، أضف هذا المنطق قبل findAutoReply:

// 🔥🔥🔥 MANUAL OVERRIDE SYSTEM 🔥🔥🔥

// الحالة 1: أنا اللي برد على العميل (fromMe = true)
if (isFromMe) {
    userState[cleanPhone] = "human";
    console.log(`👨‍💼 User ${cleanPhone} switched to HUMAN mode (I replied)`);
    return res.status(200).json({ success: true, mode: "human" });
}

// الحالة 2: العميل في وضع human (البوت يسكت خالص)
if (userState[cleanPhone] === "human") {
    console.log(`🤫 Human mode active for ${cleanPhone}, bot silent`);
    return res.status(200).json({ success: true, mode: "human" });
}

// الحالة 3: العميل في وضع pending (مستني رد مني)
if (userState[cleanPhone] === "pending") {
    console.log(`⏳ Pending mode for ${cleanPhone}, waiting for human reply`);
    const isMenuRequest = message.toLowerCase().includes('menu') || message.includes('قائمة');
    if (!isMenuRequest) {
        return res.status(200).json({ success: true, mode: "pending" });
    }
}

// بعد الرد التلقائي، حول العميل إلى pending
if (autoReply && result.success) {
    userState[cleanPhone] = "pending";
    console.log(`⏳ User ${cleanPhone} switched to PENDING mode`);
}
