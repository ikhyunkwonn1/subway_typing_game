// Normalizes station names so common abbreviations match, without tolerating typos.
const Normalize = (() => {
  // Every variant on the left maps to the same canonical token on the right.
  const EQUIVALENTS = {
    street: "st",
    st: "st",
    avenue: "av",
    ave: "av",
    av: "av",
    square: "sq",
    sq: "sq",
    boulevard: "blvd",
    blvd: "blvd",
    parkway: "pkwy",
    pkwy: "pkwy",
    road: "rd",
    rd: "rd",
    place: "pl",
    pl: "pl",
  };

  function canonicalize(raw) {
    return raw
      .toLowerCase()
      .replace(/[–—-]/g, " ") // en dash, em dash, hyphen -> space
      .replace(/['".,]/g, "") // drop apostrophes/quotes/periods/commas
      .replace(/\b(\d+)(st|nd|rd|th)\b/g, "$1") // 125th -> 125, 23rd -> 23
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => EQUIVALENTS[word] || word)
      .join(" ");
  }

  function matches(input, target) {
    const canonicalInput = canonicalize(input);
    if (canonicalInput === canonicalize(target)) return true;

    // Dual/hyphenated names (e.g. "East 143rd Street–St. Mary's Street")
    // also accept either half typed on its own.
    return target
      .split(/[–—-]/)
      .some((part) => part.trim() && canonicalize(part) === canonicalInput);
  }

  return { canonicalize, matches };
})();
