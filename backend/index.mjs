import pc from 'picocolors';
import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import multer, { MulterError } from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// 1. Load environment variables
dotenv.config();

// 2. Critical environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'gallery_secret_key_2026';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH =
  process.env.ADMIN_PASSWORD_HASH || bcrypt.hashSync('admin123', 10);
const PORT = process.env.PORT ?? 4000;
const MONGO_URI =
  process.env.MONGO_URI ||
  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@gallerys.9sx0zrt.mongodb.net/?retryWrites=true&w=majority&appName=Gallerys&authMechanism=DEFAULT`;

// 3. Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
  timeout: 120000,
});

// 4. Multer/Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isSettings = req.path.includes('settings');
    const isVideo = file.mimetype.startsWith('video');
    let folder = 'Miguels_gallery/images';
    if (isSettings) folder = 'Miguels_gallery/settings';
    else if (isVideo) folder = 'Miguels_gallery/videos';
    return {
      folder: folder,
      resource_type: 'auto',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'mp4', 'mov', 'webm'],
      image_metadata: true,
    };
  },
});

// Multer limit: 100MB (max allowed for videos)
const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 },
});

// 5. App Setup
const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// 6. DB State
let dbClient, photosCollection, settingsCollection;

// 7. Initialization Logic
const initSettings = async () => {
  const count = await settingsCollection.countDocuments();
  if (count === 0) {
    await settingsCollection.insertOne({
      key: 'global',
      profileImgTop: '/assets/Gemini_Generated_Image_mos68wmos68wmos6.png',
      profileImgTopId: '',
      profileImgBottom: '/assets/Gemini_Generated_Image_mos68wmos68wmos6.png',
      profileImgBottomId: '',
      parallaxBgTop: '',
      parallaxBgTopId: '',
      parallaxTypeTop: 'image',
      parallaxBgBottom: '',
      parallaxBgBottomId: '',
      parallaxTypeBottom: 'image',
    });
  }
};

let lastSyncReport = {
  timestamp: null,
  detected: [],
  gallery: [],
  synced: [],
  errors: [],
};

async function syncCloudinaryPhotos() {
  const report = {
    timestamp: new Date().toISOString(),
    detected: [],
    gallery: [],
    synced: [],
    errors: [],
  };
  try {
    console.log(pc.cyan('🔄 INICIANDO ESCANEO MAESTRO DE PROYECTO...'));
    await photosCollection.createIndex({ cloudinaryId: 1 }, { unique: true });

    const fetchAll = async (type) => {
      let results = [];
      let nextCursor = null;
      do {
        const res = await cloudinary.api.resources({
          resource_type: type,
          max_results: 500,
          next_cursor: nextCursor,
        });
        results = results.concat(res.resources || []);
        nextCursor = res.next_cursor;
      } while (nextCursor);
      return results;
    };

    // 1. Fetch EVERYTHING
    const [images, videos, raws] = await Promise.all([
      fetchAll('image'),
      fetchAll('video'),
      fetchAll('raw'),
    ]);
    const all = [...images, ...videos, ...raws];

    // 2. De-duplicate
    const unique = Array.from(
      new Map(all.map((item) => [item.public_id, item])).values(),
    );
    report.detected = unique.map((r) => `[${r.resource_type}] ${r.public_id}`);

    // 3. FILTER: Include all except settings
    const galleryAssets = unique.filter(
      (res) => !res.public_id.toLowerCase().includes('/settings/'),
    );

    report.gallery = galleryAssets.map((r) => r.public_id);
    console.log(
      pc.yellow(
        `🔍 Cloudinary reportó ${unique.length} archivos totales. Procesando ${galleryAssets.length} activos.`,
      ),
    );

    const lastPhoto = await photosCollection.findOne(
      {},
      { sort: { position: -1 } },
    );
    let currentNextPos = lastPhoto ? lastPhoto.position + 1 : 0;

    // 4. SEQUENTIAL Processing for maximum reliability
    for (const res of galleryAssets) {
      try {
        const isVideo =
          res.resource_type === 'video' ||
          res.public_id.toLowerCase().endsWith('.mp4') ||
          res.public_id.toLowerCase().endsWith('.mov');
        const existing = await photosCollection.findOne({
          cloudinaryId: res.public_id,
        });

        let details = null;
        // Always fetch details if metadata is incomplete (especially aperture)
        if (!existing || !existing.metadata || !existing.metadata.aperture) {
          details = await cloudinary.api.resource(res.public_id, {
            image_metadata: true,
            resource_type: res.resource_type,
          });
        }

        const meta = details?.image_metadata || {};
        const position = existing ? existing.position : currentNextPos++;

        const data = {
          cloudinaryId: res.public_id,
          resourceType: isVideo ? 'video' : 'image',
          status: existing ? existing.status || 'published' : 'pending',
          title:
            existing?.title || res.public_id.split('/').pop().split('.')[0],
          description: existing?.description || 'Detectado automáticamente',
          category: existing?.category || 'General',
          img: res.secure_url,
          orientation:
            details?.width > (details?.height || 0) ? 'horizontal' : 'vertical',
          createdAt: new Date(res.created_at),
          position: position,
          metadata: {
            iso: meta.ISO || details?.exif?.ISO || existing?.metadata?.iso,
            shutterSpeed:
              meta.ShutterSpeed ||
              details?.exif?.ExposureTime ||
              existing?.metadata?.shutterSpeed,
            aperture:
              meta.Aperture ||
              meta.FNumber ||
              details?.exif?.FNumber ||
              details?.exif?.ApertureValue ||
              existing?.metadata?.aperture,
            focalLength:
              meta.FocalLength ||
              details?.exif?.FocalLength ||
              existing?.metadata?.focalLength,
            camera:
              meta.Model || details?.exif?.Model || existing?.metadata?.camera,
            location:
              meta.Location ||
              details?.exif?.Location ||
              existing?.metadata?.location ||
              'Unknown',
          },
        };

        await photosCollection.updateOne(
          { cloudinaryId: res.public_id },
          { $set: data },
          { upsert: true },
        );
        report.synced.push(res.public_id);
      } catch (e) {
        report.errors.push(`${res.public_id}: ${e.message}`);
        console.error(pc.red(`   ❌ Error en ${res.public_id}:`), e.message);
      }
    }

    lastSyncReport = report;
    console.log(
      pc.green(`✅ Sync Finalizada: ${report.synced.length} archivos en DB.`),
    );
    return report;
  } catch (err) {
    console.error(pc.red('❌ Sync Error:'), err.message);
    throw err;
  }
}

const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(header.split(' ')[1], JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (
    username === ADMIN_USERNAME &&
    bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)
  ) {
    return res.json({
      token: jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' }),
    });
  }
  res.status(401).json({ error: 'Credenciales inválidas' });
});

app.get('/api/ping', (req, res) => res.json({ pong: true }));

app.post('/api/photos/sync', authenticate, async (req, res) => {
  try {
    const report = await syncCloudinaryPhotos();
    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/photos/debug', authenticate, async (req, res) => {
  res.json(lastSyncReport);
});

app.get('/api/verify', authenticate, (req, res) =>
  res.json({ valid: true, user: req.user }),
);

app.get('/api/photos', async (req, res) => {
  try {
    const photos = await photosCollection
      .find({})
      .sort({ position: 1, createdAt: -1 })
      .toArray();
    res.json(photos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post(
  '/api/photos/upload',
  authenticate,
  (req, res, next) => {
    upload.array('images', 50)(req, res, (err) => {
      if (err instanceof MulterError)
        return res
          .status(400)
          .json({ error: 'Multer Error', details: err.message });
      if (err)
        return res
          .status(500)
          .json({ error: 'Upload Error', details: err.message });
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0)
        return res.status(400).json({ error: 'No files' });
      const { title, description, category, location, isFeatured, peopleTags } =
        req.body;
      const last = await photosCollection.findOne(
        {},
        { sort: { position: -1 } },
      );
      let nextPos = last ? last.position + 1 : 0;
      let parsedPeopleTags = [];
      if (peopleTags) {
        try {
          parsedPeopleTags = JSON.parse(peopleTags);
        } catch {
          /* ignore */
        }
      }

      const results = [];
      for (const file of req.files) {
        const photo = {
          cloudinaryId: file.filename,
          resourceType: file.mimetype.startsWith('video') ? 'video' : 'image',
          status: 'published',
          title:
            req.files.length === 1
              ? title || file.originalname
              : file.originalname.split('.')[0],
          description: description || '',
          category: category || 'General',
          img: file.path,
          orientation: 'horizontal',
          isFeatured: isFeatured === 'true' || isFeatured === true,
          gridSpan: { cols: 1, rows: 2 },
          peopleTags: parsedPeopleTags,
          createdAt: new Date(),
          position: nextPos++,
          metadata: { location: location || 'Unknown' },
        };
        const result = await photosCollection.insertOne(photo);
        results.push({ ...photo, _id: result.insertedId });
      }
      res.status(201).json(results);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

app.patch('/api/photos/reorder', authenticate, async (req, res) => {
  try {
    const ops = req.body.orders.map((o) => ({
      updateOne: {
        filter: { _id: new ObjectId(o.id) },
        update: { $set: { position: o.position } },
      },
    }));
    await photosCollection.bulkWrite(ops);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/photos/:id', authenticate, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      location,
      isFeatured,
      gridSpan,
      peopleTags,
      status,
    } = req.body;
    const update = {};
    if (title !== undefined) update.title = title;
    if (description !== undefined) update.description = description;
    if (category !== undefined) update.category = category;
    if (location !== undefined) {
      update['metadata.location'] = location;
    }
    if (typeof isFeatured === 'boolean') update.isFeatured = isFeatured;
    if (gridSpan) update.gridSpan = gridSpan;
    if (peopleTags !== undefined) update.peopleTags = peopleTags;
    if (status !== undefined) update.status = status;
    await photosCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: update },
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/photos/:id', authenticate, async (req, res) => {
  try {
    const photo = await photosCollection.findOne({
      _id: new ObjectId(req.params.id),
    });
    if (photo)
      await cloudinary.uploader.destroy(photo.cloudinaryId, {
        resource_type: photo.resourceType,
      });
    await photosCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/photos/batch-delete', authenticate, async (req, res) => {
  try {
    const { ids } = req.body;
    const photos = await photosCollection
      .find({ _id: { $in: ids.map((id) => new ObjectId(id)) } })
      .toArray();
    for (const photo of photos) {
      if (photo.cloudinaryId) {
        try {
          await cloudinary.uploader.destroy(photo.cloudinaryId, {
            resource_type: photo.resourceType || 'image',
          });
        } catch {
          /* ignore */
        }
      }
    }
    await photosCollection.deleteMany({
      _id: { $in: ids.map((id) => new ObjectId(id)) },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/settings', async (req, res) => {
  try {
    res.json(await settingsCollection.findOne({ key: 'global' }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/settings', authenticate, async (req, res) => {
  try {
    const update = {};
    [
      'profileImgTop',
      'profileImgTopId',
      'profileImgBottom',
      'profileImgBottomId',
      'parallaxBgTop',
      'parallaxBgTopId',
      'parallaxTypeTop',
      'parallaxBgBottom',
      'parallaxBgBottomId',
      'parallaxTypeBottom',
    ].forEach((f) => {
      if (req.body[f] !== undefined) update[f] = req.body[f];
    });
    await settingsCollection.updateOne({ key: 'global' }, { $set: update });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post(
  '/api/settings/upload',
  authenticate,
  upload.single('image'),
  async (req, res) => {
    try {
      const { field } = req.query;
      if (field) {
        const curr = await settingsCollection.findOne({ key: 'global' });
        const oldId = curr?.[`${field}Id`];
        if (oldId) {
          let resType = field.startsWith('parallaxBg')
            ? curr?.[field.replace('Bg', 'Type')] || 'image'
            : 'image';
          try {
            await cloudinary.uploader.destroy(oldId, {
              resource_type: resType,
            });
          } catch {
            /* ignore */
          }
        }
      }
      res.json({ url: req.file.path, cloudinaryId: req.file.filename });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

process.on('uncaughtException', (err) =>
  console.error(pc.red('💀 UNCAUGHT:'), err),
);
process.on('unhandledRejection', (reason) =>
  console.error(pc.red('💀 UNHANDLED:'), reason),
);

async function startServer() {
  try {
    dbClient = await MongoClient.connect(MONGO_URI);
    const db = dbClient.db('miguels_gallery_db');
    photosCollection = db.collection('photos');
    settingsCollection = db.collection('settings');
    console.log(pc.green('✅ MongoDB Connected'));
    await initSettings();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(pc.green(`🚀 Server running on port ${PORT}`));
      syncCloudinaryPhotos().catch(console.error);
    });
  } catch (err) {
    console.error(pc.red('❌ Start Error:'), err.message);
  }
}
startServer();
