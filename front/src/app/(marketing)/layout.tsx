import type { Metadata } from 'next';
import './marketing.css';

export const metadata: Metadata = {
  title: 'ERgen — проектируй базы данных словами',
  description:
    'AI-инструмент для проектирования БД: опиши предметную область — получи интерактивную ER-диаграмму и SQL под 5 диалектов.',
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="marketing">{children}</div>;
}
