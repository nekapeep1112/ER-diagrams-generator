import { Button } from '@/components/ui/Button';
import styles from './FinalCTA.module.css';

export function FinalCTA() {
  return (
    <section className={styles.section}>
      <div className="container">
        <h2>Делайте схемы качественнее. И быстрее.</h2>
        <p>Бесплатно навсегда — 5 схем. Pro снимает лимит и открывает экспорт SQL.</p>
        <Button variant="primary" size="lg" as="a" href="/register" className={styles.cta}>
          Начать проектировать →
        </Button>
      </div>
    </section>
  );
}
