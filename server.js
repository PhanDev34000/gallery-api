const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/galleries', require('./routes/galleries'));
app.use('/api/photos', require('./routes/photos'));
app.use('/api/email', require('./routes/email'));

// Route de test
app.get('/', (req, res) => {
  res.json({ message: '🎉 Gallery API fonctionne !' });
});

// Connexion MongoDB + démarrage serveur
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connecté à MongoDB');
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Serveur démarré sur http://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Erreur connexion MongoDB :', err.message);
  });