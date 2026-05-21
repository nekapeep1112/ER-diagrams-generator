'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import styles from './page.module.css';

type Billing = 'monthly' | 'yearly';

interface Plan {
  id: 'free' | 'pro';
  name: string;
  tagline: string;
  priceMonthly: number;
  priceYearly: number;
  cta: string;
  href: string;
  featured?: boolean;
  features: { icon: IconName; text: string }[];
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Чтобы попробовать инструмент',
    priceMonthly: 0,
    priceYearly: 0,
    cta: 'Начать бесплатно',
    href: '/register',
    features: [
      { icon: 'database', text: 'До 5 схем в библиотеке' },
      { icon: 'sparkles', text: 'Все диалекты SQL' },
      { icon: 'message-square', text: 'AI-чат без ограничений' },
      { icon: 'image', text: 'Экспорт PNG диаграммы' },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Для частых пользователей',
    priceMonthly: 9,
    priceYearly: 84,
    cta: 'Перейти на Pro',
    href: '/register?plan=pro',
    featured: true,
    features: [
      { icon: 'database', text: 'Неограниченные схемы' },
      { icon: 'download', text: 'Экспорт SQL в файл' },
      { icon: 'sticky-note', text: 'Заметки к таблицам и схемам' },
      { icon: 'share-2', text: 'Публикация шаблонов' },
      { icon: 'zap', text: 'Приоритетная очередь генерации' },
      { icon: 'history', text: 'История чатов без срока' },
    ],
  },
];

const FAQ = [
  {
    q: 'Можно ли отменить подписку в любой момент?',
    a: 'Да. Возврата за неиспользованный период нет, но после отмены доступ к Pro сохраняется до конца оплаченного периода. После — аккаунт переходит на Free.',
  },
  {
    q: 'Что будет с моими схемами, если я перейду с Pro на Free?',
    a: 'Все схемы останутся в библиотеке только для чтения. Сверх лимита Free (5 штук) новые схемы создавать нельзя — нужно удалить старые или вернуться на Pro.',
  },
  {
    q: 'Принимаете ли вы оплату из России?',
    a: 'Принимаем карты Visa/Mastercard/МИР через ЮKassa. Для юрлиц — счёт на оплату по запросу через sales@er-database.app.',
  },
  {
    q: 'Можно ли использовать в коммерческих проектах?',
    a: 'Да, сгенерированные схемы и SQL ваши — используйте где угодно, включая коммерческие продукты. Без атрибуции.',
  },
];

export default function PricingPage() {
  const [billing, setBilling] = useState<Billing>('monthly');

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.glow} aria-hidden="true" />
        <div className="container">
          <div className={styles.heroInner}>
            <span className="micro">Тарифы</span>
            <h1 className={styles.heroTitle}>Простые цены без сюрпризов</h1>
            <p className={styles.heroLead}>
              Начните бесплатно, перейдите на Pro когда понадобится больше — отменить можно в любой момент.
            </p>

            <div className={styles.toggle} role="tablist" aria-label="Период оплаты">
              <button
                type="button"
                role="tab"
                aria-selected={billing === 'monthly'}
                className={`${styles.toggleBtn} ${billing === 'monthly' ? styles.toggleBtnActive : ''}`}
                onClick={() => setBilling('monthly')}
              >
                Помесячно
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={billing === 'yearly'}
                className={`${styles.toggleBtn} ${billing === 'yearly' ? styles.toggleBtnActive : ''}`}
                onClick={() => setBilling('yearly')}
              >
                Раз в год
                <span className={styles.toggleSave}>−22%</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.plansSection}>
        <div className="container">
          <div className={styles.plansGrid}>
            {PLANS.map((plan) => (
              <PlanCard key={plan.id} plan={plan} billing={billing} />
            ))}
          </div>
        </div>
      </section>

      <section className={styles.compareSection}>
        <div className="container">
          <div className={styles.compareHead}>
            <span className="micro">Сравнение</span>
            <h2>Что входит в каждый план</h2>
          </div>
          <div className={styles.compareTable} role="table">
            <div className={styles.compareRow} role="row">
              <div className={styles.compareCell} role="columnheader" />
              <div className={styles.compareCell} role="columnheader">Free</div>
              <div className={styles.compareCell} role="columnheader">Pro</div>
            </div>
            <CompareRow label="Схем в библиотеке" values={['5', '∞']} />
            <CompareRow label="Диалекты SQL" values={['Все', 'Все']} />
            <CompareRow label="Экспорт PNG" values={[true, true]} />
            <CompareRow label="Экспорт SQL-файлом" values={[false, true]} />
            <CompareRow label="Заметки к таблицам" values={[false, true]} />
            <CompareRow label="Публикация шаблонов" values={[false, true]} />
            <CompareRow label="Приоритетная генерация" values={[false, true]} />
            <CompareRow label="История чатов без срока" values={[false, true]} />
            <CompareRow label="Поддержка" values={['Сообщество', 'Email']} />
          </div>
        </div>
      </section>

      <section className={styles.faqSection}>
        <div className="container">
          <div className={styles.faqHead}>
            <span className="micro">FAQ</span>
            <h2>Частые вопросы</h2>
          </div>
          <div className={styles.faqGrid}>
            {FAQ.map((item) => (
              <div key={item.q} className={styles.faqItem}>
                <h3 className={styles.faqQ}>{item.q}</h3>
                <p className={styles.faqA}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaCard}>
            <h2 className={styles.ctaTitle}>Начните с бесплатного плана за минуту</h2>
            <p className={styles.ctaLead}>
              Без карты, без обязательств. Перейти на Pro можно в любой момент.
            </p>
            <div className={styles.ctaRow}>
              <Button variant="primary" size="lg" as="a" href="/register">
                Создать аккаунт →
              </Button>
              <Button variant="ghost" size="lg" as="a" href="/templates">
                Открыть шаблоны
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function PlanCard({ plan, billing }: { plan: Plan; billing: Billing }) {
  const price = billing === 'monthly' ? plan.priceMonthly : Math.round(plan.priceYearly / 12);
  const yearlyHint =
    billing === 'yearly' && plan.priceYearly > 0
      ? `$${plan.priceYearly} в год`
      : null;
  const isFree = plan.priceMonthly === 0;

  return (
    <div
      className={`${styles.card} ${plan.featured ? styles.cardFeatured : ''}`}
    >
      {plan.featured && (
        <div className={styles.cardBadge}>
          <Pill variant="info">Популярный</Pill>
        </div>
      )}
      <div className={styles.cardHead}>
        <h3 className={styles.cardName}>{plan.name}</h3>
        <p className={styles.cardTag}>{plan.tagline}</p>
      </div>
      <div className={styles.cardPrice}>
        {isFree ? (
          <span className={styles.priceValue}>$0</span>
        ) : (
          <>
            <span className={styles.priceValue}>${price}</span>
            <span className={styles.pricePer}>/мес</span>
          </>
        )}
        {yearlyHint && <div className={styles.priceHint}>{yearlyHint}</div>}
      </div>
      <Button
        variant={plan.featured ? 'primary' : 'ghost'}
        size="md"
        as="a"
        href={plan.href}
        className={styles.cardCta}
      >
        {plan.cta}
      </Button>
      <ul className={styles.cardList}>
        {plan.features.map((f) => (
          <li key={f.text} className={styles.cardItem}>
            <Icon name={f.icon} size={14} className={styles.cardItemIcon} />
            <span>{f.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CompareRow({
  label,
  values,
}: {
  label: string;
  values: (boolean | string)[];
}) {
  return (
    <div className={styles.compareRow} role="row">
      <div className={`${styles.compareCell} ${styles.compareLabel}`} role="rowheader">
        {label}
      </div>
      {values.map((v, i) => (
        <div key={i} className={styles.compareCell} role="cell">
          {typeof v === 'boolean' ? (
            v ? (
              <Icon name="check" size={16} className={styles.checkIcon} />
            ) : (
              <span className={styles.dashIcon}>—</span>
            )
          ) : (
            <span className={styles.compareValue}>{v}</span>
          )}
        </div>
      ))}
    </div>
  );
}
