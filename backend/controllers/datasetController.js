const fs = require('fs');
const fastcsv = require('fast-csv');
const { query } = require('../config/db');

// Helper: Implements the 'Upsert' logic manually for an Author.
// Data Flow Step 2a: Checks if the author already exists in the 3NF authors table.
// If not, it INSERTS the new atomic author record.
const findOrCreateAuthor = async (name) => {
  const existing = await query('SELECT author_id FROM authors WHERE name = $1 LIMIT 1', [name]);
  if (existing.rows.length > 0) return existing.rows[0].author_id;
  const res = await query('INSERT INTO authors (name) VALUES ($1) RETURNING author_id', [name]);
  return res.rows[0].author_id;
};

// Helper: Checks for an existing paper by title, otherwise inserts.
// Data Flow Step 1: Extracts flat CSV row data and isolates 'papers' table attributes.
const findOrCreatePaper = async (row) => {
  const { title, doi, publication_year, journal, conference, keywords } = row;
  const existing = await query('SELECT paper_id FROM papers WHERE title = $1 LIMIT 1', [title]);
  if (existing.rows.length > 0) return existing.rows[0].paper_id;
  
  const res = await query(
    `INSERT INTO papers (title, doi, publication_year, journal, conference, keywords) 
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING paper_id`,
    [title, doi, publication_year || 2024, journal, conference, keywords]
  );
  return res.rows[0].paper_id;
};

// Data Flow Step 2b: Resolves Many-to-Many relationship (Normalization).
// Instead of storing comma-separated authors in the papers table (which violates 1NF),
// this maps the specific paper_id to the specific author_id in the bridging table 'paperauthors'.
const linkAuthorToPaper = async (paperId, authorId) => {
  const existing = await query('SELECT * FROM paperauthors WHERE paper_id = $1 AND author_id = $2', [paperId, authorId]);
  if (existing.rows.length === 0) {
    await query('INSERT INTO paperauthors (paper_id, author_id) VALUES ($1, $2)', [paperId, authorId]);
  }
};

const uploadDataset = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const filePath = req.file.path;
  const results = [];

  try {
    fs.createReadStream(filePath)
      .pipe(fastcsv.parse({ headers: true, trim: true }))
      .on('error', error => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return next(error);
      })
      .on('data', row => {
        results.push(row);
      })
      .on('end', async (rowCount) => {
        try {
          let imported = 0;
          for (const row of results) {
            if (!row.title) continue;
            
            // Insert or get paper
            const paperId = await findOrCreatePaper(row);
            
            // Parse & insert authors if present
            if (row.authors) {
              const authors = row.authors.split(',').map(a => a.trim()).filter(Boolean);
              for (const authorName of authors) {
                const authorId = await findOrCreateAuthor(authorName);
                await linkAuthorToPaper(paperId, authorId);
              }
            }
            imported++;
          }
          
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          return res.json({ message: `Successfully imported ${imported} papers from CSV.`, rowsProcessed: rowCount });
        } catch (dbErr) {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          return next(dbErr);
        }
      });
  } catch (err) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return next(err);
  }
};

module.exports = {
  uploadDataset
};
