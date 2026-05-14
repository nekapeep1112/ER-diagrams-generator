import styles from './Avatar.module.css';

interface AvatarProps {
  initials?: string;
  imageUrl?: string;
  size?: number;
  className?: string;
}

function hashIndex(input: string, mod: number): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash % mod;
}

export function Avatar({ initials = '', imageUrl, size = 28, className }: AvatarProps) {
  const gradientClass = styles[`g${hashIndex(initials || imageUrl || 'x', 4)}` as 'g0' | 'g1' | 'g2' | 'g3'];
  const fontSize = Math.max(10, Math.round(size * 0.4));
  const style = { width: size, height: size, fontSize };

  return (
    <span
      className={[styles.avatar, gradientClass, className ?? ''].filter(Boolean).join(' ')}
      style={style}
      aria-hidden="true"
    >
      {imageUrl ? <img src={imageUrl} alt="" /> : initials.toUpperCase()}
    </span>
  );
}
