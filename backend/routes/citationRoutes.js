const express = require('express');
const {
  listCitations,
  getCitationCountHandler,
  addCitation,
  removeCitation,
} = require('../controllers/citationController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:paperId', authenticate, listCitations);
router.get('/count/:paperId', authenticate, getCitationCountHandler);

router.post(
  '/',
  authenticate,
  authorizeRoles('Researcher', 'Administrator'),
  addCitation
);

// Kept this for clean deletions just in case, mapped safely onto root
router.delete(
  '/:publicationId/cited/:citedPublicationId',
  authenticate,
  authorizeRoles('Administrator'),
  removeCitation
);

module.exports = router;
