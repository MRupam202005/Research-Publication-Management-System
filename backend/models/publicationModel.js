const { query } = require('../config/db');

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

const deletePublication = async (paperId) => {
  await query('DELETE FROM citations WHERE citing_paper_id = $1 OR cited_paper_id = $1', [paperId]);
  await query('DELETE FROM paperauthors WHERE paper_id = $1', [paperId]);
  await query('DELETE FROM papers WHERE paper_id = $1', [paperId]);
};

module.exports = {
  getAllPublications,
  getPublicationById,
  createPublication,
  updatePublication,
  deletePublication,
};

