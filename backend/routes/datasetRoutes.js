const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadDataset } = require('../controllers/datasetController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const upload = multer({ dest: '../tmp/' });

// Only Admin and Department can upload datasets
router.post('/upload', authenticate, authorizeRoles('Administrator', 'Department'), upload.single('file'), uploadDataset);

module.exports = router;
