const { query } = require('../config/db');

// Retrieves all authors from the 'authors' table.
// This table is in 1st Normal Form (1NF) as each attribute contains atomic values (e.g., no comma-separated lists of interests).
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

const checkAuthorExists = async (name, orcid) => {
  if (orcid) {
    const res = await query('SELECT author_id FROM authors WHERE orcid = $1 LIMIT 1', [orcid]);
    if (res.rows.length > 0) return true;
  }
  const res = await query('SELECT author_id FROM authors WHERE name = $1 LIMIT 1', [name]);
  return res.rows.length > 0;
};

// Inserts a new author into the database.
// Uses parameterized queries ($1, $2, etc.) to prevent SQL Injection attacks.
const createAuthor = async ({ name, orcid, affiliation, department, email, research_interests }) => {
  const result = await query(
    `INSERT INTO authors (name, orcid, affiliation, department, email, research_interests)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING author_id, name, orcid, affiliation, department, email, research_interests`,
  // The RETURNING clause immediately fetches the generated author_id without a second SELECT query.
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

// Fetches all publications authored by a specific author.
// This query demonstrates a Many-to-Many relationship resolution.
// It JOINs the primary 'papers' table with the bridging 'paperauthors' table.
// 'paperauthors' stores (paper_id, author_id) eliminating data redundancy (3NF).
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

// Complex Subquery / CTE (Common Table Expression).
// Finds mutual coauthors to suggest new collaborations.
// Uses a WITH clause (CTE) 'direct_coauthors' to first find everyone the author has directly worked with.
// Then it queries for authors who have worked with those direct connections, but NOT the author themselves.
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
  checkAuthorExists,
};

