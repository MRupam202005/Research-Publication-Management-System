const fs = require('fs');
const fastcsv = require('fast-csv');
const { pool } = require('../config/db');

/**
 * DBMS EDUCATIONAL NOTE:
 * This controller demonstrates the 'Transformation' step in an ETL (Extract, Transform, Load) process.
 * We take flat, potentially redundant data from a CSV and decompose it into a 
 * 3rd Normal Form (3NF) relational schema using PostgreSQL transactions.
 */

// Helper: Find or create journal (Normalizes Journals table)
const findOrCreateJournal = async (client, name, publisher) => {
  if (!name) return null;
  const existing = await client.query('SELECT journal_id FROM journals WHERE name = $1 LIMIT 1', [name]);
  if (existing.rows.length > 0) return existing.rows[0].journal_id;
  const res = await client.query(
    'INSERT INTO journals (name, publisher) VALUES ($1, $2) RETURNING journal_id',
    [name, publisher || '']
  );
  return res.rows[0].journal_id;
};

// Helper: Find or create author with full attributes (Normalizes Authors table)
const findOrCreateAuthor = async (client, data) => {
  const { name, orcid, affiliation, department, email, interests } = data;
  if (!name) return null;
  
  // Check by ORCID first if available, else by name
  let existing;
  if (orcid) {
    existing = await client.query('SELECT author_id FROM authors WHERE orcid = $1 LIMIT 1', [orcid]);
  } else {
    existing = await client.query('SELECT author_id FROM authors WHERE name = $1 LIMIT 1', [name]);
  }

  if (existing.rows.length > 0) return existing.rows[0].author_id;

  const res = await client.query(
    `INSERT INTO authors (name, orcid, affiliation, department, email, research_interests) 
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING author_id`,
    [name, orcid || '', affiliation || '', department || '', email || '', interests || '']
  );
  return res.rows[0].author_id;
};

// Helper: Find or create funding agency
const findOrCreateAgency = async (client, name, type, location) => {
  if (!name) return null;
  const existing = await client.query('SELECT agency_id FROM funding_agencies WHERE name = $1 LIMIT 1', [name]);
  if (existing.rows.length > 0) return existing.rows[0].agency_id;
  const res = await client.query(
    'INSERT INTO funding_agencies (name, type, location) VALUES ($1, $2, $3) RETURNING agency_id',
    [name, type || '', location || '']
  );
  return res.rows[0].agency_id;
};

// Dataset Upload CONTROLLER
const uploadDataset = async (req, res, next) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const filePath = req.file.path;
  const rows = [];
  const client = await pool.connect();

  try {
    fs.createReadStream(filePath)
      .pipe(fastcsv.parse({ headers: true, trim: true }))
      .on('error', error => { throw error; })
      .on('data', row => rows.push(row))
      .on('end', async () => {
        let newPapersCount = 0;
        let updatedPapersCount = 0;
        let errors = [];

        try {
          for (const row of rows) {
            try {
              await client.query('BEGIN');

              // Strict Validation for Mandatory Fields
              if (!row.title || !row.publication_year) {
                throw new Error("Missing mandatory fields: title and publication_year are required.");
              }

              // 1. Resolve Journal
              const journalId = await findOrCreateJournal(client, row.journal_name, row.journal_publisher);

              // 2. Resolve/Insert Paper
              let paperId;
              let existingPaper;
              
              // Check by DOI if available
              if (row.doi) {
                existingPaper = await client.query('SELECT paper_id FROM papers WHERE doi = $1 LIMIT 1', [row.doi]);
              }
              // Fallback check by Title
              if (!existingPaper || existingPaper.rows.length === 0) {
                existingPaper = await client.query('SELECT paper_id FROM papers WHERE title = $1 LIMIT 1', [row.title]);
              }

              if (existingPaper && existingPaper.rows.length > 0) {
                paperId = existingPaper.rows[0].paper_id;
                updatedPapersCount++;
              } else {
                const paperRes = await client.query(
                  `INSERT INTO papers (title, abstract, doi, publication_year, journal_id, journal, conference, keywords, pdf_url) 
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING paper_id`,
                  [
                    row.title, 
                    row.abstract || '', 
                    row.doi || '', 
                    parseInt(row.publication_year), 
                    journalId, 
                    row.journal_name || '', 
                    row.conference || '', 
                    row.keywords || '', 
                    row.pdf_url || ''
                  ]
                );
                paperId = paperRes.rows[0].paper_id;
                newPapersCount++;
              }

              // 3. Handle Primary Author
              if (row.primary_author_name) {
                const authorId = await findOrCreateAuthor(client, {
                  name: row.primary_author_name,
                  orcid: row.primary_author_orcid,
                  affiliation: row.primary_author_affiliation,
                  department: row.primary_author_department,
                  email: row.primary_author_email,
                  interests: row.primary_author_interests
                });
                await client.query('INSERT INTO paperauthors (paper_id, author_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [paperId, authorId]);
              }

              // 4. Handle Co-Authors (Names only)
              if (row.co_authors) {
                const coAuthors = row.co_authors.split(',').map(s => s.trim()).filter(Boolean);
                for (const name of coAuthors) {
                  const authorId = await findOrCreateAuthor(client, { name });
                  await client.query('INSERT INTO paperauthors (paper_id, author_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [paperId, authorId]);
                }
              }

              // 5. Handle Funding
              if (row.funding_agency) {
                const agencyId = await findOrCreateAgency(client, row.funding_agency, row.funding_type, row.funding_location);
                await client.query(
                  'INSERT INTO paper_funding (paper_id, agency_id, amount, grant_number) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
                  [paperId, agencyId, parseFloat(row.funding_amount) || 0, row.grant_number || '']
                );
              }

              await client.query('COMMIT');
              // We no longer just use importedCount++
            } catch (innerErr) {
              await client.query('ROLLBACK');
              errors.push({ title: row.title, error: innerErr.message });
            }
          }

          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          res.json({
            message: `Processed ${rows.length} records: ${newPapersCount} new papers added, ${updatedPapersCount} existing papers updated/skipped.`,
            successCount: newPapersCount + updatedPapersCount,
            newCount: newPapersCount,
            updatedCount: updatedPapersCount,
            errorCount: errors.length,
            errors: errors.length > 0 ? errors : undefined
          });
        } catch (dbErr) {
          next(dbErr);
        } finally {
          client.release();
        }
      });
  } catch (err) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    client.release();
    next(err);
  }
};

module.exports = { uploadDataset };
