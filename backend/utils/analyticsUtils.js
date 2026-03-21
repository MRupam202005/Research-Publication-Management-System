const calculateHIndex = (citationsPerPaper) => {
  const sorted = [...citationsPerPaper].sort((a, b) => b.citation_count - a.citation_count);
  let h = 0;
  sorted.forEach((paper, index) => {
    const citations = Number(paper.citation_count) || 0;
    if (citations >= index + 1) {
      h = index + 1;
    }
  });
  return h;
};

const calculateI10Index = (citationsPerPaper) =>
  citationsPerPaper.filter((p) => Number(p.citation_count) >= 10).length;

const calculateTotalCitations = (citationsPerPaper) =>
  citationsPerPaper.reduce((sum, p) => sum + (Number(p.citation_count) || 0), 0);

const buildCoauthorNetwork = (pairs) => {
  const network = {};

  pairs.forEach(({ author_id: authorId, coauthor_id: coauthorId }) => {
    if (!network[authorId]) network[authorId] = new Set();
    if (!network[coauthorId]) network[coauthorId] = new Set();
    network[authorId].add(coauthorId);
    network[coauthorId].add(authorId);
  });

  const nodes = Object.keys(network).map((id) => ({
    id: Number(id),
    coauthors: Array.from(network[id]).map(Number),
  }));

  return nodes;
};

module.exports = {
  calculateHIndex,
  calculateI10Index,
  calculateTotalCitations,
  buildCoauthorNetwork,
};

