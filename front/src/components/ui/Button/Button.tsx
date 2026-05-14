import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon, type IconName } from '../Icon';
import styles from './Button.module.css';

type Variant = 'primary' | 'ghost' | 'ghost-sm';
type Size = 'sm' | 'md' | 'lg';
type IconPosition = 'left' | 'right';

interface CommonProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
  iconPosition?: IconPosition;
  danger?: boolean;
  className?: string;
  children?: ReactNode;
}

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
    as?: 'button';
    href?: never;
  };

type ButtonAsAnchor = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & {
    as: 'a';
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsAnchor;

const variantClass: Record<Variant, string> = {
  'primary': styles.primary,
  'ghost': styles.ghost,
  'ghost-sm': styles.ghostSm,
};

const sizeClass: Record<Size, string> = {
  'sm': styles.sizeSm,
  'md': '',
  'lg': styles.sizeLg,
};

export function Button(props: ButtonProps) {
  const {
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon,
    iconPosition = 'left',
    danger = false,
    className,
    children,
    ...rest
  } = props;

  const iconSize = variant === 'ghost-sm' || size === 'sm' ? 14 : 16;
  const classes = [
    styles.base,
    variantClass[variant],
    sizeClass[size],
    danger && variant !== 'primary' ? styles.danger : '',
    disabled || loading ? styles.disabled : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  const leftIcon =
    loading ? (
      <span className={styles.spinner}><Icon name="loader" size={iconSize} /></span>
    ) : icon && iconPosition === 'left' ? (
      <Icon name={icon} size={iconSize} />
    ) : null;

  const rightIcon =
    !loading && icon && iconPosition === 'right' ? <Icon name={icon} size={iconSize} /> : null;

  const content = (
    <>
      {leftIcon}
      {children}
      {rightIcon}
    </>
  );

  if (props.as === 'a') {
    const { as: _as, ...anchorRest } = rest as AnchorHTMLAttributes<HTMLAnchorElement> & { as?: 'a' };
    void _as;
    return (
      <a className={classes} aria-disabled={disabled || loading} {...anchorRest}>
        {content}
      </a>
    );
  }

  const { as: _as, ...buttonRest } = rest as ButtonHTMLAttributes<HTMLButtonElement> & { as?: 'button' };
  void _as;
  return (
    <button className={classes} disabled={disabled || loading} {...buttonRest}>
      {content}
    </button>
  );
}
