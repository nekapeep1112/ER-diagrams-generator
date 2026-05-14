const UNITS: { limit: number; divisor: number; one: string; few: string; many: string }[] = [
  { limit: 60 * 1000, divisor: 1000, one: 'секунду', few: 'секунды', many: 'секунд' },
  { limit: 60 * 60 * 1000, divisor: 60 * 1000, one: 'минуту', few: 'минуты', many: 'минут' },
  { limit: 24 * 60 * 60 * 1000, divisor: 60 * 60 * 1000, one: 'час', few: 'часа', many: 'часов' },
  { limit: 30 * 24 * 60 * 60 * 1000, divisor: 24 * 60 * 60 * 1000, one: 'день', few: 'дня', many: 'дней' },
  { limit: 365 * 24 * 60 * 60 * 1000, divisor: 30 * 24 * 60 * 60 * 1000, one: 'месяц', few: 'месяца', many: 'месяцев' },
  { limit: Infinity, divisor: 365 * 24 * 60 * 60 * 1000, one: 'год', few: 'года', many: 'лет' },
];

function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

/** "5 минут назад", "2 дня назад", и т.д. */
export function relativeTime(iso: string, now: Date = new Date()): string {
  const then = new Date(iso).getTime();
  const diff = now.getTime() - then;
  if (diff < 30 * 1000) return 'только что';
  for (const unit of UNITS) {
    if (diff < unit.limit) {
      const value = Math.max(1, Math.floor(diff / unit.divisor));
      return `${value} ${plural(value, unit.one, unit.few, unit.many)} назад`;
    }
  }
  return 'давно';
}
