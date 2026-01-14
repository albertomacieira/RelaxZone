const path = require('path');
const fs = require('fs');
const multer = require('multer');
const router = require('express').Router();
const servicesController = require('./services.controller');
const { authenticate } = require('../../middlewares/auth');
const { requireAdmin } = require('../../middlewares/roles');
const { validateBody } = require('../../middlewares/validate');

// Upload config for service images
const uploadDir = path.join(__dirname, '../../public/uploads/services');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
	destination: (_req, _file, cb) => cb(null, uploadDir),
	filename: (_req, file, cb) => {
		const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
		const ext = path.extname(file.originalname) || '.jpg';
		cb(null, `${unique}${ext}`);
	},
});

const fileFilter = (_req, file, cb) => {
	const ok = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype);
	cb(ok ? null : new Error('Formato de imagem inválido'), ok);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', servicesController.listServices);
router.get('/popular', servicesController.listPopular);
router.get('/:serviceId', servicesController.getService);
router.post('/', authenticate, requireAdmin, upload.single('image_file'), validateBody(['name', 'duration_min', 'price_cents']), servicesController.createService);
router.patch('/:serviceId', authenticate, requireAdmin, upload.single('image_file'), servicesController.updateService);
router.delete('/:serviceId', authenticate, requireAdmin, servicesController.removeService);

module.exports = router;
