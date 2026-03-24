const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const Photo = require('../models/Photo');
const Gallery = require('../models/Gallery');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Upload photos dans une galerie (photographe)
router.post('/:galleryId', auth, upload.array('photos', 50), async (req, res) => {
  try {
    const photos = req.files.map(file => ({
      galleryId: req.params.galleryId,
      filename: file.originalname,
      url: file.path
    }));

    const savedPhotos = await Photo.insertMany(photos);
    res.status(201).json(savedPhotos);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// Toggle favori (client)
router.patch('/:id/favorite', async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) return res.status(404).json({ message: 'Photo non trouvée' });

    photo.isFavorite = !photo.isFavorite;
    await photo.save();
    res.json(photo);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// Télécharger les favoris en ZIP (client)
router.get('/:galleryId/favorites/zip', async (req, res) => {
  try {
    // Récupérer la galerie
    const gallery = await Gallery.findById(req.params.galleryId);
    if (!gallery) return res.status(404).json({ message: 'Galerie non trouvée' });

    // Récupérer les photos favorites
    const favorites = await Photo.find({ 
      galleryId: req.params.galleryId, 
      isFavorite: true 
    });

    if (favorites.length === 0) {
      return res.status(400).json({ message: 'Aucune photo favorite à télécharger' });
    }

    // Configurer la réponse ZIP
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${gallery.name}-favoris.zip"`);

    // Créer l'archive
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    // Ajouter chaque photo favorite dans le ZIP
    favorites.forEach(photo => {
      const filePath = path.join(__dirname, '..', 'uploads', photo.filename);
      if (fs.existsSync(filePath)) {
        archive.file(filePath, { name: photo.filename });
      }
    });

    await archive.finalize();

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

module.exports = router;