# 📷 Gallery API

API REST pour l'application Gallery App — gestion de galeries photos pour photographes.

🔗 **Frontend** : https://github.com/PhanDev34000/gallery-app  
🌐 **Live** : https://gallery-api-kwcx.onrender.com

---

## 🛠️ Stack Technique

- Node.js / Express.js
- MongoDB Atlas / Mongoose
- Cloudinary (stockage photos)
- JWT + Bcrypt (authentification)
- Multer (upload fichiers)
- Archiver (génération ZIP)
- Nodemailer

---

## 📡 Endpoints principaux

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | /api/auth/register | Inscription |
| POST | /api/auth/login | Connexion |
| GET | /api/galleries | Liste des galeries |
| POST | /api/galleries | Créer une galerie |
| DELETE | /api/galleries/:id | Supprimer une galerie |
| GET | /api/galleries/public/:uniqueUrl | Accès public galerie |
| POST | /api/galleries/:id/password | Définir mot de passe |
| POST | /api/photos/:galleryId | Upload photos |
| PATCH | /api/photos/:id/favorite | Toggle favori |
| GET | /api/photos/:galleryId/favorites/zip | Télécharger ZIP |

---

## 🔧 Installation locale
```bash
git clone https://github.com/PhanDev34000/gallery-api.git
cd gallery-api
npm install
```

Crée un fichier `.env` :
```
PORT=3000
MONGODB_URI=ta_uri_mongodb
JWT_SECRET=ton_secret_jwt
CLOUDINARY_CLOUD_NAME=ton_cloud_name
CLOUDINARY_API_KEY=ta_api_key
CLOUDINARY_API_SECRET=ton_api_secret
```
```bash
npm run dev
```

---

## 👤 Auteur

**Stéphane Vernière**  
🔗 GitHub : [@PhanDev34000](https://github.com/PhanDev34000)