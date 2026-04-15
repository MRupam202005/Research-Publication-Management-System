const { query } = require('../config/db');

// Retrieves all citations for a given publication.
// The 'citations' table represents a Self-Referencing Many-to-Many Relationship.
// It links the 'papers' table to itself mapping citing_paper_id to cited_paper_id.
const getCitationsForPublication = async (publicationId) => {
  const result = await query(
    `SELECT citing_paper_id, cited_paper_id
     FROM citations
     WHERE cited_paper_id = $1`,
    [publicationId]
  );
  return result.rows;
};

const getCitationCount = async (paperId) => {
  const result = await query(
    `SELECT COUNT(*) AS count
     FROM citations
     WHERE cited_paper_id = $1`,
    [paperId]
  );
  return parseInt(result.rows[0].count, 10);
};

// Inserts a new citation link between two papers.
const createCitation = async (citingPublicationId, citedPublicationId) => {
  // First, verify that this relationship doesn't already exist to enforce uniqueness.
  // Although a UNIQUE constraint on (citing_paper_id, cited_paper_id) in the DB is best practice,
  // this application logic provides a specific error ('DUPLICATE_CITATION').
  const existing = await query(
    `SELECT 1 FROM citations WHERE citing_paper_id = $1 AND cited_paper_id = $2`,
    [citingPublicationId, citedPublicationId]
  );
  
  if (existing.rows.length > 0) {
    throw new Error('DUPLICATE_CITATION');
  }

  // Insert the relationship and return the row.
  const result = await query(
    `INSERT INTO citations (citing_paper_id, cited_paper_id)
     VALUES ($1, $2)
     RETURNING citing_paper_id, cited_paper_id`,
    [citingPublicationId, citedPublicationId]
  );
  return result.rows[0];
};

const deleteCitation = async (citingPublicationId, citedPublicationId) => {
  await query(
    `DELETE FROM citations
     WHERE citing_paper_id = $1 AND cited_paper_id = $2`,
    [citingPublicationId, citedPublicationId]
  );
};

module.exports = {
  getCitationsForPublication,
  getCitationCount,
  createCitation,
  deleteCitation,
};
