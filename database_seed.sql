-- Reset and Clean Existing Data
TRUNCATE TABLE citations, paper_funding, paperauthors, papers, authors, funding_agencies, journals RESTART IDENTITY CASCADE;

-- ==========================================
-- 1. Insert Journals (No Nulls)
-- ==========================================
INSERT INTO journals (name, publisher) VALUES 
('Journal of Advanced Computing', 'ACM Press'),
('IEEE Transactions on AI', 'IEEE'),
('Nature Database Computing', 'Nature Publishing Group');

-- ==========================================
-- 2. Insert Funding Agencies
-- ==========================================
INSERT INTO funding_agencies (name, type, location) VALUES 
('National Science Foundation', 'Government', 'USA'),
('European Research Council', 'Government', 'EU'),
('Gates Foundation', 'Private', 'Global');

-- ==========================================
-- 3. Insert Authors (No Nulls)
-- ==========================================
INSERT INTO authors (name, orcid, affiliation, department, email, research_interests) VALUES 
('Dr. Alan Turing', '0000-0001-2345-6789', 'Cambridge University', 'Computer Science', 'alan@cambridge.edu', 'Cryptography, AI'),
('Dr. Grace Hopper', '0000-0002-3456-7890', 'Yale University', 'Computer Engineering', 'grace@yale.edu', 'Compilers, System Design'),
('Dr. Edgar Codd', '0000-0003-4567-8901', 'IBM Research', 'Data Science', 'edgar@ibm.com', 'Relational Databases');

-- ==========================================
-- 4. Insert Papers (No Nulls)
-- ==========================================
INSERT INTO papers (title, abstract, doi, publication_year, journal_id, journal, conference, keywords, pdf_url) VALUES 
('The Principles of Database Systems', 'An in-depth look at how relational algebra powers modern databases.', '10.1111/db.001', 2023, 3, 'Nature Database Computing', 'SIGMOD 2023', 'Databases, Normalization, SQL', 'https://example.com/db_systems.pdf'),
('Next Generation Compilers', 'Improving compilation speed for modern hardware architectures.', '10.2222/comp.002', 2022, 1, 'Journal of Advanced Computing', 'PLDI 2022', 'Compilers, Parsing', 'https://example.com/compilers.pdf'),
('Neural Networks Cryptography', 'Using deep learning models to encrypt streaming data efficiently.', '10.3333/ai.003', 2024, 2, 'IEEE Transactions on AI', 'NeurIPS 2024', 'AI, Deep Learning, Security', 'https://example.com/nn_crypto.pdf');

-- ==========================================
-- 5. Insert Paper Authors (Bridging table)
-- ==========================================
INSERT INTO paperauthors (paper_id, author_id) VALUES 
(1, 3), -- Codd -> Databases
(1, 2), -- Hopper -> Databases
(2, 2), -- Hopper -> Compilers
(3, 1), -- Turing -> Neural Networks
(3, 3); -- Codd -> Neural Networks

-- ==========================================
-- 6. Insert Citations (Self-Referencing Many-to-Many)
-- ==========================================
INSERT INTO citations (citing_paper_id, cited_paper_id) VALUES 
(2, 1), -- Next Gen Compilers cites Database Systems
(3, 1), -- Neural Networks cites Database Systems
(3, 2); -- Neural Networks cites Next Gen Compilers

-- ==========================================
-- 7. Insert Paper Funding
-- ==========================================
INSERT INTO paper_funding (paper_id, agency_id, amount, grant_number) VALUES 
(1, 1, 150000.00, 'NSF-10101'),
(2, 3, 50000.00, 'GF-20202'),
(3, 2, 200000.00, 'ERC-30303');
