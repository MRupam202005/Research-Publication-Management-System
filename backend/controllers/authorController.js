const {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
  getPublicationsByAuthor,
  getCoauthorNetwork,
  suggestCollaborations,
} = require('../models/authorModel');

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

