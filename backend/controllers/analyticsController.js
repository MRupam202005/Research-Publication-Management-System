const {
  getCitationCountsPerPaper,
  getDepartmentPublicationStats,
  getGlobalTotalCitations,
  getMostCitedPaper,
  getAuthorAnalyticsData,
  getSelfCitations,
  getBipartiteGraphData,
} = require('../models/analyticsModel');
const {
  calculateHIndex,
  calculateI10Index,
  calculateTotalCitations,
} = require('../utils/analyticsUtils');
const { getCoauthorNetwork } = require('../models/authorModel');

const hIndexAnalytics = async (req, res, next) => {
  try {
    const citationsPerPaper = await getCitationCountsPerPaper();
    const hIndex = calculateHIndex(citationsPerPaper);
    const i10Index = calculateI10Index(citationsPerPaper);
    const totalCitations = calculateTotalCitations(citationsPerPaper);

    return res.json({
      hIndex,
      i10Index,
      totalCitations,
      perPaper: citationsPerPaper,
    });
  } catch (err) {
    return next(err);
  }
};

const citationsAnalytics = async (req, res, next) => {
  try {
    const perPaper = await getCitationCountsPerPaper();
    const perDepartment = await getDepartmentPublicationStats();
    const coauthorPairs = await getCoauthorNetwork();
    
    // New additions
    const total_citations = await getGlobalTotalCitations();
    const most_cited_paper = await getMostCitedPaper();

    return res.json({
      total_citations,
      most_cited_paper,
      perPaper,
      perDepartment,
      coauthorPairs,
    });
  } catch (err) {
    return next(err);
  }
};

const getAuthorAnalytics = async (req, res, next) => {
  try {
    const { id: authorId } = req.params;
    
    // Fetch paper-level citations specific to this author
    const authorPapers = await getAuthorAnalyticsData(authorId);

    if (!authorPapers || authorPapers.length === 0) {
      return res.status(404).json({ message: 'No papers found for this author' });
    }

    // Reuse the existing analyticsUtils functions
    const h_index = calculateHIndex(authorPapers);
    const i10_index = calculateI10Index(authorPapers);
    const total_citations = calculateTotalCitations(authorPapers);
    const total_papers = authorPapers.length;

    return res.json({
      h_index,
      i10_index,
      total_citations,
      total_papers,
    });
  } catch (err) {
    return next(err);
  }
};

const getSelfCitationsHandler = async (req, res, next) => {
  try {
    const { authorId } = req.params;
    const citations = await getSelfCitations(authorId);

    return res.json({
      count: citations.length,
      papers: citations,
    });
  } catch (err) {
    return next(err);
  }
};

const getBipartiteGraph = async (req, res, next) => {
  try {
    const data = await getBipartiteGraphData();
    
    // Process SQL results into nodes and edges
    const authorsMap = new Map();
    const keywordsMap = new Map();
    const edges = [];
    
    data.forEach(row => {
      // Add Author Node
      if (!authorsMap.has(row.author_id)) {
        authorsMap.set(row.author_id, { id: `A-${row.author_id}`, label: row.author_name, group: 'author' });
      }
      
      if (row.keywords) {
        // Split comma-separated keywords
        const kws = row.keywords.split(',').map(kw => kw.trim().toLowerCase()).filter(Boolean);
        kws.forEach(kw => {
          // Add Keyword Node
          if (!keywordsMap.has(kw)) {
            keywordsMap.set(kw, { id: `K-${kw}`, label: kw, group: 'keyword' });
          }
          // Add Edge
          edges.push({ source: `A-${row.author_id}`, target: `K-${kw}` });
        });
      }
    });

    return res.json({
      nodes: [...Array.from(authorsMap.values()), ...Array.from(keywordsMap.values())],
      links: edges,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  hIndexAnalytics,
  citationsAnalytics,
  getAuthorAnalytics,
  getSelfCitationsHandler,
  getBipartiteGraph,
};

