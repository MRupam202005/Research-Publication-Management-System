const { query } = require('../config/db');

const getAllFundingAgencies = async () => {
  const result = await query(
    `SELECT agency_id, name, type, location FROM funding_agencies ORDER BY name ASC`
  );
  return result.rows;
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

const linkPaperToFunding = async ({ paperId, agencyId, amount, grantNumber }) => {
  const result = await query(
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
  createFundingAgency,
  linkPaperToFunding,
  getPapersByFunding,
  getFundingSummary,
};
