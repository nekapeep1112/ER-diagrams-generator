import type { TextareaHTMLAttributes } from 'react';
import styles from './Textarea.module.css';

interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  mono?: boolean;
  error?: boolean;
  className?: string;
}

export function Textarea({ mono = true, error, className, ...rest }: TextareaProps) {
  const classes = [
    styles.textarea,
    mono ? styles.mono : styles.sans,
    error ? styles.error : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');
  return <textarea className={classes} {...rest} />;
}
