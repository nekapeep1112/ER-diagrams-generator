import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import styles from './Hero.module.css';

export function Hero() {
  return (
    <section className={styles.section}>
      <div className={styles.glow} />
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.column}>
            <span className="micro">ИИ · проектирование баз данных</span>
            <h1>Проектируйте базы данных на естественном языке</h1>
            <p className={styles.lead}>
              Опишите предметную область — получите нормализованную схему, интерактивную ER­диаграмму и production­ready SQL под PostgreSQL, MySQL, SQLite, SQL Server и Oracle.
            </p>
            <div className={styles.ctas}>
              <Button variant="primary" size="lg" as="a" href="/register">Начать проектировать →</Button>
              <Button variant="ghost" size="lg" as="a" href="/templates">Открыть шаблоны</Button>
            </div>
            <p className={styles.fineprint}>Без карты. 5 схем бесплатно.</p>
          </div>

          <div className={styles.canvas} aria-hidden="true">
            <span className={styles.chip}>
              <span className={styles.chipDot} /> live preview
            </span>
            <svg className={styles.edges} viewBox="0 0 540 460" preserveAspectRatio="none">
              <path d="M 125 198 C 125 260, 200 280, 275 280" stroke="#2a2a3e" strokeWidth="1" fill="none" />
              <circle cx="275" cy="280" r="2.5" fill="#06b6d4" />
              <path d="M 424 198 C 424 260, 475 240, 475 280" stroke="#2a2a3e" strokeWidth="1" fill="none" />
              <circle cx="475" cy="280" r="2.5" fill="#06b6d4" />
            </svg>

            <div className={`${styles.floater} ${styles.f1}`}>
              <div className={styles.tableNode}>
                <div className={styles.head}>users</div>
                <div className={styles.row}>
                  <span className={styles.left}>
                    <span className={`${styles.icSpace} ${styles.icPk}`}><Icon name="key" size={12} /></span>id
                  </span>
                  <span className={styles.type}>uuid</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.left}><span className={styles.icSpace} />email</span>
                  <span className={styles.type}>varchar</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.left}><span className={styles.icSpace} />name</span>
                  <span className={styles.type}>varchar</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.left}><span className={styles.icSpace} />created_at</span>
                  <span className={styles.type}>timestamp</span>
                </div>
              </div>
            </div>

            <div className={`${styles.floater} ${styles.f2}`}>
              <div className={`${styles.tableNode} ${styles.active}`}>
                <div className={styles.head}>orders</div>
                <div className={styles.row}>
                  <span className={styles.left}>
                    <span className={`${styles.icSpace} ${styles.icPk}`}><Icon name="key" size={12} /></span>id
                  </span>
                  <span className={styles.type}>uuid</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.left}>
                    <span className={`${styles.icSpace} ${styles.icFk}`}><Icon name="link-2" size={12} /></span>user_id
                  </span>
                  <span className={styles.type}>uuid</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.left}><span className={styles.icSpace} />total</span>
                  <span className={styles.type}>numeric</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.left}><span className={styles.icSpace} />status</span>
                  <span className={styles.type}>enum</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.left}><span className={styles.icSpace} />placed_at</span>
                  <span className={styles.type}>timestamp</span>
                </div>
              </div>
            </div>

            <div className={`${styles.floater} ${styles.f3}`}>
              <div className={styles.tableNode}>
                <div className={styles.head}>products</div>
                <div className={styles.row}>
                  <span className={styles.left}>
                    <span className={`${styles.icSpace} ${styles.icPk}`}><Icon name="key" size={12} /></span>id
                  </span>
                  <span className={styles.type}>uuid</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.left}><span className={styles.icSpace} />sku</span>
                  <span className={styles.type}>varchar</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.left}><span className={styles.icSpace} />price</span>
                  <span className={styles.type}>numeric</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.left}><span className={styles.icSpace} />stock</span>
                  <span className={styles.type}>integer</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
