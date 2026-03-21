const {
  getCitationsForPublication,
  getCitationCount,
  createCitation,
  deleteCitation,
} = require('../models/citationModel');

const listCitations = async (req, res, next) => {
  try {
    const { paperId } = req.params;
    const citations = await getCitationsForPublication(paperId);
    return res.json(citations);
  } catch (err) {
    return next(err);
  }
};

const getCitationCountHandler = async (req, res, next) => {
  try {
    const { paperId } = req.params;
    const count = await getCitationCount(paperId);
    return res.json({ count });
  } catch (err) {
    return next(err);
  }
};

const addCitation = async (req, res, next) => {
  try {
    const { citing_paper_id, cited_paper_id } = req.body;

    if (!citing_paper_id || !cited_paper_id) {
      return res.status(400).json({ message: 'Both citing_paper_id and cited_paper_id are required' });
    }

    const newCitation = await createCitation(citing_paper_id, cited_paper_id);
    return res.status(201).json(newCitation);
  } catch (err) {
    if (err.message === 'DUPLICATE_CITATION') {
      return res.status(409).json({ message: 'Citation already exists' });
    }
    return next(err);
  }
};

const removeCitation = async (req, res, next) => {
  try {
    const { publicationId, citedPublicationId } = req.params;
    await deleteCitation(publicationId, citedPublicationId);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  listCitations,
  getCitationCountHandler,
  addCitation,
  removeCitation,
};
