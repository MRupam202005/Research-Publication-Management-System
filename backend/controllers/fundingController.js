const {
  getAllFundingAgencies,
  createFundingAgency,
  linkPaperToFunding,
  getPapersByFunding,
  getFundingSummary,
} = require('../models/fundingModel');

const listAgencies = async (req, res, next) => {
  try {
    const agencies = await getAllFundingAgencies();
    res.json(agencies);
  } catch (err) {
    next(err);
  }
};

const createAgency = async (req, res, next) => {
  try {
    const { name, type, location } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Agency name is required' });
    }
    const agency = await createFundingAgency({ name, type, location });
    res.status(201).json(agency);
  } catch (err) {
    next(err);
  }
};

const assignFunding = async (req, res, next) => {
  try {
    const { paperId, agencyId, amount, grantNumber } = req.body;
    if (!paperId || !agencyId) {
      return res.status(400).json({ message: 'Paper ID and Agency ID are required' });
    }
    const assignment = await linkPaperToFunding({ paperId, agencyId, amount, grantNumber });
    res.status(201).json(assignment);
  } catch (err) {
    next(err);
  }
};

const listAgencyPapers = async (req, res, next) => {
  try {
    const { id } = req.params;
    const papers = await getPapersByFunding(id);
    res.json(papers);
  } catch (err) {
    next(err);
  }
};

const fundingReport = async (req, res, next) => {
  try {
    const summary = await getFundingSummary();
    res.json(summary);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listAgencies,
  createAgency,
  assignFunding,
  listAgencyPapers,
  fundingReport,
};
