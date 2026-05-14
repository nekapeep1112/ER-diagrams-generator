import { iconMap, type IconName } from './iconMap';

interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function Icon({ name, size = 16, strokeWidth = 1.5, className }: IconProps) {
  const LucideComponent = iconMap[name];
  return <LucideComponent size={size} strokeWidth={strokeWidth} className={className} aria-hidden="true" />;
}
