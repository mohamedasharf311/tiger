// تخزين الـ Instances (يمكن حفظها في ملف JSON لاحقاً)
let instances = [
    {
        id: "instance3554",
        token: "yzWzEjmxZpbifuOx6lWafYT3Ng69gaFpJGAdTsVc6N",
        name: "الرقم الأول",
        active: true,
        createdAt: new Date().toISOString()
    },
    {
        id: "instance3537",
        token: "yzWzEjmxZpbifuOx6lWafYT3Ng69gaFpJGAdTsVc6N",
        name: "الرقم الثاني",
        active: true,
        createdAt: new Date().toISOString()
    }
];

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // GET: استرجاع جميع الـ Instances
    if (req.method === 'GET') {
        return res.status(200).json(instances);
    }
    
    // POST: إضافة Instance جديدة
    if (req.method === 'POST') {
        const { id, token, name, active } = req.body;
        
        if (!id || !token || !name) {
            return res.status(400).json({ error: 'ID, token and name are required' });
        }
        
        const newInstance = {
            id,
            token,
            name,
            active: active !== false,
            createdAt: new Date().toISOString()
        };
        
        instances.push(newInstance);
        return res.status(200).json({ success: true, instance: newInstance });
    }
    
    // PUT: تحديث Instance
    if (req.method === 'PUT') {
        const { id, token, name, active } = req.body;
        
        const index = instances.findIndex(inst => inst.id === id);
        if (index === -1) {
            return res.status(404).json({ error: 'Instance not found' });
        }
        
        instances[index] = {
            ...instances[index],
            token: token || instances[index].token,
            name: name || instances[index].name,
            active: active !== undefined ? active : instances[index].active
        };
        
        return res.status(200).json({ success: true, instance: instances[index] });
    }
    
    // DELETE: حذف Instance
    if (req.method === 'DELETE') {
        const { id } = req.body;
        
        instances = instances.filter(inst => inst.id !== id);
        return res.status(200).json({ success: true });
    }
    
    res.status(405).json({ error: 'Method not allowed' });
};
