const express = require('express');
const {
  hIndexAnalytics,
  citationsAnalytics,
  getAuthorAnalytics,
  getSelfCitationsHandler,
} = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// h-index, i10-index, total citations
router.get('/hindex', authenticate, hIndexAnalytics);

// citation breakdown, collaboration, department stats
router.get('/citations', authenticate, citationsAnalytics);

// Impact metrics for a specific author
router.get('/author/:id', authenticate, getAuthorAnalytics);

// Self-citations logic lookup
router.get('/self-citations/:authorId', authenticate, getSelfCitationsHandler);

module.exports = router;

