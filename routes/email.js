const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Gallery = require('../models/Gallery');
const auth = require('../middleware/auth');

// Configuration Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD
  }
});

// Envoyer le lien de la galerie par email
router.post('/send', auth, async (req, res) => {
  try {
    const { galleryId, clientEmail, clientName } = req.body;

    // Récupérer la galerie
    const gallery = await Gallery.findById(galleryId);
    if (!gallery) {
      return res.status(404).json({ message: 'Galerie non trouvée' });
    }

    // Construire le lien
    const galleryLink = `https://gallery-app-five-iota.vercel.app/g/${gallery.uniqueUrl}`;

    // Contenu de l'email
    const mailOptions = {
      from: `"Gallery App 📷" <${process.env.GMAIL_USER}>`,
      to: clientEmail,
      subject: `Vos photos sont disponibles - ${gallery.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3f51b5;">📷 Vos photos sont prêtes !</h2>
          
          <p>Bonjour ${clientName},</p>
          
          <p>Vos photos de <strong>${gallery.name}</strong> sont disponibles !</p>
          
          <p>Cliquez sur le bouton ci-dessous pour les consulter et sélectionner vos favoris :</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${galleryLink}" 
               style="background-color: #3f51b5; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 5px; font-size: 16px;">
              Voir mes photos
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Ou copiez ce lien dans votre navigateur :<br>
            <a href="${galleryLink}">${galleryLink}</a>
          </p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px;">
            Ce lien est personnel, merci de ne pas le partager.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Email envoyé avec succès !' });

  } catch (err) {
    console.error('Erreur envoi email:', err);
    res.status(500).json({ message: 'Erreur envoi email', error: err.message });
  }
});

module.exports = router;