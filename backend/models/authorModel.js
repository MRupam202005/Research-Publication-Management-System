const { query } = require('../config/db');

const getAllAuthors = async () => {
  const result = await query(
    `SELECT a.author_id,
            a.name,
            a.orcid,
            a.affiliation,
            a.department,
            a.email,
            a.research_interests
     FROM authors a
     ORDER BY a.name ASC`,
  );
  return result.rows;
};

const getAuthorById = async (authorId) => {
  const result = await query(
    `SELECT a.author_id,
            a.name,
            a.orcid,
            a.affiliation,
            a.department,
            a.email,
            a.research_interests
     FROM authors a
     WHERE a.author_id = $1`,
    [authorId],
  );
  return result.rows[0];
};

const createAuthor = async ({ name, orcid, affiliation, department, email, research_interests }) => {
  const result = await query(
    `INSERT INTO authors (name, orcid, affiliation, department, email, research_interests)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING author_id, name, orcid, affiliation, department, email, research_interests`,
    [name, orcid, affiliation, department, email, research_interests],
  );
  return result.rows[0];
};

const updateAuthor = async (authorId, { name, orcid, affiliation, department, email, research_interests }) => {
  const result = await query(
    `UPDATE authors
     SET name = $1,
         orcid = $2,
         affiliation = $3,
         department = $4,
         email = $5,
         research_interests = $6
     WHERE author_id = $7
     RETURNING author_id, name, orcid, affiliation, department, email, research_interests`,
    [name, orcid, affiliation, department, email, research_interests, authorId],
  );
  return result.rows[0];
};

const deleteAuthor = async (authorId) => {
  await query('DELETE FROM authors WHERE author_id = $1', [authorId]);
};

const getPublicationsByAuthor = async (authorId) => {
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
            p.pdf_url
     FROM papers p
     JOIN paperauthors pa ON p.paper_id = pa.paper_id
     WHERE pa.author_id = $1
     ORDER BY p.publication_year DESC`,
    [authorId],
  );
  return result.rows;
};

const getCoauthorNetwork = async () => {
  const result = await query(
    `SELECT pa1.author_id AS author_id,
            pa2.author_id AS coauthor_id
     FROM paperauthors pa1
     JOIN paperauthors pa2
       ON pa1.paper_id = pa2.paper_id
      AND pa1.author_id <> pa2.author_id`,
  );
  return result.rows;
};

const suggestCollaborations = async (authorId) => {
  const result = await query(
    `WITH direct_coauthors AS (
      SELECT DISTINCT pa2.author_id
      FROM paperauthors pa1
      JOIN paperauthors pa2 ON pa1.paper_id = pa2.paper_id
      WHERE pa1.author_id = $1 AND pa2.author_id != $1
    )
    SELECT DISTINCT a.author_id, a.name, a.affiliation, a.department, COUNT(pa2.paper_id) AS mutual_connections
    FROM paperauthors pa1
    JOIN paperauthors pa2 ON pa1.paper_id = pa2.paper_id
    JOIN authors a ON pa2.author_id = a.author_id
    WHERE pa1.author_id IN (SELECT author_id FROM direct_coauthors)
      AND pa2.author_id != $1
      AND pa2.author_id NOT IN (SELECT author_id FROM direct_coauthors)
    GROUP BY a.author_id, a.name, a.affiliation, a.department
    ORDER BY mutual_connections DESC
    LIMIT 10`,
    [authorId]
  );
  return result.rows;
};

module.exports = {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
  getPublicationsByAuthor,
  getCoauthorNetwork,
  suggestCollaborations,
};

