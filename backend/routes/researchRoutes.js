const express = require('express');
const router = express.Router();
const { searchRealPapers } = require('../controllers/researchController');

// Search external real-world papers (e.g. via OpenAlex)
router.get('/search', searchRealPapers);

module.exports = router;
