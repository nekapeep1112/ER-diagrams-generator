'use client';

import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import styles from './LiveDemo.module.css';

const DEFAULT_PROMPT =
  'Биллинг для SaaS: у workspace много пользователей, пользователь принадлежит одному workspace, у каждого workspace — подписка с тарифом, инвойсы ссылаются на подписку, позиции инвойса — на инвойс.';

export function LiveDemo() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.sectionHead}>
          <span className="micro">Демо</span>
          <h2>Опишите свою предметную область</h2>
          <p>Отредактируйте промпт ниже — диаграмма обновится.</p>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoLeft}>
            <span className="micro">Промпт</span>
            <h3>Введите задачу естественным языком</h3>
            <p>Сохраним структуру, выведем типы и расставим связи.</p>
            <textarea
              className={styles.prompt}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              spellCheck={false}
            />
            <div className={styles.actions}>
              <a href="/register" className={styles.tryLink}>
                Запустить <Icon name="chevron-right" size={14} />
              </a>
              <span className={styles.kbd}>⌘ ↵ запуск</span>
            </div>
          </div>

          <div className={styles.demoRight} aria-hidden="true">
            <svg className={styles.edges} viewBox="0 0 560 360" preserveAspectRatio="none">
              <path d="M 177 96 C 280 96, 280 235, 374 235" stroke="#2a2a3e" strokeWidth="1" fill="none" />
              <circle cx="374" cy="235" r="2.5" fill="#06b6d4" />
              <path d="M 374 235 C 280 235, 280 264, 177 264" stroke="#2a2a3e" strokeWidth="1" fill="none" />
              <circle cx="177" cy="264" r="2.5" fill="#06b6d4" />
            </svg>

            <div className={`${styles.floater} ${styles.r1}`}>
              <div className={styles.tableNode} style={{ width: 160 }}>
                <div className={styles.head}>workspaces</div>
                <div className={styles.row}>
                  <span className={styles.left}>
                    <span className={`${styles.icSpace} ${styles.icPk}`}><Icon name="key" size={12} /></span>id
                  </span>
                  <span className={styles.type}>uuid</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.left}><span className={styles.icSpace} />name</span>
                  <span className={styles.type}>varchar</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.left}><span className={styles.icSpace} />plan_id</span>
                  <span className={styles.type}>uuid</span>
                </div>
              </div>
            </div>

            <div className={`${styles.floater} ${styles.r2}`}>
              <div className={`${styles.tableNode} ${styles.active}`} style={{ width: 185 }}>
                <div className={styles.head}>subscriptions</div>
                <div className={styles.row}>
                  <span className={styles.left}>
                    <span className={`${styles.icSpace} ${styles.icPk}`}><Icon name="key" size={12} /></span>id
                  </span>
                  <span className={styles.type}>uuid</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.left}>
                    <span className={`${styles.icSpace} ${styles.icFk}`}><Icon name="link-2" size={12} /></span>workspace_id
                  </span>
                  <span className={styles.type}>uuid</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.left}><span className={styles.icSpace} />status</span>
                  <span className={styles.type}>enum</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.left}><span className={styles.icSpace} />renews_at</span>
                  <span className={styles.type}>timestamp</span>
                </div>
              </div>
            </div>

            <div className={`${styles.floater} ${styles.r3}`}>
              <div className={styles.tableNode} style={{ width: 160 }}>
                <div className={styles.head}>invoices</div>
                <div className={styles.row}>
                  <span className={styles.left}>
                    <span className={`${styles.icSpace} ${styles.icPk}`}><Icon name="key" size={12} /></span>id
                  </span>
                  <span className={styles.type}>uuid</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.left}>
                    <span className={`${styles.icSpace} ${styles.icFk}`}><Icon name="link-2" size={12} /></span>sub_id
                  </span>
                  <span className={styles.type}>uuid</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.left}><span className={styles.icSpace} />total</span>
                  <span className={styles.type}>numeric</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
