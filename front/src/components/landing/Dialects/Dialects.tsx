import styles from './Dialects.module.css';

interface DialectIconProps {
  className?: string;
}

function PostgresIcon({ className }: DialectIconProps) {
  return (
    <svg className={className} viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <ellipse cx="18" cy="9" rx="11" ry="4" />
      <path d="M 7 9 V 27 C 7 29.2 11.9 31 18 31 C 24.1 31 29 29.2 29 27 V 9" />
      <path d="M 7 18 C 7 20.2 11.9 22 18 22 C 24.1 22 29 20.2 29 18" />
    </svg>
  );
}

function MysqlIcon({ className }: DialectIconProps) {
  return (
    <svg className={className} viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="18" cy="18" r="12" />
      <path d="M 8 12 L 28 24" />
      <path d="M 8 24 L 28 12" />
    </svg>
  );
}

function SqliteIcon({ className }: DialectIconProps) {
  return (
    <svg className={className} viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="6" y="8" width="24" height="20" rx="2" />
      <path d="M 6 14 H 30" />
      <path d="M 6 20 H 30" />
      <path d="M 14 8 V 28" />
      <path d="M 22 8 V 28" />
    </svg>
  );
}

function SqlServerIcon({ className }: DialectIconProps) {
  return (
    <svg className={className} viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="6" y="8" width="24" height="20" rx="2" />
      <path d="M 6 16 H 30" />
      <path d="M 6 24 H 30" />
      <circle cx="14" cy="20" r="2" />
    </svg>
  );
}

function OracleIcon({ className }: DialectIconProps) {
  return (
    <svg className={className} viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <ellipse cx="18" cy="18" rx="13" ry="8" />
      <ellipse cx="18" cy="18" rx="7" ry="4" />
    </svg>
  );
}

const DIALECTS = [
  { name: 'PostgreSQL', meta: 'v9 — 16', Icon: PostgresIcon },
  { name: 'MySQL', meta: 'v5.7 — 8', Icon: MysqlIcon },
  { name: 'SQLite', meta: 'v3', Icon: SqliteIcon },
  { name: 'SQL Server', meta: '2017 — 22', Icon: SqlServerIcon },
  { name: 'Oracle', meta: '11g — 23c', Icon: OracleIcon },
] as const;

export function Dialects() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.head}>
          <span className="micro">Диалекты</span>
          <h2>Генерация SQL под любой диалект</h2>
          <p>Переключайте целевую СУБД без переписывания. Идиоматичный DDL, корректный маппинг типов и дефолты под каждый диалект.</p>
        </div>

        <div className={styles.grid}>
          {DIALECTS.map(({ name, meta, Icon: IconComp }) => (
            <div key={name} className={styles.chip}>
              <IconComp className={styles.icon} />
              <div>
                <div className={styles.name}>{name}</div>
                <div className={styles.meta}>{meta}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
