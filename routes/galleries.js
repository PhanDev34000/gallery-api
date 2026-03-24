const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const Photo = require('../models/Photo');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// Créer une galerie (photographe)
router.post('/', auth, async (req, res) => {
  try {
    const { name, date } = req.body;
    const gallery = new Gallery({ name, date, photographerId: req.userId });
    await gallery.save();
    res.status(201).json(gallery);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// Lister ses galeries (photographe)
router.get('/', auth, async (req, res) => {
  try {
    const galleries = await Gallery.find({ photographerId: req.userId }).sort({ createdAt: -1 });

    const galleriesWithCount = await Promise.all(galleries.map(async (gallery) => {
      const photoCount = await Photo.countDocuments({ galleryId: gallery._id });
      const favoriteCount = await Photo.countDocuments({ galleryId: gallery._id, isFavorite: true });
      return { ...gallery.toObject(), photoCount, favoriteCount };
    }));

    res.json(galleriesWithCount);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// Supprimer une galerie (photographe)
router.delete('/:id', auth, async (req, res) => {
  try {
    const gallery = await Gallery.findOneAndDelete({ _id: req.params.id, photographerId: req.userId });
    if (!gallery) return res.status(404).json({ message: 'Galerie non trouvée' });
    await Photo.deleteMany({ galleryId: req.params.id });
    res.json({ message: 'Galerie supprimée' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// Définir / modifier le mot de passe d'une galerie (photographe)
router.patch('/:id/password', auth, async (req, res) => {
  try {
    const { password } = req.body;
    const gallery = await Gallery.findOne({ _id: req.params.id, photographerId: req.userId });
    if (!gallery) return res.status(404).json({ message: 'Galerie non trouvée' });

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      gallery.password = hashed;
      gallery.isProtected = true;
    } else {
      gallery.password = null;
      gallery.isProtected = false;
    }

    await gallery.save();
    res.json({ message: 'Mot de passe mis à jour', isProtected: gallery.isProtected });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// Accès public à une galerie (client)
router.get('/public/:uniqueUrl', async (req, res) => {
  try {
    const gallery = await Gallery.findOne({ uniqueUrl: req.params.uniqueUrl });
    if (!gallery) return res.status(404).json({ message: 'Galerie non trouvée' });

    // Si protégée, on renvoie juste l'info sans les photos
    if (gallery.isProtected) {
      return res.json({ 
        gallery: { 
          _id: gallery._id,
          name: gallery.name, 
          date: gallery.date,
          isProtected: true 
        }, 
        photos: [] 
      });
    }

    const photos = await Photo.find({ galleryId: gallery._id });
    res.json({ gallery, photos });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// Vérifier le mot de passe (client)
router.post('/public/:uniqueUrl/verify', async (req, res) => {
  try {
    const { password } = req.body;
    const gallery = await Gallery.findOne({ uniqueUrl: req.params.uniqueUrl });
    if (!gallery) return res.status(404).json({ message: 'Galerie non trouvée' });

    const isMatch = await bcrypt.compare(password, gallery.password);
    if (!isMatch) return res.status(401).json({ message: 'Mot de passe incorrect' });

    const photos = await Photo.find({ galleryId: gallery._id });
    res.json({ gallery, photos });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

module.exports = router;