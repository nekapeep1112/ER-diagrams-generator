import Link from 'next/link';
import { BrandMark } from '@/components/ui/BrandMark';
import styles from './Footer.module.css';

const COLS: { title: string; items: { label: string; href: string }[] }[] = [
  {
    title: 'Продукт',
    items: [
      { label: 'Возможности', href: '#' },
      { label: 'Шаблоны', href: '/templates' },
      { label: 'Тарифы', href: '/pricing' },
      { label: 'Что нового', href: '#' },
    ],
  },
  {
    title: 'Ресурсы',
    items: [
      { label: 'Документация', href: '#' },
      { label: 'Гайды', href: '#' },
      { label: 'Справочник SQL', href: '#' },
      { label: 'Сообщество', href: '#' },
    ],
  },
  {
    title: 'Правовое',
    items: [
      { label: 'Условия', href: '#' },
      { label: 'Конфиденциальность', href: '#' },
      { label: 'Безопасность', href: '#' },
      { label: 'DPA', href: '#' },
    ],
  },
];

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.brandCol}>
            <Link href="/" className={styles.brand}>
              <BrandMark size={22} />
              <span>ER Database</span>
            </Link>
            <p className={styles.brandText}>
              Проектирование БД на естественном языке. Нормализованные схемы, интерактивные ER-диаграммы и SQL под любой популярный диалект.
            </p>
          </div>
          {COLS.map((col) => (
            <div key={col.title} className={styles.col}>
              <h4>{col.title}</h4>
              <ul>
                {col.items.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className={styles.bottom}>
          <span>© 2025 ER Database. Собрано на Django + Next.js.</span>
          <span>v1.4.0</span>
        </div>
      </div>
    </footer>
  );
}
