# ER Database Generator — Design System

**Source of truth for Claude Code.** Все токены и компоненты ниже извлечены из готовых макетов `Landing.html`, `Dashboard.html`, `Templates.html`, `TemplateDetail.html`, `Library.html`, `LibraryDetail.html`. Если возникает противоречие — побеждает этот документ + сами HTML-файлы.

Цель: новые экраны (login, register, profile, verify-email, pricing, 404, модалки, popover) должны выглядеть так, будто они из той же кодовой базы. Никаких новых токенов, никаких новых шрифтов, никаких новых акцентных цветов.

---

## 1. Direction

Cyberpunk neon dev-tool. Реферeнсы: Cursor, Vercel AI SDK, Linear, Replit Agent. Тёмный фон, hairline-бордеры, минимум gradient'ов, glow — точечно.

**Жёсткие правила:**
- Sentence case в заголовках. Никогда не Title Case, никогда не ALL CAPS (исключение — `.micro` mono labels, у них uppercase летterspacing 1.5px по системе).
- Никаких emoji в продакшен-UI. Только Lucide React (`stroke-width: 1.5`).
- Никаких декоративных частиц, mesh-gradient'ов, animated backgrounds, scanline overlays.
- Только три варианта кнопок: primary / ghost / ghost-sm. Других не делать.
- Никогда `font-weight: 700+`. Максимум 600. Базовый weight для headings — 500.
- Только два gradient на странице (primary CTA + table-node header). Если становится больше — это ошибка.

---

## 2. CSS-токены

Точные значения. Копируются в `:root` целиком, без модификаций.

```css
:root {
  /* Backgrounds */
  --bg:            #0a0a0f;   /* page base */
  --surface:       #12121a;   /* cards, sidebar, table-nodes */
  --elevated:      #1a1a26;   /* modals, dropdowns, hover surfaces */
  --input:         #0d0d14;   /* form inputs — deeper than surface */

  /* Borders */
  --border:        #1e1e2e;   /* default 1px borders */
  --border-hover:  #2a2a3e;   /* hover, focus state */
  --border-strong: #3a3a52;   /* selected / featured */

  /* Text */
  --text:          #fafafa;   /* primary, headings, button labels */
  --text-2:        #a1a1aa;   /* secondary, body */
  --muted:         #71717a;   /* captions, metadata */
  --disabled:      #52525b;   /* placeholders, disabled state */

  /* Accents */
  --cyan:          #06b6d4;   /* FK, links, primary action, active state */
  --purple:        #a855f7;   /* AI, gradient pair */
  --yellow:        #facc15;   /* PK only — semantic, reserved */
  --red:           #f43f5e;   /* errors, delete */
  --green:         #4ade80;   /* success */

  /* Effects */
  --glow:          0 0 24px rgba(6,182,212,0.2);   /* CTA, active node */
  --glow-hero:     0 0 32px rgba(6,182,212,0.2);   /* лендинг hero only */

  /* Fonts */
  --sans:          'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
  --mono:          'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
}
```

**Шрифты подключаются так:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap&subset=latin,cyrillic" rel="stylesheet">
```

---

## 3. Где какой цвет

Цвет в этой системе **семантический**. Нельзя использовать акцентный цвет «для красоты».

| Цвет | Используется только для |
|---|---|
| `--cyan` | Foreign keys в ER-нодах; primary links; active state у табов; outline у активного чата в sidebar; точка `●` у активной вкладки; cyan-tint pills (rgba(6,182,212,0.1)) для «Опубликовано» / «В библиотеке» |
| `--purple` | Парный цвет к cyan в gradient'ах. **Сольно не используется** (кроме категории-бейджа `SAAS` purple-tint в карточках) |
| `--yellow` | Primary keys в ER-нодах. Больше нигде. Не на кнопках, не на иконках предупреждений |
| `--red` | Только errors и destructive actions (Удалить). Не для warning'ов |
| `--green` | Только success-состояния и валидные строки в SQL-подсветке |

---

## 4. Где какой gradient и glow

**Gradient `linear-gradient(135deg, var(--cyan) 0%, var(--purple) 100%)` используется только:**
1. `.btn-primary` background
2. `.table-node .head` background (с углом `90deg` вместо `135deg`)
3. `.brand-mark` SVG логотипа (через `<linearGradient>` в defs)
4. Hero CTA button на лендинге

Любая другая кнопка / pill / badge / иконка — без gradient.

**Box-shadow glow `var(--glow)` используется только:**
1. Primary CTA в hover-состоянии
2. `.table-node.active` (выбранная или AI-генерируемая нода)
3. Activnый чат-item в sidebar
4. Hero CTA на лендинге (с `--glow-hero` версией 32px)

Нет glow на: cards, inputs, обычные кнопки, dropdowns, modals, toasts.

---

## 5. Типографика

```css
h1 { font-size: 48px; line-height: 1.1;  letter-spacing: -0.96px; font-weight: 500; margin: 0; }
h2 { font-size: 32px; line-height: 1.15; letter-spacing: -0.64px; font-weight: 500; margin: 0; }
h3 { font-size: 16px; line-height: 1.3;  letter-spacing: -0.16px; font-weight: 500; margin: 0; }
p  { font-size: 14px; line-height: 1.6;  color: var(--text-2);    margin: 0; }
```

Все варианты heading'ов оверрайдятся при необходимости (на финальной CTA-странице h2 может быть 40px). Но **базовая шкала именно такая** — не выдумывать промежуточные значения.

**Body text:** 14px sans-serif, line-height 1.6. Для секондари-текстов — 13px.

**Micro-label** (mono uppercase) — отдельная конструкция:

```css
.micro {
  font-family: var(--mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--muted);
  font-weight: 400;
}
```

Применяется к: метаткам секций («КАК ЭТО РАБОТАЕТ», «БИБЛИОТЕКА · ВАШИ СХЕМЫ»), заголовкам столбцов в футере, labels форм («КАТЕГОРИЯ», «ОПИСАНИЕ»), статусам в footer-bot.

---

## 6. Layout

| Token | Value |
|---|---|
| Page max-width | 1200px (`.container { max-width: 1200px; margin: 0 auto; padding: 0 32px; }`) |
| Mobile padding | 20px (≤760px) |
| Nav height | 60px |
| Tab bar height | 48px |
| Section vertical padding | 96px desktop / 64px mobile (`.block`) |

**Spacing scale:** 4, 8, 12, 16, 20, 24, 32, 48, 64, 96 px. Не выдумывать промежуточных значений (15px, 18px и т.п.).

**Border-radius scale:**
- `6px` — inputs, badges (height ≤32px)
- `8px` — buttons, small cards
- `10px` — table nodes, mini-cards
- `12px` — обычные cards
- `14px` — modals, hero blocks
- `999px` — pills, avatars

**Border width:** **1px везде**. Никаких 2px кроме `.tab.active` (cyan bottom-border 2px), `.chat-item.active` (cyan left-border 2px), focus-ring на форме.

---

## 7. Готовые компоненты (копировать как есть)

### 7.1 Buttons

```css
.btn-primary {
  display: inline-flex; align-items: center; gap: 8px;
  height: 44px; padding: 0 20px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--cyan) 0%, var(--purple) 100%);
  color: #0a0a0f;
  font-size: 14px; font-weight: 500;
  letter-spacing: -0.1px;
  box-shadow: var(--glow);
  border: none; cursor: pointer;
  transition: transform .15s, box-shadow .15s;
}
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 0 40px rgba(6,182,212,0.32); }
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }

.btn-ghost {
  display: inline-flex; align-items: center;
  height: 44px; padding: 0 18px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text);
  font-size: 14px; font-weight: 500;
  cursor: pointer;
  transition: border-color .15s, background-color .15s;
}
.btn-ghost:hover { border-color: var(--border-hover); background: var(--surface); }

.btn-ghost-sm {
  padding: 7px 14px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: transparent;
  color: var(--text);
  font-size: 13px;
  cursor: pointer;
  transition: border-color .15s;
}
.btn-ghost-sm:hover { border-color: var(--border-hover); }
```

**Destructive вариант кнопки** (для Удалить):
```css
.btn-ghost.danger { color: var(--red); }
.btn-ghost.danger:hover { background: rgba(244,63,94,0.08); border-color: rgba(244,63,94,0.3); }
```

### 7.2 Form inputs

```css
.input,
input[type="text"], input[type="email"], input[type="password"], textarea {
  width: 100%;
  height: 40px;
  background: var(--input);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0 14px;
  color: var(--text);
  font-family: var(--sans);
  font-size: 13px;
  outline: none;
  transition: border-color .15s;
}
.input:focus, input:focus, textarea:focus { border-color: var(--cyan); }
.input::placeholder, input::placeholder, textarea::placeholder { color: var(--disabled); }

textarea {
  height: auto; min-height: 84px;
  padding: 10px 14px; line-height: 1.5;
  resize: vertical;
  font-family: var(--mono); /* mono для prompt-style textarea */
}

.input.with-icon { padding-left: 38px; } /* для search-инпутов с иконкой слева */
```

**Label над полем** (обязательно):
```html
<div class="field">
  <label class="micro">ЭЛЕКТРОННАЯ ПОЧТА</label>
  <input type="email" placeholder="you@example.com">
  <div class="field-hint">Будет использован для входа</div>
</div>
```

```css
.field { margin-bottom: 18px; }
.field .micro { display: block; margin-bottom: 8px; }
.field-hint { margin-top: 6px; font-family: var(--mono); font-size: 11px; color: var(--muted); }
.field-error { margin-top: 6px; font-size: 12px; color: var(--red); }
```

### 7.3 Cards

```css
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  transition: border-color .15s;
}
.card:hover { border-color: var(--border-hover); }
```

Плотный вариант (для template-card / schema-card): `padding: 16px 18px`, `border-radius: 12px`.

### 7.4 Badges и pills

```css
/* Категория-badge (RETAIL, SAAS, CMS) — в правом углу карточек */
.badge {
  font-family: var(--mono);
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-2);
  padding: 3px 7px;
  border: 1px solid var(--border);
  border-radius: 999px;
  white-space: nowrap;
}

/* Tag-pill — для тегов схемы */
.tag-pill {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 2px 7px;
  border-radius: 999px;
  border: 1px solid var(--border);
  font-family: var(--mono);
  font-size: 11px;
  color: var(--text-2);
}
.tag-pill::before {
  content: '';
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--tag-color, var(--cyan)); /* инлайн-стилем под tag.color */
}

/* Status-pill: "Опубликовано", "В библиотеке" */
.pill-success {
  background: rgba(74,222,128,0.08);
  border: 1px solid rgba(74,222,128,0.2);
  color: var(--green);
  padding: 3px 10px;
  border-radius: 999px;
  font-family: var(--mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.pill-info { /* cyan-tint аналог */
  background: rgba(6,182,212,0.08);
  border-color: rgba(6,182,212,0.2);
  color: var(--cyan);
}
.pill-purple {  /* limit-достигнут, upgrade hint */
  background: rgba(168,85,247,0.08);
  border-color: rgba(168,85,247,0.2);
  color: var(--purple);
}
```

### 7.5 ER Table Node — **критично, не менять**

```css
.table-node {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  font-family: var(--mono);
  font-size: 12px;
  width: 200px;
}

.table-node.active {
  box-shadow: var(--glow);
  border-color: rgba(6,182,212,0.3);
}

.table-node .head {
  padding: 8px 12px;
  background: linear-gradient(90deg, var(--cyan), var(--purple));
  color: #0a0a0f;
  font-size: 10px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  font-weight: 500;
}

.table-node .row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 7px 12px;
  border-top: 1px solid var(--border);
  color: var(--text-2);
  gap: 12px;
}
.table-node .row .left {
  display: flex; align-items: center; gap: 8px;
  color: var(--text);
}
.table-node .row .type { color: var(--muted); font-size: 11px; }
.table-node .row .ic { width: 12px; height: 12px; flex: 0 0 12px; }
.ic-pk { color: var(--yellow); }
.ic-fk { color: var(--cyan); }
```

**Правило:** PK-строка содержит SVG-иконку ключа 12×12 yellow ВЛЕВО от имени колонки. FK-строка — SVG-иконку link-2 12×12 cyan ВЛЕВО. **Никаких текстовых pill-бейджей `PK` / `FK`.**

### 7.6 Nav и Footer

См. готовые `<nav class="nav">` и `<footer>` в `Landing.html`. Они идентичны на всех публичных страницах. На auth-страницах (dashboard / library / profile) в правом углу nav вместо «Войти + Регистрация» — **avatar dropdown** (см. 7.8).

### 7.7 Avatar

```css
.avatar {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3f3f55, #5a5a7a);
  flex: 0 0 28px;
  display: inline-flex; align-items: center; justify-content: center;
  font-family: var(--mono);
  font-size: 11px; font-weight: 500;
  color: var(--text);
}
```

Инициалы — первые буквы имени и фамилии (или email). Для разных пользователей цвет background gradient может вариироваться (хеш от user.id → один из 4 preset-gradient'ов).

### 7.8 Avatar dropdown (auth nav)

```html
<div class="user-menu">
  <button class="user-pill">
    <div class="avatar">МК</div>
    <svg class="chevron">…</svg>
  </button>
  <div class="user-menu-dropdown">
    <a href="/profile">Профиль</a>
    <a href="/library">Моя библиотека</a>
    <a href="/pricing">Тарифы</a>
    <div class="divider"></div>
    <button>Выйти</button>
  </div>
</div>
```

Dropdown открывается вниз, выровнен по правой стороне. `bg: var(--elevated)`, `border 1px var(--border)`, `radius 10px`, `padding 6px`, `min-width 200px`, ссылки 13px padding 8px 12px, hover bg var(--surface).

### 7.9 Tabs

```css
.tab-bar {
  display: flex; align-items: stretch;
  height: 48px;
  border-bottom: 1px solid var(--border);
}
.tab {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 0 16px;
  font-family: var(--mono);
  font-size: 12px;
  color: var(--muted);
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;   /* стыковать с нижним border'ом tab-bar'а */
  height: 48px;
  letter-spacing: 0.3px;
  cursor: pointer;
  transition: color .12s, border-color .12s;
}
.tab.active {
  color: var(--text);
  border-bottom-color: var(--cyan);
}
.tab.active::before {  /* cyan-dot before label */
  content: '';
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--cyan);
}
```

### 7.10 Modal

```css
.modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(10,10,15,0.75);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.modal {
  width: 100%; max-width: 560px;
  max-height: 85vh;
  background: var(--elevated);
  border: 1px solid var(--border-hover);
  border-radius: 14px;
  box-shadow: 0 32px 80px rgba(0,0,0,0.6);
  overflow: hidden;
  display: flex; flex-direction: column;
}
.modal-header { padding: 24px 28px 16px; border-bottom: 1px solid var(--border); }
.modal-body   { padding: 24px 28px; overflow-y: auto; flex: 1; }
.modal-footer { padding: 20px 28px; border-top: 1px solid var(--border); background: var(--surface);
                display: flex; align-items: center; justify-content: space-between; gap: 12px; }
```

### 7.11 Toast

```css
.toast {
  position: fixed;
  bottom: 28px; left: 50%;
  transform: translateX(-50%) translateY(20px);
  background: var(--elevated);
  border: 1px solid var(--border-hover);
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 13px;
  color: var(--text);
  box-shadow: 0 12px 32px rgba(0,0,0,0.5);
  display: inline-flex; align-items: center; gap: 8px;
  opacity: 0; pointer-events: none;
  transition: opacity .2s, transform .2s;
  z-index: 200;
}
.toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
.toast.error { border-left: 2px solid var(--red); }
.toast.success { border-left: 2px solid var(--green); }
```

### 7.12 Dot-grid background

Используется для ER-canvas и thumbnails template-карточек:

```css
.dot-grid {
  background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0);
  background-size: 18px 18px;
  background-color: var(--bg);
}
```

Для миниатюр — `background-size: 14px 14px`.

---

## 8. Иконки

**Только Lucide.** Размеры строго:
- 12px — inline в .table-node row (PK key, FK link-2)
- 14px — внутри кнопок ghost-sm и pill'ов
- 16px — внутри обычных кнопок, в инпутах с иконкой слева
- 20px — действия в header'ах модалок, основные nav-иконки
- 24px — максимум для декоративных в пустых состояниях
- 32–48px — empty states only

`stroke-width: 1.5` везде. Outline only, **никаких filled-вариантов**.

Часто используемые имена: `database`, `search`, `tag`, `pencil`, `trash`, `download`, `upload`, `share-2`, `copy`, `key`, `link-2`, `message-square`, `git-fork`, `arrow-up`, `arrow-down-up`, `chevron-down`, `chevron-right`, `chevron-left`, `x`, `check`, `check-circle`, `circle-alert`, `panel-left`, `lock`, `external-link`, `sticky-note`, `bookmark`, `users`, `calendar`, `clock`, `image`, `flag`, `zoom-in`, `zoom-out`, `maximize`.

---

## 9. Breakpoints

```css
/* ≥1025px: desktop default */
@media (max-width: 1024px) {
  /* Tablet: hero одной колонкой, footer 2-кол, dialects 3-кол, templates 2-кол */
}
@media (max-width: 760px) {
  /* Mobile: всё в одну колонку, container padding 20px, nav links прячутся */
}
```

В дашборде на ≤760px sidebar становится off-canvas drawer. На library / templates грид схлопывается до 1 колонки.

---

## 10. Состояния (state design)

Перечень с конкретикой — для каждого должен быть готов компонент.

| Состояние | Компонент |
|---|---|
| Loading на странице | Skeleton-блоки `bg: var(--surface)`, `border-radius: 8px`, опционально pulse-animation opacity 0.4 ↔ 1, 1.5s |
| Loading кнопки | Заменить text на Lucide `loader` 16px, animate spin 1s |
| Empty state | Centered, padding 96–120px 0, Lucide-иконка 40–48px muted, h2, body, primary CTA |
| Error (form field) | `.field-error` под полем, `border-color: var(--red)` на инпуте |
| Error (toast) | `.toast.error` с red left-border |
| Success (toast) | `.toast.success` с green left-border |
| Disabled (Pro-only) | Кнопка остаётся как secondary, прицепить Lucide `lock` 14px слева, добавить tooltip "Доступно в Pro" |
| Limit hit (5/5 schemas) | Modal по образцу `LibraryDetail.html`. Title: "Лимит бесплатного тарифа", body, primary "Перейти на Pro" + ghost "Закрыть" |

---

## 11. Что НЕ делать

- Не использовать `font-weight: 700+`
- Не использовать `Title Case` или `ALL CAPS` (кроме `.micro` mono labels)
- Не добавлять emoji в UI
- Не использовать filled-варианты Lucide-иконок
- Не выдумывать промежуточные размеры (15px, 18px, 22px font-size — это всё не из шкалы)
- Не делать "Beta" badges, sparkles ✨, или другие AI-клише
- Не делать decorative animated backgrounds
- Не использовать gradient на secondary/ghost кнопках
- Не накладывать glow на cards, inputs, dropdowns
- Не накладывать tooltip / popover поверх соседних элементов — позиционировать сбоку
- Не использовать `box-shadow` для cards (только функциональный focus / glow)

---

## 12. Готовые HTML-эталоны

При сомнениях открыть и копировать паттерны:

| Файл | Что в нём искать |
|---|---|
| `Landing.html` | Nav (anon), public footer, hero-CTA с glow, fineprint, hero glow radial bg, `.btn-primary`, `.btn-ghost`, `.card`, `.chip`, `.tmpl`, `.brand-mark` SVG |
| `Dashboard.html` | Sidebar (.sidebar / .chat-item / .avatar внизу), tabs / .tab / .tab.active, .input-shell (textarea многострочная), chat-dock, gen-chip floating, zoom-controls, .pill-success |
| `Templates.html` | Auth и anon nav-варианты, filters bar, search-box с иконкой, category chips, sort dropdown, pagination, template-card |
| `TemplateDetail.html` | Breadcrumb, sticky right column с CTA, tabs над canvas, related templates row |
| `Library.html` | Auth nav (avatar dropdown), schema-card с hover-actions, status-pill «Опубликовано», стат-строка с limit-pill purple |
| `LibraryDetail.html` | Modal (publish-as-template), modal-header / modal-body / modal-footer, tag-picker, toast, sticky right column с action-row, tooltip-card для нод |

Все 6 файлов — единственный авторитетный референс. Перед написанием нового экрана — открыть тот, чей экран ближе всего по структуре, и взять паттерн.
