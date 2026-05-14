export const CATEGORY_LABELS: Record<string, string> = {
  'E-commerce': 'E-commerce',
  'SaaS': 'SaaS',
  'CMS': 'Блог/CMS',
  'Social': 'Социальные',
  'Education': 'Образование',
  'Finance': 'Финансы',
  'Healthcare': 'Здоровье',
  'Analytics': 'Аналитика',
  'IoT': 'IoT',
  'Other': 'Другое',
};

export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}
