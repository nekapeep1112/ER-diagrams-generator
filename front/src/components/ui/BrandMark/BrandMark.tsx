import styles from './BrandMark.module.css';

interface BrandMarkProps {
  size?: number;
  className?: string;
}

export function BrandMark({ size = 22, className }: BrandMarkProps) {
  return (
    <svg
      className={[styles.brandMark, className].filter(Boolean).join(' ')}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="brandGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#06b6d4" />
          <stop offset="1" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#brandGrad)" strokeWidth="1.2" />
      <rect x="6" y="6" width="12" height="3" rx="1" fill="url(#brandGrad)" />
      <rect x="6" y="11" width="12" height="1" rx="0.5" fill="#a1a1aa" />
      <rect x="6" y="14" width="12" height="1" rx="0.5" fill="#a1a1aa" />
      <rect x="6" y="17" width="8" height="1" rx="0.5" fill="#a1a1aa" />
    </svg>
  );
}
