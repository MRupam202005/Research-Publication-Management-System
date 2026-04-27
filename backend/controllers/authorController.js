/**
 * AUTHOR CONTROLLER
 * 
 * This controller manages the flow of data for Research Authors (Researchers).
 * It acts as the bridge between the Frontend (React/Next.js) and the Database (PostgreSQL).
 */
const {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
  getPublicationsByAuthor,
  getCoauthorNetwork,
  suggestCollaborations,
  checkAuthorExists,
} = require('../models/authorModel');

/**
 * DATA RETRIEVAL FLOW (DB -> Frontend)
 * 1. Frontend sends a GET request to /api/authors
 * 2. Controller calls the Model 'getAllAuthors' which executes: SELECT * FROM authors
 * 3. Database returns rows to the Model.
 * 4. Model returns array of objects to the Controller.
 * 5. Controller sends a JSON response back to the Frontend.
 */
const listAuthors = async (req, res, next) => {
  try {
    const authors = await getAllAuthors();
    return res.json(authors);
  } catch (err) {
    return next(err);
  }
};

const getAuthor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const author = await getAuthorById(id);
    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }
    return res.json(author);
  } catch (err) {
    return next(err);
  }
};

/**
 * DATA PERSISTENCE FLOW (Frontend -> DB)
 * 1. Frontend sends a POST request with Author details in JSON format (req.body).
 * 2. Controller extracts name, orcid, affiliation, etc. from req.body.
 * 3. Basic validation is performed (e.g., ensuring Name is present).
 * 4. Controller calls the Model 'createAuthor' with the sanitized data.
 * 5. Model uses Parameterized Queries (to prevent SQL Injection) to INSERT data into 'authors' table.
 * 6. Database returns the newly created Record.
 * 7. Controller returns 201 Created with the new Author object to the Frontend.
 */
const createAuthorHandler = async (req, res, next) => {
  try {
    const {
      name,
      orcid,
      affiliation,
      department,
      email,
      research_interests,
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const exists = await checkAuthorExists(name, orcid);
    if (exists) {
      return res.status(409).json({ message: 'An author with this name or ORCID already exists' });
    }

    const author = await createAuthor({
      name,
      orcid,
      affiliation,
      department,
      email,
      research_interests,
    });

    return res.status(201).json(author);
  } catch (err) {
    return next(err);
  }
};

const updateAuthorHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await getAuthorById(id);

    if (!existing) {
      return res.status(404).json({ message: 'Author not found' });
    }

    const {
      name = existing.name,
      orcid = existing.orcid,
      affiliation = existing.affiliation,
      department = existing.department,
      email = existing.email,
      research_interests = existing.research_interests,
    } = req.body;

    const updated = await updateAuthor(id, {
      name,
      orcid,
      affiliation,
      department,
      email,
      research_interests,
    });

    return res.json(updated);
  } catch (err) {
    return next(err);
  }
};

const deleteAuthorHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await getAuthorById(id);
    
    if (!existing) {
      return res.status(404).json({ message: 'Author not found' });
    }

    await deleteAuthor(id);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
};

const listAuthorPublications = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await getAuthorById(id);

    if (!existing) {
      return res.status(404).json({ message: 'Author not found' });
    }

    const publications = await getPublicationsByAuthor(id);
    return res.json(publications);
  } catch (err) {
    return next(err);
  }
};

const coauthorNetwork = async (req, res, next) => {
  try {
    const pairs = await getCoauthorNetwork();
    return res.json(pairs);
  } catch (err) {
    return next(err);
  }
};

const getCollaborationRecommendations = async (req, res, next) => {
  try {
    const { id } = req.params;
    const recommendations = await suggestCollaborations(id);
    return res.json(recommendations);
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  listAuthors,
  getAuthor,
  createAuthorHandler,
  updateAuthorHandler,
  deleteAuthorHandler,
  listAuthorPublications,
  coauthorNetwork,
  getCollaborationRecommendations,
};

