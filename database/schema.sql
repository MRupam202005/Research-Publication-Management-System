-- PostgreSQL schema for Research Publication Management System

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'Researcher',
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS authors (
  author_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  orcid VARCHAR(50),
  affiliation VARCHAR(255),
  department VARCHAR(255),
  email VARCHAR(255),
  research_interests TEXT
);

CREATE TABLE IF NOT EXISTS journals (
  journal_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  publisher VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS papers (
  paper_id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  abstract TEXT,
  doi VARCHAR(100),
  publication_year INTEGER NOT NULL,
  journal_id INTEGER REFERENCES journals(journal_id) ON DELETE SET NULL,
  journal VARCHAR(255),
  conference VARCHAR(255),
  keywords TEXT,
  pdf_url VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS paperauthors (
  paper_id INTEGER REFERENCES papers(paper_id) ON DELETE CASCADE,
  author_id INTEGER REFERENCES authors(author_id) ON DELETE CASCADE,
  PRIMARY KEY (paper_id, author_id)
);

CREATE TABLE IF NOT EXISTS citations (
  citation_id SERIAL PRIMARY KEY,
  citing_paper_id INTEGER REFERENCES papers(paper_id) ON DELETE CASCADE,
  cited_paper_id INTEGER REFERENCES papers(paper_id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS paper_funding CASCADE;
DROP TABLE IF EXISTS funding_agencies CASCADE;

CREATE TABLE IF NOT EXISTS funding_agencies (
  agency_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  location VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS paper_funding (
  paper_id INTEGER REFERENCES papers(paper_id) ON DELETE CASCADE,
  agency_id INTEGER REFERENCES funding_agencies(agency_id) ON DELETE CASCADE,
  amount DECIMAL(15, 2),
  grant_number VARCHAR(100),
  PRIMARY KEY (paper_id, agency_id)
);
