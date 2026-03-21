const express = require('express');
const router = express.Router();
const {
  listAgencies,
  createAgency,
  assignFunding,
  listAgencyPapers,
  fundingReport,
} = require('../controllers/fundingController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', authenticate, listAgencies);
router.post('/', authenticate, authorizeRoles('Administrator', 'Librarian'), createAgency);
router.post('/assign', authenticate, authorizeRoles('Administrator', 'Librarian'), assignFunding);
router.get('/report', authenticate, fundingReport);
router.get('/:id/papers', authenticate, listAgencyPapers);

module.exports = router;
