require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const publicationRoutes = require('./routes/publicationRoutes');
const authorRoutes = require('./routes/authorRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const citationRoutes = require('./routes/citationRoutes');
const researchRoutes = require('./routes/researchRoutes');
const fundingRoutes = require('./routes/fundingRoutes');
const datasetRoutes = require('./routes/datasetRoutes');

const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Research Publication Management API running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/papers', publicationRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/citations', citationRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/funding', fundingRoutes);
app.use('/api/datasets', datasetRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

