const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  galleryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gallery', required: true },
  filename: { type: String, required: true },
  url: { type: String, required: true },
  isFavorite: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Photo', photoSchema);