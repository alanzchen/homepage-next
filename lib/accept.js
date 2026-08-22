const DEFAULT_PRODUCES = ["text/html", "text/markdown"];

function parseAccept(header) {
  return header
    .split(",")
    .map((raw) => {
      const parts = raw.trim().split(";").map((part) => part.trim());
      const type = (parts[0] || "").toLowerCase();
      let q = 1;

      for (const parameter of parts.slice(1)) {
        const [name, value] = parameter.split("=").map((part) => part.trim());
        if (name.toLowerCase() === "q") {
          const parsed = Number(value);
          q = Number.isFinite(parsed) ? Math.max(0, Math.min(1, parsed)) : 0;
        }
      }

      const specificity = type === "*/*" ? 0 : type.endsWith("/*") ? 1 : 2;
      return { type, q, specificity };
    })
    .filter((entry) => entry.type.includes("/"));
}

function matches(entry, candidate) {
  if (entry.type === "*/*") return true;
  if (entry.type.endsWith("/*")) {
    return candidate.startsWith(entry.type.slice(0, -1));
  }
  return entry.type === candidate;
}

function preferredType(header, produces = DEFAULT_PRODUCES) {
  if (!header) return produces[0] || null;

  const entries = parseAccept(header);
  if (entries.length === 0) return produces[0] || null;

  let bestType = null;
  let bestQ = -1;
  let bestPosition = Infinity;

  for (const candidate of produces) {
    let matched = null;
    let matchedPosition = Infinity;

    for (let position = 0; position < entries.length; position += 1) {
      const entry = entries[position];
      if (!matches(entry, candidate)) continue;

      if (
        matched === null ||
        entry.specificity > matched.specificity ||
        (entry.specificity === matched.specificity && position < matchedPosition)
      ) {
        matched = entry;
        matchedPosition = position;
      }
    }

    if (!matched || matched.q <= 0) continue;

    if (
      matched.q > bestQ ||
      (matched.q === bestQ && matchedPosition < bestPosition)
    ) {
      bestType = candidate;
      bestQ = matched.q;
      bestPosition = matchedPosition;
    }
  }

  return bestType;
}

function appendVary(existing, value) {
  if (!existing) return value;
  const tokens = existing.split(",").map((token) => token.trim().toLowerCase());
  return tokens.includes(value.toLowerCase()) ? existing : `${existing}, ${value}`;
}

module.exports = {
  DEFAULT_PRODUCES,
  appendVary,
  parseAccept,
  preferredType,
};
