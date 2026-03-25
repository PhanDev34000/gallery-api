const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Route conservée pour compatibilité mais email géré côté frontend via EmailJS
router.post('/send', auth, async (req, res) => {
  res.json({ message: 'Email géré côté frontend via EmailJS' });
});

module.exports = router;