/**
 * Universal Study Search Database & Generator Engine (Upgraded)
 * Resolves search queries into structured 10-part educational contents
 * by querying the local educational_database.json file.
 */

let dbPromise = null;

function loadDatabase() {
  if (!dbPromise) {
    dbPromise = fetch('./data/educational_database.json')
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch database");
        return res.json();
      })
      .catch(err => {
        console.error("Database fetch failed, falling back to local fallback", err);
        return [];
      });
  }
  return dbPromise;
}

function levenshteinDistance(a, b) {
  const tmp = [];
  let i, j;
  for (i = 0; i <= a.length; i++) {
    tmp[i] = [i];
  }
  for (j = 0; j <= b.length; j++) {
    tmp[0][j] = j;
  }
  for (i = 1; i <= a.length; i++) {
    for (j = 1; j <= b.length; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1, // deletion
        tmp[i][j - 1] + 1, // insertion
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1) // substitution
      );
    }
  }
  return tmp[a.length][b.length];
}

export const mockSearch = {
  /**
   * Search query resolver (asynchronous)
   * @param {string} rawQuery 
   */
  async resolve(rawQuery) {
    const q = rawQuery.toLowerCase().trim();
    const db = await loadDatabase();
    
    if (!db || db.length === 0) {
      return this.generateDynamicTopic(rawQuery);
    }

    // 1. Exact match on topic or aliases (First priority)
    let matchedTopic = db.find(t => 
      t.topic.toLowerCase() === q || 
      (t.aliases && t.aliases.some(alias => alias.toLowerCase() === q))
    );
    if (matchedTopic) return matchedTopic;

    // 2. Substring match on title or aliases (Second priority)
    matchedTopic = db.find(t => 
      t.topic.toLowerCase().includes(q) || 
      (t.aliases && t.aliases.some(alias => alias.toLowerCase().includes(q)))
    );
    if (matchedTopic) return matchedTopic;

    // 3. Keyword / Token overlap matching (Third priority)
    const queryTokens = q.split(/\s+/).filter(token => token.length > 1);
    let bestMatch = null;
    let highestScore = 0;

    for (const t of db) {
      let score = 0;
      
      const titleLower = t.topic.toLowerCase();
      queryTokens.forEach(token => {
        if (titleLower.includes(token)) {
          score += 10;
        }
      });

      if (t.aliases) {
        t.aliases.forEach(alias => {
          const aliasLower = alias.toLowerCase();
          queryTokens.forEach(token => {
            if (aliasLower.includes(token)) {
              score += 8;
            }
          });
        });
      }

      if (t.keywords) {
        t.keywords.forEach(kw => {
          const kwLower = kw.toLowerCase();
          queryTokens.forEach(token => {
            if (kwLower.includes(token) || token.includes(kwLower)) {
              score += 5;
            }
          });
        });
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = t;
      }
    }

    if (highestScore >= 5 && bestMatch) {
      return bestMatch;
    }

    // 4. Fuzzy Levenshtein Distance (Fourth priority)
    let minDistance = 999;
    let fuzzyMatch = null;
    for (const t of db) {
      const titlesToCheck = [t.topic.toLowerCase(), ...(t.aliases || []).map(a => a.toLowerCase())];
      for (const title of titlesToCheck) {
        const dist = levenshteinDistance(q, title);
        const threshold = Math.max(3, Math.floor(title.length * 0.3));
        if (dist < minDistance && dist <= threshold) {
          minDistance = dist;
          fuzzyMatch = t;
        }
      }
    }

    if (fuzzyMatch) {
      return fuzzyMatch;
    }

    // 5. Dynamic Fallback Generator for other search queries
    return this.generateDynamicTopic(rawQuery);
  },

  /**
   * Get list of matching topic suggestions based on partial input
   * @param {string} partialQuery 
   */
  async getSuggestions(partialQuery) {
    if (!partialQuery) return [];
    const q = partialQuery.toLowerCase().trim();
    const db = await loadDatabase();
    
    if (!db || db.length === 0) return [];

    const suggestions = [];
    for (const t of db) {
      if (t.topic.toLowerCase().startsWith(q) || t.topic.toLowerCase().includes(q)) {
        suggestions.push(t.topic);
        continue;
      }
      
      if (t.aliases) {
        const matchingAlias = t.aliases.find(alias => alias.toLowerCase().startsWith(q) || alias.toLowerCase().includes(q));
        if (matchingAlias) {
          suggestions.push(t.topic);
        }
      }
    }
    
    return [...new Set(suggestions)].slice(0, 5);
  },

  generateDynamicTopic(query) {
    const topicTitle = query.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    return {
      topic: topicTitle,
      overview: `This study guide covers the fundamental concepts of ${topicTitle}. Explore its core principles, structured explanations, formula reviews, and quick assessments prepared by Vidyaverse AI.`,
      concepts: [
        { title: `Core Principle of ${topicTitle}`, desc: `The underlying framework that defines the behavior and properties of ${topicTitle} in academic settings.` },
        { title: `Secondary Mechanics`, desc: "Important subsidiary mechanisms observed during practical applications and numerical problems." }
      ],
      definitions: [
        { term: `${topicTitle} Definition`, def: `The formal academic statement defining the scope and parameters of ${topicTitle}.` },
        { term: "Standard Boundary Condition", def: "The specific constraints or assumptions under which these guidelines remain valid." }
      ],
      formulas: [
        { name: "Fundamental Relationship", eq: "Y = f(X) | Constant = K", desc: "The basic proportionality representing this topic's characteristics." }
      ],
      explanation: `To understand ${topicTitle}, we analyze its basic components step-by-step. In typical examinations, questions on this topic test your conceptual grasp of how variables interact, how equations are derived, and how principles are applied to solve real-world problems.`,
      examNotes: `💡 Double-check units and base definitions before attempting numeric solutions.\n💡 Always structure your theoretical answers with clear, labelled bullet points rather than dense paragraphs.`,
      mistakes: [
        { title: "Assumption Errors", desc: "Applying general equations without checking if the system meets the required assumptions." },
        { title: "Calculations Mistakes", desc: "Forgetting to convert variables to SI units before solving formulas." }
      ],
      revision: [
        `Review the core definitions of ${topicTitle} first.`,
        "Identify the primary formulas and constant terms.",
        "Practice drawing qualitative diagrams to consolidate understanding."
      ],
      questions: [
        { 
          q: `What is the primary objective of studying ${topicTitle}?`, 
          options: ["To establish quantitative models", "To memorize facts", "To perform experiments only", "To ignore variables"],
          correctAnswerIndex: 0,
          explanation: "The primary objective of scientific and quantitative study is to establish valid models of variables and their relationships.",
          a: "To establish a clear qualitative and quantitative model of variables in this domain." 
        }
      ],
      flashcards: [
        { front: `What is the main goal when studying ${topicTitle}?`, back: "To model its underlying variables and interactions." }
      ],
      videos: [
        { title: `${topicTitle} - Core Concepts Explained`, channel: "Vidyaverse AI Classroom", duration: "15 mins", videoId: "dQw4w9WgXcQ" }
      ],
      related: [],
      learningPath: [topicTitle]
    };
  }
};
