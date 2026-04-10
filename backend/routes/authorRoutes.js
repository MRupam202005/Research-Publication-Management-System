const express = require('express');
const {
  listAuthors,
  getAuthor,
  createAuthorHandler,
  updateAuthorHandler,
  deleteAuthorHandler,
  listAuthorPublications,
  getCollaborationRecommendations,
} = require('../controllers/authorController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authenticate, listAuthors);
router.get('/:id', authenticate, getAuthor);
router.get('/:id/publications', authenticate, listAuthorPublications);
router.get('/:id/recommendations', authenticate, getCollaborationRecommendations);

router.post(
  '/',
  authenticate,
  authorizeRoles('Administrator', 'Librarian'),
  createAuthorHandler,
);

router.put(
  '/:id',
  authenticate,
  authorizeRoles('Administrator', 'Librarian'),
  updateAuthorHandler,
);

router.delete(
  '/:id',
  authenticate,
  authorizeRoles('Administrator', 'Librarian'),
  deleteAuthorHandler,
);

module.exports = router;

