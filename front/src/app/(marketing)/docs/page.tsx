'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import styles from './page.module.css';

interface Section {
  id: string;
  title: string;
  icon: IconName;
  content: ReactNode;
}

const SECTIONS: Section[] = [
  {
    id: 'intro',
    title: 'Что это',
    icon: 'database',
    content: (
      <>
        <p className={styles.lead}>
          ER Database — AI-инструмент для проектирования баз данных через чат.
          Опишите предметную область простым русским языком — получите
          нормализованную ER-схему, интерактивную диаграмму и production-ready SQL.
        </p>
        <ul className={styles.bullets}>
          <li>Понимает домены — биллинг, e-commerce, CMS, IoT и десятки других.</li>
          <li>Поддерживает PostgreSQL, MySQL, SQLite, SQL Server и Oracle.</li>
          <li>Сохраняет схемы в библиотеку, позволяет публиковать как шаблоны.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'quick-start',
    title: 'Быстрый старт',
    icon: 'zap',
    content: (
      <ol className={styles.steps}>
        <li>
          <strong>Зарегистрируйтесь</strong> через email или GitHub OAuth — без карты.
        </li>
        <li>
          <strong>Создайте чат</strong> — на дашборде в сайдбаре нажмите «+ Новый чат».
        </li>
        <li>
          <strong>Опишите задачу</strong> в окне чата, например:{' '}
          <code className={styles.code}>«биллинг SaaS с тарифами и подписками»</code>.
          Через 5–15 секунд появится диаграмма и SQL.
        </li>
        <li>
          <strong>Итерируйте</strong>: «добавь таблицу налогов», «сделай user_id NOT NULL»,
          «переименуй orders в invoices» — модель помнит контекст.
        </li>
        <li>
          <strong>Сохраните</strong> в библиотеку, чтобы добавлять теги, заметки и
          публиковать как шаблон.
        </li>
      </ol>
    ),
  },
  {
    id: 'prompts',
    title: 'Пишем промпт для AI',
    icon: 'sparkles',
    content: (
      <>
        <p>
          Чем конкретнее описание — тем точнее схема. Полезно указать:
        </p>
        <ul className={styles.bullets}>
          <li>
            <strong>Домен и масштаб</strong> — «небольшой блог», «маркетплейс на 1М SKU».
          </li>
          <li>
            <strong>Ключевые сущности</strong> — «пользователи, посты, комментарии, лайки».
          </li>
          <li>
            <strong>Связи</strong> — «у пользователя много заказов, у заказа много позиций».
          </li>
          <li>
            <strong>Ограничения</strong> — «email уникальный», «soft-delete для users».
          </li>
        </ul>
        <div className={styles.calloutInfo}>
          <Icon name="sparkles" size={14} />
          <span>
            Если результат не нравится — не начинайте с нуля. Напишите «измени X на Y»
            или «добавь Z». Модель использует прошлую схему как стартовую.
          </span>
        </div>
      </>
    ),
  },
  {
    id: 'diagram',
    title: 'ER-диаграмма',
    icon: 'maximize',
    content: (
      <>
        <p>Диаграмма интерактивна — её можно перетаскивать, масштабировать и экспортировать.</p>
        <div className={styles.kbdGrid}>
          <KbdRow keys={['ЛКМ + drag']} desc="Переместить ноду" />
          <KbdRow keys={['Колесо мыши']} desc="Зум" />
          <KbdRow keys={['Пробел + drag']} desc="Панорама холста" />
          <KbdRow keys={['Кнопка', '⤢']} desc="Уместить всё в экран" />
        </div>
        <p>
          Экспорт PNG — кнопка справа в шапке вкладки «Диаграмма» на дашборде или
          в боковой панели страницы схемы в библиотеке. Картинка экспортируется в
          PNG с прозрачным фоном схемы и 2× pixel ratio для Retina.
        </p>
      </>
    ),
  },
  {
    id: 'library',
    title: 'Библиотека и теги',
    icon: 'bookmark',
    content: (
      <>
        <p>
          Сохранённые схемы лежат в{' '}
          <strong>Моя библиотека</strong>. Каждая схема — это снимок текущего er_data
          и SQL: его можно открыть в редакторе, переименовать, разметить тегами или удалить.
        </p>
        <ul className={styles.bullets}>
          <li>
            <strong>Теги</strong> — добавляются на странице схемы. Можно выбрать
            из системных (saas, e-commerce, ...) или создать свои.
          </li>
          <li>
            <strong>Открыть в редакторе</strong> — клонирует схему в новый чат с
            seed-сообщением, чтобы AI знал контекст. Изменения не затирают оригинал.
          </li>
          <li>
            <strong>Удаление</strong> — необратимо. Заметки и публикация удаляются каскадно.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'templates',
    title: 'Публичные шаблоны',
    icon: 'share-2',
    content: (
      <>
        <p>
          Любую сохранённую схему можно <strong>опубликовать как шаблон</strong> в галерее{' '}
          <code className={styles.code}>/templates</code>. Другие пользователи смогут
          форкнуть её в свою библиотеку и итерировать дальше.
        </p>
        <div className={styles.calloutWarn}>
          <Icon name="circle-alert" size={14} />
          <span>
            Перед публикацией убедитесь, что в схеме нет приватных данных или
            названий из реальных проектов. Снять публикацию можно в любой момент.
          </span>
        </div>
        <p>
          Форки увеличивают счётчик у автора оригинала, но содержимое чужих форков
          остаётся приватным — автор шаблона их не видит.
        </p>
      </>
    ),
  },
  {
    id: 'notes',
    title: 'Заметки',
    icon: 'sticky-note',
    content: (
      <>
        <p>
          Заметки доступны на странице схемы в библиотеке (вкладка «Заметки»). Их можно
          привязать к конкретной таблице или к схеме целиком (General).
        </p>
        <ul className={styles.bullets}>
          <li>
            <strong>Типы</strong>: Info, Warning, Idea, TODO — для визуальной группировки.
          </li>
          <li>
            <strong>Маркдаун</strong> — пока обычный текст, до 2000 символов.
          </li>
          <li>
            При публикации схемы как шаблона ваши заметки <strong>не утекают</strong> —
            это приватная аннотация.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'sql',
    title: 'Диалекты SQL',
    icon: 'download',
    content: (
      <>
        <p>
          Выбор диалекта влияет на типы данных, синтаксис AUTO_INCREMENT/SERIAL,
          ограничения, кавычки идентификаторов и DDL для индексов.
        </p>
        <div className={styles.dialectsGrid}>
          <DialectCard name="PostgreSQL" hint="SERIAL, JSONB, EXCLUDE, partial индексы" />
          <DialectCard name="MySQL" hint="AUTO_INCREMENT, ENGINE=InnoDB" />
          <DialectCard name="SQLite" hint="INTEGER PRIMARY KEY, упрощённые типы" />
          <DialectCard name="SQL Server" hint="IDENTITY, NVARCHAR, схемы" />
          <DialectCard name="Oracle" hint="NUMBER, VARCHAR2, sequence + trigger" />
        </div>
      </>
    ),
  },
  {
    id: 'limits',
    title: 'Тарифы и лимиты',
    icon: 'lock',
    content: (
      <>
        <div className={styles.limitsGrid}>
          <LimitRow plan="Free" pill="neutral" items={['5 схем', 'Все диалекты', 'Экспорт PNG']} />
          <LimitRow
            plan="Pro"
            pill="info"
            items={[
              'Безлимит схем',
              'Экспорт SQL-файлом',
              'Заметки',
              'Публикация шаблонов',
              'Приоритетная очередь',
            ]}
          />
        </div>
        <p>
          Подробнее — на странице{' '}
          <a className={styles.link} href="/pricing">
            тарифов
          </a>
          . Отмена возможна в любой момент, доступ сохраняется до конца оплаченного периода.
        </p>
      </>
    ),
  },
  {
    id: 'shortcuts',
    title: 'Горячие клавиши',
    icon: 'key',
    content: (
      <div className={styles.kbdGrid}>
        <KbdRow keys={['Ctrl/⌘', 'B']} desc="Свернуть/развернуть сайдбар" />
        <KbdRow keys={['Esc']} desc="Закрыть модалку или выпадающее меню" />
        <KbdRow keys={['Enter']} desc="Подтвердить переименование чата" />
        <KbdRow keys={['Shift', 'Enter']} desc="Перенос строки в чате (вместо отправки)" />
      </div>
    ),
  },
  {
    id: 'faq',
    title: 'FAQ',
    icon: 'message-square',
    content: (
      <div className={styles.faqList}>
        <FaqItem
          q="Что делать, если AI сгенерировал плохую схему?"
          a="Опишите проблему текстом в том же чате — «убери таблицу X», «сделай поле email уникальным», «нормализуй orders». Модель помнит предыдущий результат и применит правки поверх."
        />
        <FaqItem
          q="Можно ли импортировать существующий SQL?"
          a="Пока нет, но в роадмапе. Сейчас опишите доменную модель словами, и AI сгенерирует SQL с нуля."
        />
        <FaqItem
          q="Где хранятся мои данные?"
          a="Метаданные схем — в нашей PostgreSQL-базе. Сами схемы и SQL — JSON-поля. Промпты к OpenAI отправляются с системным контекстом, но не сохраняются на их стороне для обучения."
        />
        <FaqItem
          q="Как удалить аккаунт?"
          a="Напишите на support@er-database.app — удалим аккаунт и все связанные данные в течение 7 дней."
        />
      </div>
    ),
  },
];

export default function DocsPage() {
  const [activeId, setActiveId] = useState<string>(SECTIONS[0].id);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const root = contentRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Берём самую верхнюю видимую секцию
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0,
      },
    );

    const headers = root.querySelectorAll<HTMLElement>('[data-section-id]');
    headers.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.glow} aria-hidden="true" />
        <div className="container">
          <div className={styles.heroInner}>
            <span className="micro">Документация</span>
            <h1 className={styles.heroTitle}>Всё, что нужно для старта</h1>
            <p className={styles.heroLead}>
              Короткие руководства по фичам, советы для AI-промптов и ответы на частые вопросы.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.body}>
        <div className={`container ${styles.layout}`}>
          <aside className={styles.toc} aria-label="Содержание">
            <div className={styles.tocSticky}>
              <div className={`micro ${styles.tocLabel}`}>На этой странице</div>
              <ul className={styles.tocList}>
                {SECTIONS.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className={`${styles.tocLink} ${
                        activeId === s.id ? styles.tocLinkActive : ''
                      }`}
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className={styles.content} ref={contentRef}>
            {SECTIONS.map((s) => (
              <article key={s.id} id={s.id} data-section-id={s.id} className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <span className={styles.sectionIcon}>
                    <Icon name={s.icon} size={16} />
                  </span>
                  {s.title}
                </h2>
                <div className={styles.sectionBody}>{s.content}</div>
              </article>
            ))}

            <div className={styles.footerCta}>
              <h3>Не нашли ответ?</h3>
              <p>
                Напишите на{' '}
                <a className={styles.link} href="mailto:support@er-database.app">
                  support@er-database.app
                </a>{' '}
                — обычно отвечаем в течение рабочего дня.
              </p>
              <div className={styles.footerCtaRow}>
                <Button variant="primary" size="md" as="a" href="/register">
                  Создать аккаунт
                </Button>
                <Button variant="ghost" size="md" as="a" href="/templates">
                  Посмотреть шаблоны
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function KbdRow({ keys, desc }: { keys: string[]; desc: string }) {
  return (
    <div className={styles.kbdRow}>
      <div className={styles.kbdKeys}>
        {keys.map((k, i) => (
          <span key={k + i}>
            <kbd className={styles.kbd}>{k}</kbd>
            {i < keys.length - 1 && <span className={styles.kbdSep}>+</span>}
          </span>
        ))}
      </div>
      <span className={styles.kbdDesc}>{desc}</span>
    </div>
  );
}

function DialectCard({ name, hint }: { name: string; hint: string }) {
  return (
    <div className={styles.dialectCard}>
      <div className={styles.dialectName}>{name}</div>
      <div className={styles.dialectHint}>{hint}</div>
    </div>
  );
}

function LimitRow({
  plan,
  pill,
  items,
}: {
  plan: string;
  pill: 'neutral' | 'info';
  items: string[];
}) {
  return (
    <div className={styles.limitRow}>
      <Pill variant={pill}>{plan}</Pill>
      <ul className={styles.limitList}>
        {items.map((it) => (
          <li key={it}>
            <Icon name="check" size={12} className={styles.checkIcon} />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div className={styles.faqItem}>
      <h4 className={styles.faqQ}>{q}</h4>
      <p className={styles.faqA}>{a}</p>
    </div>
  );
}
