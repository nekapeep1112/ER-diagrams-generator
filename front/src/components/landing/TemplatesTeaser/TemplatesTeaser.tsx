'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { fetchTemplates } from '@/lib/api/templates';
import type { SchemaTemplate } from '@/types';
import styles from './TemplatesTeaser.module.css';

const THUMB_LAYOUTS: Array<Array<{ top: string; left?: string; right?: string }>> = [
  // Card 1: triangle
  [
    { top: '12px', left: '20px' },
    { top: '12px', right: '20px' },
    { top: '74px', left: '50%' },
  ],
  // Card 2: row
  [
    { top: '46px', left: '14px' },
    { top: '46px', left: '50%' },
    { top: '46px', right: '14px' },
  ],
  // Card 3: diagonal
  [
    { top: '14px', left: '18px' },
    { top: '46px', left: '50%' },
    { top: '78px', right: '18px' },
  ],
  // Card 4: triangle (mirror)
  [
    { top: '14px', left: '50%' },
    { top: '74px', left: '18px' },
    { top: '74px', right: '18px' },
  ],
];

export function TemplatesTeaser() {
  const [featured, setFeatured] = useState<SchemaTemplate[]>([]);

  useEffect(() => {
    fetchTemplates({ sort: 'popular' })
      .then((res) => setFeatured(res.results.slice(0, 4)))
      .catch(() => setFeatured([]));
  }, []);

  if (featured.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.head}>
          <span className="micro">Шаблоны</span>
          <h2>Начните с проверенным шаблоном</h2>
          <p>Форкайте схемы сообщества — интернет-магазин, блог, биллинг SaaS, социальная сеть и многое другое.</p>
        </div>

        <div className={styles.grid}>
          {featured.map((tmpl, i) => (
            <Link key={tmpl.id} href={`/templates/${tmpl.id}`} className={styles.tmpl}>
              <div className={styles.thumb} aria-hidden="true">
                {THUMB_LAYOUTS[i].map((pos, j) => (
                  <div
                    key={j}
                    className={styles.tbox}
                    style={{
                      top: pos.top,
                      left: pos.left,
                      right: pos.right,
                      transform: pos.left === '50%' ? 'translateX(-50%)' : undefined,
                    }}
                  >
                    <div className={styles.hh} />
                    <div className={styles.ll} />
                    <div className={styles.ll} />
                  </div>
                ))}
              </div>
              <div className={styles.body}>
                <div className={styles.titleRow}>
                  <h3>{tmpl.name}</h3>
                  <Badge>{tmpl.category}</Badge>
                </div>
                <div className={styles.stat}>
                  <div className={styles.avatars}>
                    <span className={`${styles.av} ${styles.av1}`} />
                    <span className={`${styles.av} ${styles.av2}`} />
                    <span className={`${styles.av} ${styles.av3}`} />
                  </div>
                  <span>Используют {tmpl.fork_count.toLocaleString('ru-RU')} разработчика</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className={styles.foot}>
          <Link href="/templates">Все шаблоны →</Link>
        </div>
      </div>
    </section>
  );
}
