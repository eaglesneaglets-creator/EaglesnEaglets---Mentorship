/**
 * Display formatters — the single place money, counts and dates are turned
 * into text. The UI previously wrote Ghana cedis three ways (₵, GHS, GH₵) and
 * produced strings like "1 Days".
 */

const cedi = new Intl.NumberFormat('en-GH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const cediWhole = new Intl.NumberFormat('en-GH', { maximumFractionDigits: 0 });
const pluralRules = new Intl.PluralRules('en');

/**
 * Format an amount in Ghana cedis: formatMoney(1250) -> "GH₵ 1,250.00".
 * Pass { whole: true } to drop pesewas when they are zero: "GH₵ 1,250".
 * Returns "—" for missing/invalid input rather than "GH₵ NaN".
 */
export function formatMoney(amount, { whole = false } = {}) {
  const n = typeof amount === 'string' ? Number(amount) : amount;
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  const useWhole = whole && Number.isInteger(n);
  return `GH₵ ${(useWhole ? cediWhole : cedi).format(n)}`;
}

/**
 * Count with a correctly pluralised noun: formatCount(1, 'day') -> "1 day",
 * formatCount(3, 'day') -> "3 days", formatCount(2, 'person', 'people').
 */
export function formatCount(count, singular, plural = `${singular}s`) {
  const n = Number(count) || 0;
  return `${n.toLocaleString('en-GH')} ${pluralRules.select(n) === 'one' ? singular : plural}`;
}

const dateFmt = new Intl.DateTimeFormat('en-GH', { day: 'numeric', month: 'short', year: 'numeric' });
const dateTimeFmt = new Intl.DateTimeFormat('en-GH', {
  day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
});

/** "13 Nov 2026" (or with time). Returns "—" for missing/invalid dates. */
export function formatDate(value, { withTime = false } = {}) {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return (withTime ? dateTimeFmt : dateFmt).format(d);
}
