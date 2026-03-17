/**
 * Sort keys for project groups (e.g. "Fall 2025", "Spring 2026", or legacy "Year 2025").
 * Newest first; within same year, Fall before Spring.
 */
export default function groupByYearSort(a, b) {
  const keyA = String(a[0]);
  const keyB = String(b[0]);
  const { year: yA, isFall: fallA } = parseSemesterKey(keyA);
  const { year: yB, isFall: fallB } = parseSemesterKey(keyB);
  if (yA !== yB) return yB - yA;
  return (fallB ? 1 : 0) - (fallA ? 1 : 0);
}

function parseSemesterKey(key) {
  const parts = key.trim().split(/\s+/);
  const last = parts[parts.length - 1];
  const year = parseInt(last, 10);
  const isYear = !Number.isNaN(year) && last.length >= 4;
  const isFall = parts[0] && parts[0].toLowerCase() === 'fall';
  return {
    year: isYear ? year : 0,
    isFall,
  };
}
