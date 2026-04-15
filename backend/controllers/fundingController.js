/**
 * FUNDING CONTROLLER
 * 
 * Manages the Many-to-Many (M:N) relationship between Publications and Funding Agencies.
 * This is crucial for tracking which research grants sponsored which papers.
 */
const {
  getAllFundingAgencies,
  createFundingAgency,
  linkPaperToFunding,
  getPapersByFunding,
  getFundingSummary,
} = require('../models/fundingModel');

/**
 * DATA RETRIEVAL: FETCHING SYSTEM ENTITIES
 * 1. Frontend requests available funding agencies (DB -> Frontend).
 * 2. Controller retrieves raw rows from 'funding_agencies' table.
 * 3. These are used in the UI to populate selection dropdowns for linking.
 */
const listAgencies = async (req, res, next) => {
  try {
    const agencies = await getAllFundingAgencies();
    res.json(agencies);
  } catch (err) {
    next(err);
  }
};

/**
 * DATA PERSISTENCE: CREATING NEW ENTITIES
 * 1. Frontend submits Name, Type, Location for a new sponsor.
 * 2. Model performs INSERT INTO funding_agencies.
 */
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

/**
 * BRIDGING TABLE DATA FLOW (Frontend -> DB)
 * 1. User selects a Paper and an Agency in the Frontend.
 * 2. Data is sent to this handler to link them in the 'paper_funding' bridging table.
 * 3. This resolves the Many-to-Many relationship (3NF Compliance).
 */
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

/**
 * DATA ANALYTICS FLOW: FUNDING REPORT
 * 1. Controller calls 'getFundingSummary'.
 * 2. Database uses Aggregation (SUM, COUNT, LEFT JOIN) to calculate totals.
 * 3. Results are sent to the Frontend to render the "Funding Distribution" Bar Chart.
 */
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
