const fs = require('fs');

const firstNames = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa", "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Alan", "Turing", "Ada", "Lovelace", "Grace", "Hopper", "Linus", "Torvalds", "Tim", "Berners-Lee", "Vint", "Cerf", "Bob", "Kahn", "Bjarne", "Stroustrup", "Ken", "Thompson", "Dennis", "Ritchie"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts"];
const affiliations = ["MIT", "Stanford University", "Harvard University", "Caltech", "University of Cambridge", "Oxford University", "ETH Zurich", "UCL", "Imperial College London", "University of Chicago", "Princeton University", "Cornell University", "Yale University", "Columbia University", "Google Brain", "DeepMind", "OpenAI", "Meta AI", "Microsoft Research", "IBM Research"];
const departments = ["Computer Science", "Artificial Intelligence", "Data Science", "Physics", "Mathematics", "Bioinformatics", "Robotics", "Cognitive Science", "Engineering", "Information Systems"];
const topics = ["Deep Learning", "Machine Learning", "Quantum Computing", "NLP", "Computer Vision", "Reinforcement Learning", "Cryptography", "Distributed Systems", "Bioinformatics", "Cybersecurity", "Ethics in AI", "Algorithms"];

const journalNames = ["Nature", "Science", "Cell", "IEEE Transactions on Neural Networks", "Journal of Machine Learning Research", "ACM Computing Surveys", "Artificial Intelligence", "Bioinformatics", "Communications of the ACM", "Physical Review Letters"];
const publishers = ["Nature Publishing Group", "AAAS", "Elsevier", "IEEE", "MIT Press", "ACM", "Oxford University Press", "Springer", "Wiley", "APS"];

const buzzWords = ["Deep", "Quantum", "Neural", "Probabilistic", "Optimization", "Distributed", "Scalable", "Robust", "Adversarial", "Graph", "Spiking", "Generative", "Efficient", "Secure", "Autonomous", "Federated", "Self-supervised", "Multimodal", "Temporal", "Spatial"];
const nouns = ["Networks", "Algorithms", "Systems", "Models", "Transformers", "Architectures", "Frameworks", "Representations", "Embeddings", "Agents", "Robots", "Classifiers", "Ontologies", "Interfaces", "Databases", "Clusters", "Pipelines", "Simulations", "Environments", "Policies"];
const contexts = ["for Image Recognition", "in Natural Language Processing", "for Quantum Supremacy", "in Healthcare", "for Autonomous Driving", "in Financial Markets", "for Edge Computing", "in Cloud Environments", "for Social Networks", "in Bioinformatics", "for Climate Modeling", "in Cybersecurity", "for Smart Grids", "using Reinforcement Learning", "with Differential Privacy"];

const fundingAgencies = [
  { name: "National Science Foundation", type: "Government", location: "United States" },
  { name: "DARPA", type: "Government", location: "United States" },
  { name: "European Research Council", type: "Government", location: "Europe" },
  { name: "Google Research", type: "Corporate", location: "Global" },
  { name: "Microsoft Research Grants", type: "Corporate", location: "Global" },
  { name: "NIH", type: "Government", location: "United States" },
  { name: "Wellcome Trust", type: "Non-profit", location: "United Kingdom" },
  { name: "Gates Foundation", type: "Non-profit", location: "Global" },
  { name: "EPSRC", type: "Government", location: "United Kingdom" },
  { name: "Max Planck Society", type: "Research Institute", location: "Germany" }
];

const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Generate 50 authors
let authorsSQL = '-- 3. Create Authors (50 records)\nINSERT INTO authors (name, orcid, affiliation, department, email, research_interests) VALUES\n';
const authors = [];
for (let i = 1; i <= 50; i++) {
  const fName = rnd(firstNames);
  const lName = rnd(lastNames);
  const name = `${fName} ${lName}`;
  const orcid = `0000-000${Math.floor(Math.random() * 9)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
  const aff = rnd(affiliations);
  const dep = rnd(departments);
  const email = `${fName.toLowerCase()}.${lName.toLowerCase()}@${aff.split(' ')[0].toLowerCase()}.edu`;
  const interests = `${rnd(topics)}, ${rnd(topics)}`;
  authors.push({id: i, name});
  authorsSQL += `('${name}', '${orcid}', '${aff}', '${dep}', '${email}', '${interests}')${i === 50 ? ';' : ','}\n`;
}

// Generate 10 journals
let journalsSQL = '-- 4. Create Journals (10 records)\nINSERT INTO journals (name, publisher) VALUES\n';
for (let i = 0; i < 10; i++) {
  journalsSQL += `('${journalNames[i]}', '${publishers[i]}')${i === 9 ? ';' : ','}\n`;
}

// Generate 50 papers
let papersSQL = '-- 5. Create Papers (50 records)\nINSERT INTO papers (title, abstract, doi, publication_year, journal_id, journal, conference, keywords, pdf_url) VALUES\n';
const papers = [];
for (let i = 1; i <= 50; i++) {
  const title = `${rnd(buzzWords)} ${rnd(nouns)} ${rnd(contexts)}`;
  const abstract = `We present a novel approach to ${rnd(topics).toLowerCase()} using ${rnd(buzzWords).toLowerCase()} ${rnd(nouns).toLowerCase()}. Our experimental results demonstrate state-of-the-art performance...`;
  const doi = `10.${1000 + Math.floor(Math.random() * 9000)}/arXiv.${2000 + Math.floor(Math.random() * 24)}.${10000 + Math.floor(Math.random() * 90000)}`;
  const year = 2010 + Math.floor(Math.random() * 14);
  const j_id = 1 + Math.floor(Math.random() * 10);
  const j_name = journalNames[j_id - 1];
  const conf = Math.random() > 0.5 ? `'NeurIPS'` : `NULL`;
  const keywords = `${rnd(buzzWords)}, ${rnd(nouns)}, ${rnd(topics)}`;
  
  papersSQL += `('${title}', '${abstract}', '${doi}', ${year}, ${j_id}, '${j_name}', ${conf}, '${keywords}', 'https://arxiv.org/pdf/${doi.split('/').pop()}')`;
  papersSQL += i === 50 ? ';\n' : ',\n';
}

// Map Authors to papers (1-4 authors per paper)
let paperAuthorsSQL = '-- 6. Link Papers to Authors\nINSERT INTO paperauthors (paper_id, author_id) VALUES\n';
const paperAuthorPairs = [];
for (let p = 1; p <= 50; p++) {
  const numAuthors = 1 + Math.floor(Math.random() * 4);
  const selectedAuthors = new Set();
  while(selectedAuthors.size < numAuthors) {
    selectedAuthors.add(1 + Math.floor(Math.random() * 50));
  }
  selectedAuthors.forEach(a => paperAuthorPairs.push(`(${p}, ${a})`));
}
paperAuthorsSQL += paperAuthorPairs.join(',\n') + ';\n';

// Citations (1-5 citations per paper)
let citationsSQL = '-- 7. Add Citations\nINSERT INTO citations (citing_paper_id, cited_paper_id) VALUES\n';
const citationPairs = [];
for (let p = 1; p <= 50; p++) {
  const numCitations = Math.floor(Math.random() * 6); // 0 to 5
  const citedPapers = new Set();
  // To avoid self-cycles and be realistic, mostly cite older papers but randomly is fine for mock
  while(citedPapers.size < numCitations) {
    const cited = 1 + Math.floor(Math.random() * 50);
    if (cited !== p) citedPapers.add(cited);
  }
  citedPapers.forEach(c => citationPairs.push(`(${p}, ${c})`));
}
if(citationPairs.length > 0) {
  citationsSQL += citationPairs.join(',\n') + ';\n';
} else {
  citationsSQL = '-- 7. No citations generated;\n';
}

// Funding Agencies (10)
let fundingSQL = '-- 8. Create Funding Agencies\nINSERT INTO funding_agencies (name, type, location) VALUES\n';
fundingSQL += fundingAgencies.map(f => `('${f.name}', '${f.type}', '${f.location}')`).join(',\n') + ';\n';

// Map Funding to Papers (0-2 grants per paper)
let paperFundingSQL = '-- 9. Link Papers to Funding\nINSERT INTO paper_funding (paper_id, agency_id, amount, grant_number) VALUES\n';
const pfPairs = [];
for (let p = 1; p <= 50; p++) {
  if (Math.random() > 0.4) {
    const numGrants = 1 + Math.floor(Math.random() * 2);
    const ags = new Set();
    while(ags.size < numGrants) ags.add(1 + Math.floor(Math.random() * 10));
    ags.forEach(a => {
      const amount = (10000 + Math.floor(Math.random() * 500000)).toFixed(2);
      const grantString = `'GR-${2010 + Math.floor(Math.random() * 14)}-${Math.floor(100 + Math.random() * 900)}'`;
      pfPairs.push(`(${p}, ${a}, ${amount}, ${grantString})`);
    });
  }
}
if (pfPairs.length > 0) {
  paperFundingSQL += pfPairs.join(',\n') + ';\n';
} else {
  paperFundingSQL = '-- 9. No funding mapped;\n';
}

const finalScript = `
BEGIN;

-- 1. Reset Tables safely
TRUNCATE TABLE paper_funding CASCADE;
TRUNCATE TABLE funding_agencies CASCADE;
TRUNCATE TABLE citations CASCADE;
TRUNCATE TABLE paperauthors CASCADE;
TRUNCATE TABLE papers CASCADE;
TRUNCATE TABLE journals CASCADE;
TRUNCATE TABLE authors CASCADE;
TRUNCATE TABLE users CASCADE;

-- Reset all auto-incrementing serial IDs back to 1
ALTER SEQUENCE citations_citation_id_seq RESTART WITH 1;
ALTER SEQUENCE funding_agencies_agency_id_seq RESTART WITH 1;
ALTER SEQUENCE papers_paper_id_seq RESTART WITH 1;
ALTER SEQUENCE journals_journal_id_seq RESTART WITH 1;
ALTER SEQUENCE authors_author_id_seq RESTART WITH 1;
ALTER SEQUENCE users_id_seq RESTART WITH 1;

-- 2. Create Users
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@example.com', '$2b$10$Q8g1lKHz8H4T8xLg0O5fJ.qR5qZ1LzPzQzQzQzQzQzQzQzQzQzQzQ', 'Administrator'),
('Research Scholar', 'researcher@example.com', '$2b$10$Q8g1lKHz8H4T8xLg0O5fJ.qR5qZ1LzPzQzQzQzQzQzQzQzQzQzQzQ', 'Researcher');

${authorsSQL}
${journalsSQL}
${papersSQL}
${paperAuthorsSQL}
${citationsSQL}
${fundingSQL}
${paperFundingSQL}
COMMIT;
`;

fs.writeFileSync('database/seed.sql', finalScript);
console.log('Successfully generated 50+ records and wrote to database/seed.sql');
