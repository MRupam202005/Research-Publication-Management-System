const express = require('express');
const {
  listPublications,
  createPublicationHandler,
  updatePublicationHandler,
  deletePublicationHandler,
} = require('../controllers/publicationController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');
const { validatePublication } = require('../middleware/validationMiddleware');

const router = express.Router();

router.get('/', authenticate, listPublications);

router.post(
  '/',
  authenticate,
  authorizeRoles('Researcher', 'Administrator'),
  validatePublication,
  createPublicationHandler,
);

router.put(
  '/:id',
  authenticate,
  authorizeRoles('Researcher', 'Administrator'),
  updatePublicationHandler,
);

router.delete(
  '/:id',
  authenticate,
  authorizeRoles('Administrator'),
  deletePublicationHandler,
);

module.exports = router;

