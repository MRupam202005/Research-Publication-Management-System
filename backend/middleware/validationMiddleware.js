const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  next();
};

const validatePublication = (req, res, next) => {
  const { title, publication_year } = req.body;
  if (!title || !publication_year) {
    return res.status(400).json({ message: 'Title and publication_year are required' });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validatePublication,
};
