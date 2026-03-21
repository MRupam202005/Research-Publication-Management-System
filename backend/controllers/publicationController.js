const {
  getAllPublications,
  getPublicationById,
  createPublication,
  updatePublication,
  deletePublication,
} = require('../models/publicationModel');

const listPublications = async (req, res, next) => {
  try {
    const { keyword, year } = req.query;
    const publications = await getAllPublications(keyword, year);
    return res.json(publications);
  } catch (err) {
    return next(err);
  }
};

const createPublicationHandler = async (req, res, next) => {
  try {
    const {
      title, abstract, doi, publication_year, journal_id: journalId,
      journal, conference, keywords, pdf_url,
    } = req.body;

    if (!title || !publication_year) {
      return res.status(400).json({ message: 'Title and publication_year are required' });
    }

    const publication = await createPublication({
      title,
      abstract,
      doi,
      publication_year,
      journal_id: journalId,
      journal,
      conference,
      keywords,
      pdf_url,
    });

    return res.status(201).json(publication);
  } catch (err) {
    return next(err);
  }
};

const updatePublicationHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await getPublicationById(id);

    if (!existing) {
      return res.status(404).json({ message: 'Publication not found' });
    }

    const {
      title = existing.title,
      abstract = existing.abstract,
      doi = existing.doi,
      publication_year = existing.publication_year,
      journal_id: journalId = existing.journal_id,
      journal = existing.journal,
      conference = existing.conference,
      keywords = existing.keywords,
      pdf_url = existing.pdf_url,
    } = req.body;

    const updated = await updatePublication(id, {
      title,
      abstract,
      doi,
      publication_year,
      journal_id: journalId,
      journal,
      conference,
      keywords,
      pdf_url,
    });

    return res.json(updated);
  } catch (err) {
    return next(err);
  }
};

const deletePublicationHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await getPublicationById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Publication not found' });
    }
    await deletePublication(id);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  listPublications,
  createPublicationHandler,
  updatePublicationHandler,
  deletePublicationHandler,
};

