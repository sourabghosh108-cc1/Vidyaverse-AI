/**
 * Vercel Serverless Function: /api/search
 * Provides real-time web search capability for the VidyaAI agent.
 * Searches academic and educational resources using DuckDuckGo / Google Custom Search / Serper.
 */

export const config = {
  maxDuration: 30,
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const query = req.method === "POST" ? req.body?.query : req.query?.q;

  if (!query) {
    return res.status(400).json({ error: "Missing 'query' parameter." });
  }

  try {
    const searchApiKey = process.env.SEARCH_API_KEY || process.env.SERPER_API_KEY;

    // 1. Serper API if key is available
    if (searchApiKey) {
      const resp = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: {
          "X-API-KEY": searchApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ q: query, num: 5 }),
      });

      if (resp.ok) {
        const data = await resp.json();
        const results = (data.organic || []).map((item) => ({
          title: item.title,
          link: item.link,
          snippet: item.snippet,
        }));
        return res.status(200).json({ results, provider: "serper" });
      }
    }

    // 2. DuckDuckGo Instant Answer / HTML Search fallback
    const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    const ddgResp = await fetch(ddgUrl, {
      headers: {
        "User-Agent": "VidyaverseAgent/2.0 (Academic Study Agent)",
      },
    });

    if (ddgResp.ok) {
      const data = await ddgResp.json();
      const results = [];

      if (data.AbstractText) {
        results.push({
          title: data.Heading || query,
          link: data.AbstractURL || "https://en.wikipedia.org",
          snippet: data.AbstractText,
        });
      }

      if (Array.isArray(data.RelatedTopics)) {
        for (const topic of data.RelatedTopics.slice(0, 4)) {
          if (topic.Text && topic.FirstURL) {
            results.push({
              title: topic.Text.split(" - ")[0] || topic.Text,
              link: topic.FirstURL,
              snippet: topic.Text,
            });
          }
        }
      }

      if (results.length > 0) {
        return res.status(200).json({ results, provider: "duckduckgo" });
      }
    }

    // 3. Fallback academic Wikipedia search
    const wikiUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=4&namespace=0&format=json`;
    const wikiResp = await fetch(wikiUrl);
    if (wikiResp.ok) {
      const [searchTerm, titles, snippets, urls] = await wikiResp.json();
      const results = titles.map((title, idx) => ({
        title,
        link: urls[idx],
        snippet: snippets[idx] || `Academic reference on ${title}`,
      }));
      return res.status(200).json({ results, provider: "wikipedia" });
    }

    return res.status(200).json({
      results: [
        {
          title: `Study Resources for ${query}`,
          link: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
          snippet: `Search comprehensive study guides, previous year questions, and solutions for ${query}.`,
        },
      ],
      provider: "fallback",
    });
  } catch (err) {
    return res.status(500).json({
      error: "Search failed",
      message: err.message,
    });
  }
}
