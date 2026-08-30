// Simple content-based recommendation: TF-IDF + Cosine Similarity
// No training data needed — computes similarity between student interests
// and each event's text (title + description + category) at runtime.

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function computeTF(tokens) {
  const tf = {};
  tokens.forEach((t) => {
    tf[t] = (tf[t] || 0) + 1;
  });
  const len = tokens.length || 1;
  Object.keys(tf).forEach((k) => {
    tf[k] = tf[k] / len;
  });
  return tf;
}

function computeIDF(documents) {
  const N = documents.length;
  const df = {};
  documents.forEach((tokens) => {
    new Set(tokens).forEach((term) => {
      df[term] = (df[term] || 0) + 1;
    });
  });
  const idf = {};
  Object.keys(df).forEach((term) => {
    idf[term] = Math.log((N + 1) / (df[term] + 1)) + 1;
  });
  return idf;
}

function computeTFIDF(tokens, idf) {
  const tf = computeTF(tokens);
  const vec = {};
  Object.keys(tf).forEach((term) => {
    vec[term] = tf[term] * (idf[term] || 1);
  });
  return vec;
}

function cosineSimilarity(vecA, vecB) {
  const terms = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  let dot = 0,
    magA = 0,
    magB = 0;
  terms.forEach((term) => {
    const a = vecA[term] || 0;
    const b = vecB[term] || 0;
    dot += a * b;
    magA += a * a;
    magB += b * b;
  });
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

/**
 * events: array of { id, title, description, category }
 * studentInterests: array of interest category strings
 * returns: { [eventId]: scorePercent (0-100) }
 */
export function computeMatchScores(events, studentInterests) {
  if (!studentInterests || studentInterests.length === 0) {
    const zero = {};
    events.forEach((e) => (zero[e.id] = 0));
    return zero;
  }

  const eventTokenSets = events.map((e) =>
    tokenize(`${e.title} ${e.description} ${e.category}`)
  );
  const interestTokens = tokenize(studentInterests.join(" "));
  const idf = computeIDF([...eventTokenSets, interestTokens]);
  const interestVec = computeTFIDF(interestTokens, idf);

  const scores = {};
  events.forEach((e, i) => {
    const eventVec = computeTFIDF(eventTokenSets[i], idf);
    const sim = cosineSimilarity(interestVec, eventVec);
    scores[e.id] = Math.round(sim * 100);
  });
  return scores;
}