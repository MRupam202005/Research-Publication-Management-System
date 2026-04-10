const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadDataset } = require('../controllers/datasetController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const upload = multer({ dest: '../tmp/' });

// Allow Admin and Librarian to upload datasets
router.post('/upload', authenticate, authorizeRoles('Administrator', 'Librarian'), upload.single('file'), uploadDataset);

module.exports = router;
