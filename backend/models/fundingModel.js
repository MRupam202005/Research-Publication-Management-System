const { query } = require('../config/db');

/**
 * FUNDING MODEL
 * 
 * Handles database operations for the Research Funding module.
 * 1. PERSISTENCE (Frontend -> DB): Inserting agencies and linking grants.
 * 2. RETRIEVAL (DB -> Frontend): Fetching agencies and calculating aggregated reports.
 * 
 * Uses Parameterized Queries ($1, $2) and Table JOINs to maintain 3NF standards.
 */

const getAllFundingAgencies = async () => {
  const result = await query(
    `SELECT agency_id, name, type, location FROM funding_agencies ORDER BY name ASC`
  );
  return result.rows;
};

const checkAgencyExists = async (name) => {
  const result = await query(
    `SELECT agency_id FROM funding_agencies WHERE name ILIKE $1`,
    [name]
  );
  return result.rows.length > 0;
};

const createFundingAgency = async ({ name, type, location }) => {
  const result = await query(
    `INSERT INTO funding_agencies (name, type, location)
     VALUES ($1, $2, $3)
     RETURNING agency_id, name, type, location`,
    [name, type, location]
  );
  return result.rows[0];
};

// Links a paper to a funding agency, establishing a Many-to-Many relationship.
// 'paper_funding' acts as the associative (bridging) entity.
const linkPaperToFunding = async ({ paperId, agencyId, amount, grantNumber }) => {
  const result = await query(
    // Uses ON CONFLICT (an Upsert) to either link the paper to the funding agency
    // or update the amount and grant number if the link already exists.
    // This requires a UNIQUE constraint on (paper_id, agency_id) in the database schema.
    `INSERT INTO paper_funding (paper_id, agency_id, amount, grant_number)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (paper_id, agency_id) 
     DO UPDATE SET amount = EXCLUDED.amount, grant_number = EXCLUDED.grant_number
     RETURNING paper_id, agency_id, amount, grant_number`,
    [paperId, agencyId, amount, grantNumber]
  );
  return result.rows[0];
};

const getPapersByFunding = async (agencyId) => {
  const result = await query(
    `SELECT p.*, pf.amount, pf.grant_number
     FROM papers p
     JOIN paper_funding pf ON p.paper_id = pf.paper_id
     WHERE pf.agency_id = $1`,
    [agencyId]
  );
  return result.rows;
};

// Generates an aggregated summary of funding per agency.
// Demonstrates GROUP BY to collapse multiple funding records into single agency summaries,
// and uses SUM() and COUNT() aggregate functions.
const getFundingSummary = async () => {
  const result = await query(
    `SELECT fa.name AS agency_name, COUNT(pf.paper_id) AS total_papers, SUM(pf.amount) AS total_funding
     FROM funding_agencies fa
     LEFT JOIN paper_funding pf ON fa.agency_id = pf.agency_id
     GROUP BY fa.agency_id, fa.name
     ORDER BY total_funding DESC NULLS LAST`
  );
  return result.rows;
};

module.exports = {
  getAllFundingAgencies,
  checkAgencyExists,
  createFundingAgency,
  linkPaperToFunding,
  getPapersByFunding,
  getFundingSummary,
};
