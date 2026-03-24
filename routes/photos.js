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
    const gallery = await Gallery.findById(req.params.galleryId);
    if (!gallery) return res.status(404).json({ message: 'Galerie non trouvée' });

    const favorites = await Photo.find({ 
      galleryId: req.params.galleryId, 
      isFavorite: true 
    });

    if (favorites.length === 0) {
      return res.status(400).json({ message: 'Aucune photo favorite à télécharger' });
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${gallery.name}-favoris.zip"`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    // Télécharger chaque photo depuis Cloudinary et l'ajouter au ZIP
    const https = require('https');
    const http = require('http');

    const downloadFile = (url) => {
      return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        protocol.get(url, (response) => {
          const chunks = [];
          response.on('data', chunk => chunks.push(chunk));
          response.on('end', () => resolve(Buffer.concat(chunks)));
          response.on('error', reject);
        }).on('error', reject);
      });
    };

    for (const photo of favorites) {
      const buffer = await downloadFile(photo.url);
      archive.append(buffer, { name: photo.filename });
    }

    await archive.finalize();

  } catch (err) {
    console.error('Erreur ZIP:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

module.exports = router;