import styles from './HowItWorks.module.css';

export function HowItWorks() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.head}>
          <span className="micro">Как это работает</span>
          <h2>От описания до готовой схемы — за три шага</h2>
        </div>

        <div className={styles.steps}>
          <div className={styles.card}>
            <span className={styles.stepNum}>01 / опишите</span>
            <h3>Расскажите, что нужно</h3>
            <p>Одного предложения достаточно. Уточняйте по мере необходимости.</p>
            <div className={styles.preview}>
              <div className={styles.term}>
                <div className={styles.bar}><i /><i /><i /></div>
                <div className={styles.line}>~ describe schema</div>
                <div className={styles.line}>
                  <span className={styles.linePromptCmd}>интернет-магазин:</span>{' '}
                  <span className={styles.lineContent}>пользователи, заказы, товары</span>
                  <span className={styles.caret} />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <span className={styles.stepNum}>02 / сгенерируйте</span>
            <h3>Получите нормализованную ER­диаграмму</h3>
            <p>Таблицы, типы и связи — выведены и расположены автоматически.</p>
            <div className={styles.preview}>
              <div className={styles.miniEr} aria-hidden="true">
                <div className={styles.miniTable}>
                  <div className={styles.miniHead}>users</div>
                  <div className={styles.miniRow}>
                    <span className={styles.miniLbl}>id</span>
                    <span>uuid</span>
                  </div>
                  <div className={styles.miniRow}>
                    <span className={styles.miniLbl}>email</span>
                    <span>varchar</span>
                  </div>
                </div>
                <svg className={styles.miniEdges} viewBox="0 0 200 132" preserveAspectRatio="none">
                  <path d="M 70 66 C 100 66, 100 66, 130 66" stroke="#2a2a3e" strokeWidth="1" fill="none" />
                  <circle cx="130" cy="66" r="2" fill="#06b6d4" />
                </svg>
                <div className={styles.miniTable}>
                  <div className={styles.miniHead}>orders</div>
                  <div className={styles.miniRow}>
                    <span className={styles.miniLbl}>id</span>
                    <span>uuid</span>
                  </div>
                  <div className={styles.miniRow}>
                    <span className={styles.miniLbl}>user_id</span>
                    <span>uuid</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <span className={styles.stepNum}>03 / экспортируйте</span>
            <h3>Скопируйте production-SQL</h3>
            <p>Выберите диалект — получите чистый исполняемый DDL.</p>
            <div className={styles.preview}>
              <pre className={styles.code}>
<span className={styles.cm}>{`-- postgres`}</span>{`\n`}
<span className={styles.kw}>{`CREATE TABLE`}</span>{` users (\n  id      `}<span className={styles.ty}>{`UUID`}</span>{` `}<span className={styles.kw}>{`PRIMARY KEY`}</span>{`,\n  email   `}<span className={styles.ty}>{`VARCHAR(255)`}</span>{` `}<span className={styles.kw}>{`UNIQUE`}</span>{`,\n  name    `}<span className={styles.ty}>{`VARCHAR(120)`}</span>{`,\n  created `}<span className={styles.ty}>{`TIMESTAMPTZ`}</span>{` `}<span className={styles.kw}>{`DEFAULT`}</span>{` `}<span className={styles.str}>{`'now()'`}</span>{`\n);`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
