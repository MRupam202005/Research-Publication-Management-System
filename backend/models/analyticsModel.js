const { query } = require('../config/db');

const getCitationCountsPerPaper = async () => {
  const result = await query(
    `SELECT p.paper_id,
            p.title,
            COUNT(c.cited_paper_id) AS citation_count
     FROM papers p
     LEFT JOIN citations c ON p.paper_id = c.cited_paper_id
     GROUP BY p.paper_id, p.title
     ORDER BY citation_count DESC`,
  );
  return result.rows;
};

const getDepartmentPublicationStats = async () => {
  const result = await query(
    `SELECT a.affiliation AS department,
            COUNT(DISTINCT pa.paper_id) AS publication_count
     FROM authors a
     JOIN paperauthors pa ON a.author_id = pa.author_id
     GROUP BY a.affiliation
     ORDER BY publication_count DESC`,
  );
  return result.rows;
};

const getGlobalTotalCitations = async () => {
  const result = await query('SELECT COUNT(*) AS total FROM citations');
  return parseInt(result.rows[0].total, 10);
};

const getMostCitedPaper = async () => {
  const result = await query(
    `SELECT p.paper_id,
            p.title,
            COUNT(c.citation_id) AS citation_count
     FROM papers p
     JOIN citations c ON p.paper_id = c.cited_paper_id
     GROUP BY p.paper_id, p.title
     ORDER BY citation_count DESC
     LIMIT 1`
  );
  return result.rows[0] || null;
};

const getAuthorAnalyticsData = async (authorId) => {
  const result = await query(
    `SELECT p.paper_id,
            p.title,
            COUNT(c.citation_id) AS citation_count
     FROM papers p
     JOIN paperauthors pa ON p.paper_id = pa.paper_id
     LEFT JOIN citations c ON p.paper_id = c.cited_paper_id
     WHERE pa.author_id = $1
     GROUP BY p.paper_id, p.title
     ORDER BY citation_count DESC`,
    [authorId]
  );
  return result.rows;
};

const getSelfCitations = async (authorId) => {
  const result = await query(
    `SELECT c.citation_id,
            c.citing_paper_id,
            p1.title AS citing_title,
            c.cited_paper_id,
            p2.title AS cited_title
     FROM citations c
     JOIN paperauthors pa_citing ON c.citing_paper_id = pa_citing.paper_id
     JOIN paperauthors pa_cited ON c.cited_paper_id = pa_cited.paper_id
     JOIN papers p1 ON c.citing_paper_id = p1.paper_id
     JOIN papers p2 ON c.cited_paper_id = p2.paper_id
     WHERE pa_citing.author_id = $1 AND pa_cited.author_id = $1`,
    [authorId]
  );
  return result.rows;
};

module.exports = {
  getCitationCountsPerPaper,
  getDepartmentPublicationStats,
  getGlobalTotalCitations,
  getMostCitedPaper,
  getAuthorAnalyticsData,
  getSelfCitations,
};
