/**
 * PUBLICATION CONTROLLER
 * 
 * This controller handles the lifecycle of Research Papers/Publications.
 * It manages searching (filtering by year/keywords) and schema-compliant data insertion.
 */
const {
  getAllPublications,
  getPublicationById,
  createPublication,
  updatePublication,
  deletePublication,
} = require('../models/publicationModel');

/**
 * DATA RETRIEVAL WITH DYNAMIC FILTERING
 * 1. Frontend sends GET /api/publications?year=2024&keyword=AI
 * 2. Controller extracts query params (req.query).
 * 3. Model builds a dynamic SQL query using JOINs to count citations from the 'citations' table.
 * 4. DB executes the query: SELECT p.*, COUNT(c.id) FROM papers JOIN citations...
 * 5. Aggregated results are sent back as JSON for the Frontend table view.
 */
const listPublications = async (req, res, next) => {
  try {
    const { keyword, year } = req.query;
    const publications = await getAllPublications(keyword, year);
    return res.json(publications);
  } catch (err) {
    return next(err);
  }
};

/**
 * SCHEMA-DRIVEN DATA INSERTION
 * 1. Frontend submits a Multi-field form (Title, Abstract, DOI, Journals, etc.)
 * 2. Controller decomposes 'req.body' into specific schema attributes.
 * 3. Model performs an INSERT INTO papers ($1, $2, ...)
 * 4. This maintains Referential Integrity as mandatory fields (Title, Year) are enforced here.
 */
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

const getPublicationHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const publication = await getPublicationById(id);
    if (!publication) {
      return res.status(404).json({ message: 'Publication not found' });
    }
    // Also fetch authors for this publication
    const { query } = require('../config/db');
    const authors = await query(
      `SELECT a.author_id, a.name 
       FROM authors a 
       JOIN paperauthors pa ON a.author_id = pa.author_id 
       WHERE pa.paper_id = $1`,
      [id]
    );
    publication.authors = authors.rows;
    return res.json(publication);
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  listPublications,
  createPublicationHandler,
  updatePublicationHandler,
  deletePublicationHandler,
  getPublicationHandler,
};

