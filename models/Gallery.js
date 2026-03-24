const mongoose = require('mongoose');
const crypto = require('crypto');

const gallerySchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  uniqueUrl: { type: String, default: () => crypto.randomBytes(8).toString('hex') },
  photographerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isProtected: { type: Boolean, default: false },
  password: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Gallery', gallerySchema);