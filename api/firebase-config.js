const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get, set, remove } = require('firebase/database');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCE9FrQxjTRem7O9IUc-2oJJRKAewK4Tqs",
  authDomain: "tiger-c8e99.firebaseapp.com",
  databaseURL: "https://tiger-c8e99-default-rtdb.firebaseio.com",
  projectId: "tiger-c8e99",
  storageBucket: "tiger-c8e99.firebasestorage.app",
  messagingSenderId: "1095275524859",
  appId: "1:1095275524859:web:d3915b443f2237bb54765e",
  measurementId: "G-EZKN9FLDTF"
};

// Initialize Firebase
let database = null;

try {
  const app = initializeApp(firebaseConfig);
  database = getDatabase(app);
  console.log('🔥 Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization error:', error.message);
}

// حفظ حالة مستخدم
async function saveUserState(instanceId, phone, mode) {
    try {
        if (!database) return false;
        const userRef = ref(database, `userStates/${instanceId}/${phone}`);
        await set(userRef, {
            mode: mode,
            timestamp: Date.now(),
            instanceId: instanceId
        });
        console.log(`💾 Firebase: Saved state for ${phone} (${mode}) in ${instanceId}`);
        return true;
    } catch (error) {
        console.error('❌ Firebase save error:', error.message);
        return false;
    }
}

// استرجاع حالة مستخدم
async function getUserState(instanceId, phone) {
    try {
        if (!database) return null;
        const userRef = ref(database, `userStates/${instanceId}/${phone}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            const data = snapshot.val();
            console.log(`📥 Firebase: Loaded state for ${phone}: ${data.mode}`);
            return data.mode;
        }
        return null;
    } catch (error) {
        console.error('❌ Firebase load error:', error.message);
        return null;
    }
}

// حذف حالة مستخدم
async function deleteUserState(instanceId, phone) {
    try {
        if (!database) return false;
        const userRef = ref(database, `userStates/${instanceId}/${phone}`);
        await remove(userRef);
        console.log(`🗑️ Firebase: Deleted state for ${phone}`);
        return true;
    } catch (error) {
        console.error('❌ Firebase delete error:', error.message);
        return false;
    }
}

// تنظيف المستخدمين المنتهيين (أكثر من 30 دقيقة)
async function cleanupExpiredUsers(instanceId) {
    try {
        if (!database) return;
        const usersRef = ref(database, `userStates/${instanceId}`);
        const snapshot = await get(usersRef);
        if (snapshot.exists()) {
            const users = snapshot.val();
            const now = Date.now();
            const TIMEOUT_DURATION = 30 * 60 * 1000;
            let deletedCount = 0;
            
            for (const [phone, user] of Object.entries(users)) {
                if (user.mode === "human") {
                    const elapsed = now - user.timestamp;
                    if (elapsed >= TIMEOUT_DURATION) {
                        await deleteUserState(instanceId, phone);
                        deletedCount++;
                    }
                }
            }
            
            if (deletedCount > 0) {
                console.log(`🧹 Firebase: Cleaned up ${deletedCount} expired users`);
            }
        }
    } catch (error) {
        console.error('❌ Firebase cleanup error:', error.message);
    }
}

module.exports = {
    saveUserState,
    getUserState,
    deleteUserState,
    cleanupExpiredUsers
};
