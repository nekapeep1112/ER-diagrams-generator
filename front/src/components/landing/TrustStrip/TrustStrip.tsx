import styles from './TrustStrip.module.css';

export function TrustStrip() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.inner}>
          <div className={styles.avatars} aria-hidden="true">
            <span className={`${styles.av} ${styles.av1}`} />
            <span className={`${styles.av} ${styles.av2}`} />
            <span className={`${styles.av} ${styles.av3}`} />
          </div>
          <span>Уже используют indie-разработчики, студенты и более 200 команд</span>
        </div>
      </div>
    </section>
  );
}
