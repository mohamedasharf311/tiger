module.exports = async (req, res) => {
  console.log('📡 Webhook test received!');
  console.log('📦 Body:', JSON.stringify(req.body, null, 2));
  
  res.status(200).json({ 
    success: true, 
    message: 'Webhook is working!',
    received: req.body 
  });
};
