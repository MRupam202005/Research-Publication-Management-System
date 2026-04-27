const { query } = require('../config/db');

// Retrieves publications with optional filtering (keyword and year).
// Uses LEFT JOINs to fetch associated journal information (from 'journals' table)
// and to aggregate citation counts (from 'citations' table).
// LEFT JOIN ensures that even if a paper has NO journal or NO citations, it is still retrieved.
// The subquery 'c' groups and counts citations for a paper (Aggregate Function).
const getAllPublications = async (keyword, year) => {
  let baseQuery = `
    SELECT p.paper_id,
           p.title,
           p.abstract,
           p.doi,
           p.publication_year,
           p.journal_id,
           p.journal,
           p.conference,
           p.keywords,
           p.pdf_url,
           j.name AS journal_name,
            j.publisher,
            COALESCE(c.citation_count, 0) AS citation_count
     FROM papers p
     LEFT JOIN journals j ON p.journal_id = j.journal_id
     LEFT JOIN (
       SELECT cited_paper_id, COUNT(*) AS citation_count
       FROM citations
       GROUP BY cited_paper_id
     ) c ON p.paper_id = c.cited_paper_id
  `;

  const params = [];
  const conditions = [];

  // Dynamic parameterized query building for search criteria.
  if (keyword) {
    params.push(`%${keyword}%`);
    conditions.push(`(p.title ILIKE $${params.length} OR p.abstract ILIKE $${params.length} OR p.keywords ILIKE $${params.length})`);
  }

  if (year) {
    params.push(year);
    conditions.push(`p.publication_year = $${params.length}`);
  }

  if (conditions.length > 0) {
    baseQuery += ` WHERE ` + conditions.join(' AND ');
  }

  baseQuery += ` ORDER BY p.publication_year DESC, p.title ASC`;

  const result = await query(baseQuery, params);
  return result.rows;
};

// Fetches a single publication by ID along with its journal details.
// Database Normalization (3NF) states that non-key attributes must depend only on the primary key.
// Instead of storing journal_name in 'papers', we store journal_id and look it up here via JOIN.
const getPublicationById = async (paperId) => {
  const result = await query(
    `SELECT p.paper_id,
            p.title,
            p.abstract,
            p.doi,
            p.publication_year,
            p.journal_id,
            p.journal,
            p.conference,
            p.keywords,
            p.pdf_url,
            j.name AS journal_name,
            j.publisher
     FROM papers p
     LEFT JOIN journals j ON p.journal_id = j.journal_id
     WHERE p.paper_id = $1`,
    [paperId],
  );
  return result.rows[0];
};

const checkPublicationExists = async (title, doi) => {
  if (doi) {
    const res = await query('SELECT paper_id FROM papers WHERE doi = $1 LIMIT 1', [doi]);
    if (res.rows.length > 0) return true;
  }
  const res = await query('SELECT paper_id FROM papers WHERE title = $1 LIMIT 1', [title]);
  return res.rows.length > 0;
};

const createPublication = async ({
  title,
  abstract,
  doi,
  publication_year,
  journal_id: journalId,
  journal,
  conference,
  keywords,
  pdf_url,
}) => {
  const result = await query(
    `INSERT INTO papers (title, abstract, doi, publication_year, journal_id, journal, conference, keywords, pdf_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING paper_id, title, abstract, doi, publication_year, journal_id, journal, conference, keywords, pdf_url`,
    [title, abstract, doi, publication_year, journalId, journal, conference, keywords, pdf_url],
  );
  return result.rows[0];
};

const updatePublication = async (paperId, {
  title,
  abstract,
  doi,
  publication_year,
  journal_id: journalId,
  journal,
  conference,
  keywords,
  pdf_url,
}) => {
  const result = await query(
    `UPDATE papers
     SET title = $1,
         abstract = $2,
         doi = $3,
         publication_year = $4,
         journal_id = $5,
         journal = $6,
         conference = $7,
         keywords = $8,
         pdf_url = $9
     WHERE paper_id = $10
     RETURNING paper_id, title, abstract, doi, publication_year, journal_id, journal, conference, keywords, pdf_url`,
    [title, abstract, doi, publication_year, journalId, journal, conference, keywords, pdf_url, paperId],
  );
  return result.rows[0];
};

// Deletes a publication and cleans up dependent records.
// This is required to maintain Referential Integrity if ON DELETE CASCADE is not set on the foreign keys.
const deletePublication = async (paperId) => {
  // First, delete tracking records in related bridging tables.
  await query('DELETE FROM citations WHERE citing_paper_id = $1 OR cited_paper_id = $1', [paperId]);
  await query('DELETE FROM paperauthors WHERE paper_id = $1', [paperId]);
  
  // Finally, delete the actual parent record.
  await query('DELETE FROM papers WHERE paper_id = $1', [paperId]);
};

module.exports = {
  getAllPublications,
  getPublicationById,
  createPublication,
  updatePublication,
  deletePublication,
  checkPublicationExists,
};

