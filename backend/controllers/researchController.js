// Fetch papers from OpenAlex
const searchRealPapers = async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }

    // Call OpenAlex API
    // We filter for papers that have open access so we can actually show PDFs
    const url = new URL('https://api.openalex.org/works');
    url.searchParams.append('search', query);
    url.searchParams.append('page', page);
    url.searchParams.append('per_page', limit);
    url.searchParams.append('filter', 'has_oa_accepted_or_published_version:true');
    url.searchParams.append('mailto', 'rupam@example.com');

    const openAlexRes = await fetch(url.toString());
    if (!openAlexRes.ok) {
      throw new Error(`OpenAlex API responded with status: ${openAlexRes.status}`);
    }
    const data = await openAlexRes.json();

    // Extract necessary data format from OpenAlex response to match our UI needs
    const papers = data.results.map(work => {
      // Find the best open access PDF URL
      const pdfUrl = work.open_access?.oa_url || null;
      
      // Get the abstract (often provided as an inverted index in OpenAlex, so we need to reconstruct it if we want to show it, or check for abstract_inverted_index)
      let abstract = '';
      if (work.abstract_inverted_index) {
        // Reconstruct abstract from inverted index
        const index = work.abstract_inverted_index;
        const words = Object.keys(index);
        let abstractWords = [];
        words.forEach(word => {
          index[word].forEach(pos => {
            abstractWords[pos] = word;
          });
        });
        abstract = abstractWords.filter(Boolean).join(' ');
      }

      return {
        id: work.id,
        title: work.title,
        doi: work.doi,
        publicationYear: work.publication_year,
        authors: work.authorships?.map(a => a.author.display_name).join(', ') || 'Unknown Authors',
        abstract: abstract || 'No abstract available.',
        isOpenAccess: work.open_access?.is_oa || false,
        pdfUrl: pdfUrl,
        citationsCount: work.cited_by_count
      };
    });

    res.json({
      meta: data.meta,
      papers
    });

  } catch (error) {
    console.error('Error fetching real papers from OpenAlex:', error.message);
    res.status(500).json({ message: 'Failed to fetch external papers', error: error.toString() });
  }
};

module.exports = {
  searchRealPapers
};
